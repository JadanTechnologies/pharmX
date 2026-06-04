import fs from 'fs';
import path from 'path';
import { 
  User, Branch, Drug, Supplier, PurchaseOrder, Prescription, Sale, ActivityLog, NotificationAlert, UserRole 
} from '../src/types';

// Path for persistent JSON database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Interface for DB JSON format
interface DBData {
  users: User[];
  branches: Branch[];
  drugs: Drug[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  prescriptions: Prescription[];
  sales: Sale[];
  logs: ActivityLog[];
  alerts: NotificationAlert[];
}

// Generate default initial datasets
const getInitialData = (): DBData => {
  const branches: Branch[] = [
    { id: 'branch_1', name: 'Central Plaza Branch', location: '102 Medical Drive, Suite A', code: 'CPB-01', phone: '+1 (555) 102-3920' },
    { id: 'branch_2', name: 'St. Mary Hospital Branch', location: 'St. Mary Hospital Ground Floor', code: 'SMB-02', phone: '+1 (555) 205-5942' },
  ];

  const users: User[] = [
    { id: 'usr_1', email: 'admin@pharmacy.com', name: 'Alice Smith (CEO)', role: 'admin', branchId: 'branch_1' },
    { id: 'usr_2', email: 'pharmacist@pharmacy.com', name: 'Dr. Robert Chen, RPh', role: 'pharmacist', branchId: 'branch_1' },
    { id: 'usr_3', email: 'cashier@pharmacy.com', name: 'John Doe', role: 'cashier', branchId: 'branch_1' },
    { id: 'usr_4', email: 'inv_manager@pharmacy.com', name: 'Sarah Jenkins', role: 'inventory_manager', branchId: 'branch_2' },
  ];

  const currentDate = '2026-06-03'; // current time as per metadata

  const drugs: Drug[] = [
    {
      id: 'drg_1',
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      manufacturer: 'Sigma Labs',
      batchNumber: 'AMX-202604',
      barcode: '890123456001',
      expiryDate: '2027-12-15',
      costPrice: 7.20,
      sellingPrice: 12.50,
      quantity: 150,
      lowStockThreshold: 30,
      branchId: 'branch_1',
    },
    {
      id: 'drg_2',
      name: 'Atorvastatin 20mg',
      category: 'Cardiovascular',
      manufacturer: 'Pfizer Inc.',
      batchNumber: 'ATV-202601',
      barcode: '890123456002',
      expiryDate: '2027-08-20',
      costPrice: 15.00,
      sellingPrice: 25.50,
      quantity: 85,
      lowStockThreshold: 20,
      branchId: 'branch_1',
    },
    {
      id: 'drg_3',
      name: 'Metformin 850mg',
      category: 'Antidiabetics',
      manufacturer: 'Bristol-Myers Squibb',
      batchNumber: 'MTF-202511',
      barcode: '890123456003',
      expiryDate: '2027-05-10',
      costPrice: 4.10,
      sellingPrice: 8.50,
      quantity: 15, // Low Stock (LowStockThreshold is 20)
      lowStockThreshold: 20,
      branchId: 'branch_1',
    },
    {
      id: 'drg_4',
      name: 'Paracetamol 500mg (Panadol)',
      category: 'Analgesics / Antipyretics',
      manufacturer: 'GSK Pharma',
      batchNumber: 'PCT-202602',
      barcode: '890123456004',
      expiryDate: '2028-09-30',
      costPrice: 0.80,
      sellingPrice: 2.00,
      quantity: 450,
      lowStockThreshold: 50,
      branchId: 'branch_1',
    },
    {
      id: 'drg_5',
      name: 'Ibuprofen 400mg',
      category: 'Analgesics / NSAID',
      manufacturer: 'Bayer AG',
      batchNumber: 'IBU-202605',
      barcode: '890123456005',
      expiryDate: '2026-06-20', // Approaching expiry in 17 days
      costPrice: 2.10,
      sellingPrice: 4.50,
      quantity: 220,
      lowStockThreshold: 25,
      branchId: 'branch_1',
    },
    {
      id: 'drg_6',
      name: 'Lisinopril 10mg',
      category: 'Cardiovascular',
      manufacturer: 'Sandoz',
      batchNumber: 'LSN-202509',
      barcode: '890123456006',
      expiryDate: '2027-02-14',
      costPrice: 10.00,
      sellingPrice: 18.00,
      quantity: 0, // OUT of stock!
      lowStockThreshold: 15,
      branchId: 'branch_1',
    },
    {
      id: 'drg_7',
      name: 'Lisinopril 10mg',
      category: 'Cardiovascular',
      manufacturer: 'Sandoz',
      batchNumber: 'LSN-202509-B',
      barcode: '890123456006',
      expiryDate: '2027-02-14',
      costPrice: 10.00,
      sellingPrice: 18.00,
      quantity: 48, // Regular stock at Branch 2
      lowStockThreshold: 15,
      branchId: 'branch_2',
    },
    {
      id: 'drg_8',
      name: 'Vitamin C 1000mg',
      category: 'Vitamins & Supplements',
      manufacturer: 'Nature Made',
      batchNumber: 'VTC-202603',
      barcode: '890123456008',
      expiryDate: '2026-11-20',
      costPrice: 2.50,
      sellingPrice: 5.90,
      quantity: 320,
      lowStockThreshold: 40,
      branchId: 'branch_1',
    },
    {
      id: 'drg_9',
      name: 'Insulin Glargine 100 U/mL',
      category: 'Insulin / Hormone',
      manufacturer: 'Sanofi-Aventis',
      batchNumber: 'INS-202610',
      barcode: '890123456009',
      expiryDate: '2027-04-12',
      costPrice: 35.00,
      sellingPrice: 65.00,
      quantity: 42,
      lowStockThreshold: 10,
      branchId: 'branch_1',
    }
  ];

  const suppliers: Supplier[] = [
    { id: 'sup_1', name: 'PharmaCare Distributors Ltd', contactPerson: 'Sarah Connor', phone: '+1 (555) 789-0123', email: 'sarah@pharmacaredist.com', address: '49 Industrial Blvd, Sector 4', balanceDue: 450.00 },
    { id: 'sup_2', name: 'Global BioHealth Pharmaceuticals', contactPerson: 'Marcus Aurelius', phone: '+1 (555) 234-5678', email: 'marcus@globalbiohealth.com', address: '88 Empire State Way, NY', balanceDue: 1200.00 },
    { id: 'sup_3', name: 'Astra Supplies International', contactPerson: 'David Miller', phone: '+1 (555) 345-6789', email: 'david.m@astrasupplies.com', address: '7 London Bridge Rd, London', balanceDue: 0 },
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po_1',
      orderNumber: 'PO-2026-0001',
      supplierId: 'sup_1',
      supplierName: 'PharmaCare Distributors Ltd',
      orderDate: '2026-05-15',
      status: 'received',
      items: [
        { drugId: 'drg_1', name: 'Amoxicillin 500mg', quantity: 100, costPrice: 7.20 },
        { drugId: 'drg_4', name: 'Paracetamol 500mg (Panadol)', quantity: 200, costPrice: 0.80 },
      ],
      totalCost: 880.00,
      branchId: 'branch_1',
    },
    {
      id: 'po_2',
      orderNumber: 'PO-2026-0002',
      supplierId: 'sup_2',
      supplierName: 'Global BioHealth Pharmaceuticals',
      orderDate: '2026-06-01',
      status: 'pending',
      items: [
        { drugId: 'drg_2', name: 'Atorvastatin 20mg', quantity: 50, costPrice: 15.00 },
        { drugId: 'drg_9', name: 'Insulin Glargine 100 U/mL', quantity: 15, costPrice: 35.00 },
      ],
      totalCost: 1275.00,
      branchId: 'branch_1',
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: 'rx_1',
      prescriptionNumber: 'RX-77281',
      patientName: 'Emma Watson',
      patientAge: 32,
      doctorName: 'Dr. Gregory House, MD',
      doctorLicense: 'LIC-NY-99212',
      date: '2026-06-02',
      drugs: [
        { name: 'Amoxicillin 500mg', dosage: '1 tablet organic', duration: '7 days', instructions: 'Take 3 times daily after meals', status: 'verified' },
        { name: 'Paracetamol 500mg', dosage: '500mg as needed', duration: '3 days', instructions: 'Take 1-2 tablets every 6 hours for fever', status: 'verified' }
      ],
      status: 'verified',
      notes: 'Ensure patient registers allergy list before checkout.'
    },
    {
      id: 'rx_2',
      prescriptionNumber: 'RX-10294',
      patientName: 'Arthur Dent',
      patientAge: 42,
      doctorName: 'Dr. Leonard McCoy, MD',
      doctorLicense: 'LIC-SF-24901',
      date: '2026-06-03',
      drugs: [
        { name: 'Atorvastatin 20mg', dosage: '1 pill daily', duration: '30 days', instructions: 'Take once daily before sleep', status: 'unverified' }
      ],
      status: 'pending',
      notes: 'Requires signature validation.'
    }
  ];

