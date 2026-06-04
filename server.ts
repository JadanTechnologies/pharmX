import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { analyzePrescriptionImage, checkDrugInteractions, generateInventoryForecast } from "./server/gemini";
import { UserRole } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup JSON and URL payload parsers - large limit to handle prescription base64 uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Helper middleware to log actions automatically with the active user context
  const getContextUser = (req: express.Request) => {
    const userId = req.headers['x-user-id'] as string || 'usr_anonymous';
    const email = req.headers['x-user-email'] as string || 'anonymous@pharmacy.com';
    const role = (req.headers['x-user-role'] as UserRole) || 'cashier';
    const name = req.headers['x-user-name'] as string || 'Anonymous Guest';
    return { userId, email, role, name };
  };

  const hasPermission = (user: { role: UserRole; permissions?: string[] }, permKey: string) => {
    return user.role === 'admin' || (user.permissions && user.permissions.includes(permKey));
  };

  const requirePermission = (permKey: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getContextUser(req);
    if (!hasPermission(user, permKey)) {
      return res.status(403).json({ error: `Access Denied: Missing required permission '${permKey}'.` });
    }
    next();
  };

  // ==========================================
  // Auth Endpoints
  // ==========================================
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    // Accept either 'pharmacy123' or 'admin123' for maximum ease in this terminal sandbox
    if (password !== 'pharmacy123' && password !== 'admin123') {
      return res.status(401).json({ error: "Invalid passcode. Hint: Use 'admin123' or 'pharmacy123'." });
    }

    const normalizedEmail = email.toLowerCase().replace('@pharmapos.com', '@pharmacy.com');
    const matchedUser = db.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);
    if (!matchedUser) {
      return res.status(404).json({ error: "User profile not found. Quick Profiles match with alice@pharmacy.com / admin@pharmacy.com, pharmacist@pharmacy.com, or cashier@pharmacy.com." });
    }

    // Log the event
    db.addLog(
      matchedUser.id, 
      matchedUser.email, 
      matchedUser.role, 
      "User Sign In", 
      `Authorized successfully on branch ${matchedUser.branchId}`
    );

    res.json({
      user: matchedUser,
      token: `demo-jwt-token-for-${matchedUser.id}`
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    const user = getContextUser(req);
    db.addLog(user.userId, user.email, user.role, "User Sign Out", "Session ended explicitly by user control.");
    res.json({ success: true });
  });


  // ==========================================
  // Drug Endpoints
  // ==========================================
  app.get("/api/drugs", (req, res) => {
    res.json(db.getDrugs());
  });

  app.post("/api/drugs", (req, res) => {
    const user = getContextUser(req);
    
    // Server-side guard: Only admin is permitted to add a medication
    if (user.role.toLowerCase() !== 'admin' && !(user.permissions && user.permissions.includes('inventory_write'))) {
      return res.status(403).json({ error: "Access Denied: Only administrators or staff with inventory write authorization are permitted to modify medications." });
    }

    const drugData = req.body;

    const newDrug = {
      id: `drg_${Date.now()}`,
      ...drugData,
      quantity: Number(drugData.quantity || 0),
      costPrice: Number(drugData.costPrice || 0),
      sellingPrice: Number(drugData.sellingPrice || 0),
      lowStockThreshold: Number(drugData.lowStockThreshold || 10)
    };

    db.addDrug(newDrug);
    db.addLog(user.userId, user.email, user.role, "Create Drug", `Catalogued new drug '${newDrug.name}' Batch ${newDrug.batchNumber}`);
    res.status(201).json(newDrug);
  });

  app.put("/api/drugs/:id", (req, res) => {
    const user = getContextUser(req);
    const { id } = req.params;
    const updateData = req.body;

    const existingDrug = db.getDrugById(id);
    if (!existingDrug) {
      return res.status(404).json({ error: "Drug item not found" });
    }

    const updatedFields: any = { ...updateData };
    if (updateData.quantity !== undefined) updatedFields.quantity = Number(updateData.quantity);
    if (updateData.costPrice !== undefined) updatedFields.costPrice = Number(updateData.costPrice);
    if (updateData.sellingPrice !== undefined) updatedFields.sellingPrice = Number(updateData.sellingPrice);
    if (updateData.lowStockThreshold !== undefined) updatedFields.lowStockThreshold = Number(updateData.lowStockThreshold);

    db.updateDrug(id, updatedFields);
    
    // Log inventory changes specifically if quantity changed
    let logMessage = `Modified details for drug '${existingDrug.name}'`;
    if (updateData.quantity !== undefined && updateData.quantity !== existingDrug.quantity) {
      logMessage = `Updated stock quantity for drug '${existingDrug.name}' from ${existingDrug.quantity} to ${updateData.quantity}`;
    }

    db.addLog(user.userId, user.email, user.role, "Update Drug", logMessage);
    res.json(db.getDrugById(id));
  });

  app.delete("/api/drugs/:id", (req, res) => {
    const user = getContextUser(req);
    const { id } = req.params;
    const existingDrug = db.getDrugById(id);
    
    if (!existingDrug) {
      return res.status(404).json({ error: "Drug item not found" });
    }

    db.deleteDrug(id);
    db.addLog(user.userId, user.email, user.role, "Delete Drug", `De-catalogued drug '${existingDrug.name}' Batch ${existingDrug.batchNumber}`);
    res.json({ success: true });
  });


  // ==========================================
  // Supplier & Purchase Management
  // ==========================================
  app.get("/api/suppliers", (req, res) => {
    res.json(db.getSuppliers());
  });

  app.post("/api/suppliers", (req, res) => {
    const user = getContextUser(req);
    const supplierData = req.body;

    const newSupplier = {
      id: `sup_${Date.now()}`,
      balanceDue: 0,
      ...supplierData
    };

    db.addSupplier(newSupplier);
    db.addLog(user.userId, user.email, user.role, "Register Supplier", `Onboarded vendor ${newSupplier.name}`);
    res.status(201).json(newSupplier);
  });

  app.get("/api/purchase-orders", (req, res) => {
    res.json(db.getPurchaseOrders());
  });

  app.post("/api/purchase-orders", (req, res) => {
    const user = getContextUser(req);
    const { supplierId, items } = req.body;

    const supplier = db.getSuppliers().find(s => s.id === supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not registered in systems" });
    }

    let total = 0;
    const poItems = items.map((item: any) => {
      const drug = db.getDrugById(item.drugId);
      const cost = drug ? drug.costPrice : Number(item.costPrice || 0);
      const name = drug ? drug.name : item.name;
      const subtotal = cost * Number(item.quantity);
      total += subtotal;
      return {
        drugId: item.drugId,
        name,
        quantity: Number(item.quantity),
        costPrice: cost
      };
    });

    const newPO = {
      id: `po_${Date.now()}`,
      orderNumber: `PO-2026-00${db.getPurchaseOrders().length + 10}`,
      supplierId,
      supplierName: supplier.name,
      orderDate: new Date().toISOString().slice(0, 10),
      status: 'pending' as const,
      items: poItems,
      totalCost: total,
      branchId: user.userId === 'usr_4' ? 'branch_2' : 'branch_1' // Match current branch role context
    };

    db.addPurchaseOrder(newPO);
    db.addLog(user.userId, user.email, user.role, "Create Purchase Order", `Created purchase order ${newPO.orderNumber} for supplier ${supplier.name} totaling $${total.toFixed(2)}`);
    res.status(201).json(newPO);
  });

  app.put("/api/purchase-orders/:id/status", (req, res) => {
    const user = getContextUser(req);
    const { id } = req.params;
    const { status } = req.body;

    const po = db.getPurchaseOrders().find(p => p.id === id);
    if (!po) {
      return res.status(404).json({ error: "Purchase Order not found" });
    }

    db.updatePurchaseOrder(id, status);
    db.addLog(user.userId, user.email, user.role, "Update PO Status", `Transitioned order ${po.orderNumber} status from '${po.status}' to '${status}'`);
    res.json({ success: true, po });
  });


  // ==========================================
  // POS Checkout System
  // ==========================================
  app.get("/api/sales", (req, res) => {
    res.json(db.getSales());
  });

  app.post("/api/sales/checkout", (req, res) => {
    const user = getContextUser(req);
    const { customerName, customerPhone, items, subtotal, tax, discount, total, paymentMethod, prescriptionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "POS Cart cannot be empty for checkouts." });
    }

    // Safety verify: decrement counts, guard stock out
    for (const item of items) {
      const drug = db.getDrugById(item.drugId);
      if (!drug) {
        return res.status(404).json({ error: `Drug item (${item.name}) no longer catalogued` });
      }
      if (drug.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for drug '${drug.name}'. Current inventory: ${drug.quantity} units.` });
      }
    }

    const saleItems = items.map((i: any) => {
      const d = db.getDrugById(i.drugId)!;
      return {
        drugId: i.drugId,
        name: i.name,
        quantity: Number(i.quantity),
        price: Number(i.sellingPrice),
        batchNumber: d.batchNumber
      };
    });

    const newSale = {
      id: `sal_${Date.now()}`,
      invoiceNumber: `INV-10023${db.getSales().length + 5}`,
      date: new Date().toISOString(),
      customerName: customerName || "General Walk-in Customer",
      customerPhone: customerPhone || "",
      items: saleItems,
      subtotal: Number(subtotal),
      tax: Number(tax),
      discount: Number(discount || 0),
      total: Number(total),
      paymentMethod: paymentMethod || 'cash',
      cashierId: user.userId,
      cashierName: user.name,
      branchId: user.userId === 'usr_4' ? 'branch_2' : 'branch_1',
      prescriptionId: prescriptionId || undefined
    };

    db.addSale(newSale);
    db.addLog(
      user.userId, 
      user.email, 
      user.role, 
      "POS Checkout", 
      `Invoice ${newSale.invoiceNumber} processed totaling $${newSale.total.toFixed(2)} under payment method '${newSale.paymentMethod}'`
    );

    res.status(201).json(newSale);
  });


  // ==========================================
  // Prescription Management
  // ==========================================
  app.get("/api/prescriptions", (req, res) => {
    res.json(db.getPrescriptions());
  });

  app.post("/api/prescriptions/upload", async (req, res) => {
    const user = getContextUser(req);
    const { base64Image, mimeType } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Must provide prescription base64 imageData for uploads" });
    }

    const imageType = mimeType || "image/png";

    try {
      // Step 2: call Gemini AI to parse the base64 prescription
      console.log("Analyzing prescription via server-side Gemini Flash parser...");
      const parsedOcrResult = await analyzePrescriptionImage(base64Image, imageType);

      // Create new prescription object inside local database
      const newPrescription = {
        id: `rx_${Date.now()}`,
        prescriptionNumber: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: parsedOcrResult.patientName || "Unknown Patient",
        patientAge: parsedOcrResult.patientAge || undefined,
        doctorName: parsedOcrResult.doctorName || "Unknown Doctor",
        doctorLicense: parsedOcrResult.doctorLicense || "",
        date: parsedOcrResult.date || new Date().toISOString().slice(0, 10),
        drugs: (parsedOcrResult.drugs || []).map((d: any) => ({
          name: d.name,
          dosage: d.dosage || "As suggested",
          duration: d.duration || "N/A",
          instructions: d.instructions || "N/A",
          status: 'verified' as const // Marked parsed status
        })),
        imageUrl: base64Image, // Save image to model for reference
        status: 'pending' as const,
        notes: parsedOcrResult.notes || ""
      };

      db.addPrescription(newPrescription);
      db.addLog(user.userId, user.email, user.role, "Prescription Upload", `Uploaded prescription RX: ${newPrescription.prescriptionNumber} for patient ${newPrescription.patientName} indexed via Gemini OCR.`);
      
      res.status(201).json(newPrescription);
    } catch (e: any) {
      console.error("Prescription upload pipeline collapsed", e);
      res.status(500).json({ error: "Failed to parse prescription image. Please ensure image is readable and retry." });
    }
  });

  app.put("/api/prescriptions/:id/status", (req, res) => {
    const user = getContextUser(req);
    const { id } = req.params;
    const { status } = req.body;

    const rx = db.getPrescriptionById(id);
    if (!rx) {
      return res.status(404).json({ error: "Prescription record not found" });
    }

    db.updatePrescription(id, { status });
    db.addLog(user.userId, user.email, user.role, "Prescription Status Transition", `Updated prescription status for ${rx.prescriptionNumber} to '${status}'`);
    res.json(db.getPrescriptionById(id));
  });


  // ==========================================
  // AI Gemini Safety & Intelligence Points
  // ==========================================
  app.post("/api/ai/check-interactions", async (req, res) => {
    const { drugNames } = req.body;
    if (!drugNames || !Array.isArray(drugNames) || drugNames.length < 2) {
      return res.status(400).json({ error: "At least 2 drug names are necessary to perform drug-to-drug safety reviews." });
    }

    try {
      console.log(`Checking drug-to-drug interactions via Gemini: ${drugNames.join(', ')}`);
      const interactionReport = await checkDrugInteractions(drugNames);
      res.json(interactionReport);
    } catch (e) {
      console.error("AI Medication checker failed", e);
      res.status(500).json({ error: "Safety analysis system temporarily overloaded." });
    }
  });

  app.get("/api/ai/forecast", async (req, res) => {
    try {
      console.log("Generating AI Inventory demand forecast based on catalog...");
      const forecastResponse = await generateInventoryForecast(db.getDrugs(), db.getSales());
      res.json(forecastResponse);
    } catch (e) {
      console.error("AI demand analytics collapsed", e);
      res.status(500).json({ error: "Failed to generate AI analytics." });
    }
  });


  // ==========================================
  // Branch stock transfers (Multi-branch support)
  // ==========================================
  app.get("/api/branches", (req, res) => {
    res.json(db.getBranches());
  });

  app.post("/api/branches/transfer", (req, res) => {
    const user = getContextUser(req);
    const { drugBarcode, fromBranchId, toBranchId, transferQuantity } = req.body;

    const qty = Number(transferQuantity);
    if (!drugBarcode || !fromBranchId || !toBranchId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Invalid transfer input parameters." });
    }

    // Find the drug in the source branch
    const srcDrug = db.getDrugs().find(d => d.barcode === drugBarcode && d.branchId === fromBranchId);
    if (!srcDrug) {
      return res.status(404).json({ error: "Drug not stocked in target source branch." });
    }

    if (srcDrug.quantity < qty) {
      return res.status(400).json({ error: `Not enough stock to transfer. Source branch only has ${srcDrug.quantity} units.` });
    }

    // Check if the drug is already indexed at the target destination branch
    const destDrug = db.getDrugs().find(d => d.barcode === drugBarcode && d.branchId === toBranchId);

    // Deduct volume from source branch
    db.updateDrug(srcDrug.id, { quantity: srcDrug.quantity - qty });

    if (destDrug) {
      // Drug already exists at destination, add volume
      db.updateDrug(destDrug.id, { quantity: destDrug.quantity + qty });
    } else {
      // Register drug line in destination branch
      const newDestEntry = {
        id: `drg_${Date.now()}_dest`,
        name: srcDrug.name,
        category: srcDrug.category,
        manufacturer: srcDrug.manufacturer,
        batchNumber: `${srcDrug.batchNumber}-TX`,
        barcode: srcDrug.barcode,
        expiryDate: srcDrug.expiryDate,
        costPrice: srcDrug.costPrice,
        sellingPrice: srcDrug.sellingPrice,
        quantity: qty,
        lowStockThreshold: srcDrug.lowStockThreshold,
        branchId: toBranchId
      };
      db.addDrug(newDestEntry);
    }

    const fromBranch = db.getBranches().find(b => b.id === fromBranchId);
    const toBranch = db.getBranches().find(b => b.id === toBranchId);

    const detailText = `Transferred ${qty} units of '${srcDrug.name}' from ${fromBranch?.name || fromBranchId} to ${toBranch?.name || toBranchId}`;
    db.addLog(user.userId, user.email, user.role, "Branch Stock Transfer", detailText);

    res.json({ success: true, message: detailText });
  });


  // ==========================================
  // Audit Logs, Alerts & Read Flags Points
  // ==========================================
  app.get("/api/logs", (req, res) => {
    res.json(db.getLogs());
  });

  app.get("/api/alerts", (req, res) => {
    // Dynamically update alert list to ensure freshness on requests
    db.checkAlerts();
    res.json(db.getAlerts());
  });

  app.put("/api/alerts/:id/read", (req, res) => {
    const { id } = req.params;
    db.markAlertAsRead(id);
    res.json({ success: true });
  });


  // ==========================================
  // Vite Integration & Static File Routing
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Dev Mode (Vite server handles browser hot reloads)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode (Serve built static resources from dist/)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=================================================`);
    console.log(`💊 PharmaCare Full-stack Server Running on PORT 3000`);
    console.log(`📡 Deployment Environment Host: 0.0.0.0`);
    console.log(`=================================================`);
  });
}

startServer().catch(err => {
  console.error("Critical error starting Express backend server:", err);
});