  const sales: Sale[] = [
    {
      id: 'sal_1',
      invoiceNumber: 'INV-1002301',
      date: '2026-06-02T10:15:30Z',
      customerName: 'Jane Smith',
      customerPhone: '555-4321',
      items: [
        { drugId: 'drg_4', name: 'Paracetamol 500mg (Panadol)', quantity: 10, price: 2.00, batchNumber: 'PCT-202602' },
        { drugId: 'drg_1', name: 'Amoxicillin 500mg', quantity: 20, price: 12.50, batchNumber: 'AMX-202604' }
      ],
      subtotal: 270.00,
      tax: 13.50,
      discount: 10.00,
      total: 273.50,
      paymentMethod: 'card',
      cashierId: 'usr_3',
      cashierName: 'John Doe',
      branchId: 'branch_1',
    },
    {
      id: 'sal_2',
      invoiceNumber: 'INV-1002302',
      date: '2026-06-03T09:40:15Z',
      customerName: 'Avery Johnson',
      customerPhone: '555-9081',
      items: [
        { drugId: 'drg_2', name: 'Atorvastatin 20mg', quantity: 30, price: 25.50, batchNumber: 'ATV-202601' },
        { drugId: 'drg_8', name: 'Vitamin C 1000mg', quantity: 2, price: 5.90, batchNumber: 'VTC-202603' }
      ],
      subtotal: 776.80,
      tax: 38.84,
      discount: 0,
      total: 815.64,
      paymentMethod: 'cash',
      cashierId: 'usr_3',
      cashierName: 'John Doe',
      branchId: 'branch_1',
    }
  ];

  const logs: ActivityLog[] = [
    { id: 'log_1', userId: 'usr_1', userEmail: 'admin@pharmacy.com', role: 'admin', action: 'Initialize Database', timestamp: '2026-06-03T12:00:00Z', details: 'Initial system seeding completed' },
    { id: 'log_2', userId: 'usr_3', userEmail: 'cashier@pharmacy.com', role: 'cashier', action: 'Checkout Transaction', timestamp: '2026-06-03T09:40:15Z', details: 'Processed invoice INV-1002302 total ₦815.64' },
  ];

  const alerts: NotificationAlert[] = [
    { id: 'alt_1', type: 'expiry', severity: 'danger', title: 'Critical Expiry Alert', message: 'Ibuprofen 400mg (Batch IBU-202605) is expiring on 2026-06-20 (in 17 days)', date: currentDate, read: false, linkedId: 'drg_5' },
    { id: 'alt_2', type: 'low_stock', severity: 'warning', title: 'Low Stock Alert', message: 'Metformin 850mg has fallen below threshold of 20 (Current: 15)', date: currentDate, read: false, linkedId: 'drg_3' },
    { id: 'alt_3', type: 'low_stock', severity: 'danger', title: 'Out Of Stock Alert', message: 'Lisinopril 10mg is out of stock in Central Plaza Branch', date: currentDate, read: false, linkedId: 'drg_6' },
  ];

  return {
    users,
    branches,
    drugs,
    suppliers,
    purchaseOrders,
    prescriptions,
    sales,
    logs,
    alerts
  };
};

// Database utility class
export class PharmacyDB {
  private data: DBData;

  constructor() {
    this.data = this.load();
    this.checkAlerts(); // dynamic refresh on boots
  }

  private load(): DBData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        const initial = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }

      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(fileContent) as DBData;
    } catch (e) {
      console.error('Error loading database, returning default fallback', e);
      return getInitialData();
    }
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database file', e);
    }
  }

  // Reload alerts dynamically based on dates and stock levels
  public checkAlerts(): void {
    const today = new Date('2026-06-03');
    const warningDays = 60; // 2 months warning
    const alerts: NotificationAlert[] = [];

    this.data.drugs.forEach(d => {
      // Expiry Check
      const exprDate = new Date(d.expiryDate);
      const timeDiff = exprDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 0) {
        alerts.push({
          id: `alt_exp_${d.id}`,
          type: 'expiry',
          severity: 'danger',
          title: 'Expired Batch Detected',
          message: `${d.name} (Batch ${d.batchNumber}) has EXPIRED on ${d.expiryDate}! Move to quarantine container immediately.`,
          date: '2026-06-03',
          read: false,
          linkedId: d.id
        });
      } else if (daysDiff <= warningDays) {
        alerts.push({
          id: `alt_exp_${d.id}`,
          type: 'expiry',
          severity: daysDiff <= 30 ? 'danger' : 'warning',
          title: 'Upcoming Stock Expiry',
          message: `${d.name} (Batch ${d.batchNumber}) will expire on ${d.expiryDate} (in ${daysDiff} days)`,
          date: '2026-06-03',
          read: false,
          linkedId: d.id
        });
      }

      // Stock Check
      if (d.quantity === 0) {
        alerts.push({
          id: `alt_stk_out_${d.id}`,
          type: 'low_stock',
          severity: 'danger',
          title: 'Out of Stock Alert',
          message: `${d.name} is completely out of stock. Customers cannot checkout this item.`,
          date: '2026-06-03',
          read: false,
          linkedId: d.id
        });
      } else if (d.quantity <= d.lowStockThreshold) {
        alerts.push({
          id: `alt_stk_low_${d.id}`,
          type: 'low_stock',
          severity: 'warning',
          title: 'Low Inventory Warning',
          message: `${d.name} is low on stock: ${d.quantity} units left (Threshold: ${d.lowStockThreshold})`,
          date: '2026-06-03',
          read: false,
          linkedId: d.id
        });
      }
    });

    // Merge generated alerts with existing ones, preserving read flags if matching ids
    const merged: NotificationAlert[] = [];
    alerts.forEach(newAlt => {
      const existing = this.data.alerts.find(a => a.id === newAlt.id);
      if (existing) {
        merged.push({ ...newAlt, read: existing.read });
      } else {
        merged.push(newAlt);
      }
    });

    this.data.alerts = merged;
    this.save();
  }

  // Users CRUD
  public getUsers(): User[] { return this.data.users; }
  
  // Branches CRUD
  public getBranches(): Branch[] { return this.data.branches; }
  public addBranch(branch: Branch): void {
    this.data.branches.push(branch);
    this.save();
  }

  // Drugs CRUD
  public getDrugs(): Drug[] { return this.data.drugs; }
  public getDrugById(id: string): Drug | undefined { return this.data.drugs.find(d => d.id === id); }
  
  public addDrug(drug: Drug): void {
    this.data.drugs.push(drug);
    this.checkAlerts();
    this.save();
  }

  public updateDrug(id: string, updated: Partial<Drug>): void {
    const idx = this.data.drugs.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.drugs[idx] = { ...this.data.drugs[idx], ...updated };
      this.checkAlerts();
      this.save();
    }
  }

  public deleteDrug(id: string): void {
    this.data.drugs = this.data.drugs.filter(d => d.id !== id);
    this.checkAlerts();
    this.save();
  }

  // Suppliers CRUD
  public getSuppliers(): Supplier[] { return this.data.suppliers; }
  public addSupplier(supplier: Supplier): void {
    this.data.suppliers.push(supplier);
    this.save();
  }
  public updateSupplier(id: string, updated: Partial<Supplier>): void {
    const idx = this.data.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.suppliers[idx] = { ...this.data.suppliers[idx], ...updated };
      this.save();
    }
  }

  // Purchase Orders CRUD
  public getPurchaseOrders(): PurchaseOrder[] { return this.data.purchaseOrders; }
  public addPurchaseOrder(po: PurchaseOrder): void {
    this.data.purchaseOrders.push(po);
    this.save();
  }
  public updatePurchaseOrder(id: string, status: 'draft' | 'pending' | 'received' | 'cancelled'): void {
    const po = this.data.purchaseOrders.find(p => p.id === id);
    if (po) {
      const oldStatus = po.status;
      po.status = status;
      
      // If order is transitioned to received, automatically add items into the Drug inventory
      if (status === 'received' && oldStatus !== 'received') {
        po.items.forEach(item => {
          const drug = this.data.drugs.find(d => d.id === item.drugId);
          if (drug) {
            drug.quantity += item.quantity;
          }
        });
        // Also reduce supplier outstanding debt or manage it
        const supplier = this.data.suppliers.find(s => s.id === po.supplierId);
        if (supplier) {
          supplier.balanceDue += po.totalCost;
        }
      }
      this.checkAlerts();
      this.save();
    }
  }

  // Prescriptions CRUD
  public getPrescriptions(): Prescription[] { return this.data.prescriptions; }
  public getPrescriptionById(id: string): Prescription | undefined { return this.data.prescriptions.find(p => p.id === id); }
  public addPrescription(p: Prescription): void {
    this.data.prescriptions.unshift(p); // Add to top
    this.save();
  }
  public updatePrescription(id: string, updated: Partial<Prescription>): void {
    const idx = this.data.prescriptions.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.prescriptions[idx] = { ...this.data.prescriptions[idx], ...updated };
      this.save();
    }
  }

  // Sales CRUD & POS checkout
  public getSales(): Sale[] { return this.data.sales; }
  public addSale(sale: Sale): void {
    this.data.sales.unshift(sale); // Add to top

    // De-increment drug counts
    sale.items.forEach(item => {
      const drug = this.data.drugs.find(d => d.id === item.drugId);
      if (drug) {
        drug.quantity = Math.max(0, drug.quantity - item.quantity);
      }
    });

    // If checkout hasprescription, update prescription status to disbursed
    if (sale.prescriptionId) {
      const prescription = this.data.prescriptions.find(p => p.id === sale.prescriptionId);
      if (prescription) {
        prescription.status = 'dispensed';
      }
    }

    this.checkAlerts();
    this.save();
  }

  // Activity Logs CRUD
  public getLogs(): ActivityLog[] { return this.data.logs; }
  public addLog(userId: string, email: string, role: UserRole, action: string, details?: string): void {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userEmail: email,
      role,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    this.data.logs.unshift(log);
    this.save();
  }

  // Notifications alerts CRUD
  public getAlerts(): NotificationAlert[] { return this.data.alerts; }
  public markAlertAsRead(id: string): void {
    const alert = this.data.alerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
      this.save();
    }
  }
}
export const db = new PharmacyDB();
