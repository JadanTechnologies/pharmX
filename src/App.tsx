import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, LayoutDashboard, ShoppingCart, Pill, FileText, 
  Truck, Sparkles, Network, Scroll, LogOut, Bell, ShieldX, UserCheck,
  Sun, Moon
} from 'lucide-react';
import { 
  Drug, Prescription, Supplier, PurchaseOrder, 
  Branch, NotificationAlert, ActivityLog, Sale 
} from './types';

// Importing our modular subcomponents
import DashboardOverview from './components/DashboardOverview';
import POS from './components/POS';
import Inventory from './components/Inventory';
import PrescriptionCenter from './components/PrescriptionCenter';
import SuppliersOrders from './components/SuppliersOrders';
import AIAnalyst from './components/AIAnalyst';
import MultiBranch from './components/MultiBranch';
import NotificationAudits from './components/NotificationAudits';
import { useTheme } from './context/ThemeContext';

// Import our rich medical default datasets for pure offline capability
import { 
  DEFAULT_USERS, DEFAULT_BRANCHES, DEFAULT_DRUGS, DEFAULT_SUPPLIERS, 
  DEFAULT_PURCHASE_ORDERS, DEFAULT_PRESCRIPTIONS, DEFAULT_SALES, 
  DEFAULT_LOGS, DEFAULT_ALERTS, DEFAULT_ROLES, RoleDefinition 
} from './data/mockDb';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  // Auth contexts
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'prescriptions' | 'suppliers' | 'ai' | 'branches' | 'audits'>('dashboard');

  // Input elements for custom mock login form
  const [loginEmail, setLoginEmail] = useState('admin@pharmapos.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const hasPermission = (permKey: string) => {
    return currentUser?.role === 'admin' || currentUser?.permissions?.includes(permKey);
  };

  const visibleTabs = useMemo(() => {
    const tabs: { key: string; label: string; icon: React.ReactNode; id: string; permission?: string }[] = [
      { key: 'dashboard', label: 'Overview Feed', icon: <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />, id: 'nav_dashboard' },
      { key: 'pos', label: 'POS Billing', icon: <ShoppingCart className="w-3.5 h-3.5 shrink-0" />, id: 'nav_pos', permission: 'pos_checkout' },
      { key: 'inventory', label: 'Drug Inventory', icon: <Pill className="w-3.5 h-3.5 shrink-0" />, id: 'nav_inventory', permission: 'inventory_write' },
      { key: 'prescriptions', label: 'RX OCR Scanner', icon: <FileText className="w-3.5 h-3.5 shrink-0" />, id: 'nav_rx', permission: 'prescription_verify' },
      { key: 'suppliers', label: 'Suppliers & PO', icon: <Truck className="w-3.5 h-3.5 shrink-0" />, id: 'nav_suppliers', permission: 'procurement_order' },
      { key: 'ai', label: 'Clinical Analyst', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, id: 'nav_ai' },
      { key: 'branches', label: 'Branch Logistics', icon: <Network className="w-3.5 h-3.5 shrink-0" />, id: 'nav_branches', permission: 'inter_branch_transfer' },
      { key: 'audits', label: 'Audits & Security', icon: <Scroll className="w-3.5 h-3.5 shrink-0" />, id: 'nav_audits', permission: 'security_admin' },
    ];
    return tabs.filter(tab => !tab.permission || hasPermission(tab.permission));
  }, [currentUser]);

  const navigateTo = (tabKey: string) => {
    handleTabChange(tabKey);
  };

  const canAccessTab = (tabKey: string) => {
    return visibleTabs.some(t => t.key === tabKey);
  };
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);

  // Page States
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Initial Boot session check
  useEffect(() => {
    checkActiveSession();
  }, []);

  const getUserWithPermissions = (user: any, activeRoles: RoleDefinition[]) => {
    if (!user) return null;
    const roleDef = activeRoles.find(r => r.key === user.role);
    return {
      ...user,
      permissions: roleDef ? roleDef.permissions : []
    };
  };

  // Sync session structures starting with localStorage fallback
  const checkActiveSession = () => {
    try {
      const savedUser = localStorage.getItem('pharma_current_user');
      const savedRoles = localStorage.getItem('pharma_roles');
      const activeRoles = savedRoles ? JSON.parse(savedRoles) : DEFAULT_ROLES;
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const userWithPerms = getUserWithPermissions(parsed, activeRoles);
        setCurrentUser(userWithPerms);
      }
      // Load system databases either way
      loadAllDatabases();
    } catch {
      // Load mock db
      loadAllDatabases();
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllDatabases = async () => {
    try {
      // 1. Branches
      let localBranches = localStorage.getItem('pharma_branches');
      let parsedBranches = DEFAULT_BRANCHES;
      if (localBranches) {
        parsedBranches = JSON.parse(localBranches);
      } else {
        localStorage.setItem('pharma_branches', JSON.stringify(DEFAULT_BRANCHES));
      }
      setBranches(parsedBranches);

      // 2. Drugs
      let localDrugs = localStorage.getItem('pharma_drugs');
      let parsedDrugs = DEFAULT_DRUGS;
      if (localDrugs) {
        parsedDrugs = JSON.parse(localDrugs);
      } else {
        localStorage.setItem('pharma_drugs', JSON.stringify(DEFAULT_DRUGS));
      }
      setDrugs(parsedDrugs);

      // 3. Prescriptions
      let localRx = localStorage.getItem('pharma_prescriptions');
      let parsedRx = DEFAULT_PRESCRIPTIONS;
      if (localRx) {
        parsedRx = JSON.parse(localRx);
      } else {
        localStorage.setItem('pharma_prescriptions', JSON.stringify(DEFAULT_PRESCRIPTIONS));
      }
      setPrescriptions(parsedRx);

      // 4. Suppliers
      let localSuppliers = localStorage.getItem('pharma_suppliers');
      let parsedSuppliers = DEFAULT_SUPPLIERS;
      if (localSuppliers) {
        parsedSuppliers = JSON.parse(localSuppliers);
      } else {
        localStorage.setItem('pharma_suppliers', JSON.stringify(DEFAULT_SUPPLIERS));
      }
      setSuppliers(parsedSuppliers);

      // 5. Purchase Orders
      let localPO = localStorage.getItem('pharma_purchase_orders');
      let parsedPO = DEFAULT_PURCHASE_ORDERS;
      if (localPO) {
        parsedPO = JSON.parse(localPO);
      } else {
        localStorage.setItem('pharma_purchase_orders', JSON.stringify(DEFAULT_PURCHASE_ORDERS));
      }
      setPurchaseOrders(parsedPO);

      // 6. Alerts
      let localAlerts = localStorage.getItem('pharma_alerts');
      let parsedAlerts = DEFAULT_ALERTS;
      if (localAlerts) {
        parsedAlerts = JSON.parse(localAlerts);
      } else {
        localStorage.setItem('pharma_alerts', JSON.stringify(DEFAULT_ALERTS));
      }
      setAlerts(parsedAlerts);

      // 7. Audit Logs
      let localLogs = localStorage.getItem('pharma_audit_logs');
      let parsedLogs = DEFAULT_LOGS;
      if (localLogs) {
        parsedLogs = JSON.parse(localLogs);
      } else {
        localStorage.setItem('pharma_audit_logs', JSON.stringify(DEFAULT_LOGS));
      }
      setAuditLogs(parsedLogs);

      // 8. Sales
      let localSales = localStorage.getItem('pharma_sales');
      let parsedSales = DEFAULT_SALES;
      if (localSales) {
        parsedSales = JSON.parse(localSales);
      } else {
        localStorage.setItem('pharma_sales', JSON.stringify(DEFAULT_SALES));
      }
      setSales(parsedSales);

      // 9. Roles
      let localRoles = localStorage.getItem('pharma_roles');
      let parsedRoles = DEFAULT_ROLES;
      if (localRoles) {
        parsedRoles = JSON.parse(localRoles);
      } else {
        localStorage.setItem('pharma_roles', JSON.stringify(DEFAULT_ROLES));
      }
      setRoles(parsedRoles);

      // 10. Users
      let localUsers = localStorage.getItem('pharma_users');
      let parsedUsers = DEFAULT_USERS;
      if (localUsers) {
        parsedUsers = JSON.parse(localUsers);
      } else {
        localStorage.setItem('pharma_users', JSON.stringify(DEFAULT_USERS));
      }
      setUsers(parsedUsers);

      // Maintain session permissions in sync with latest edited roles
      const savedUserStr = localStorage.getItem('pharma_current_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        const freshUser = parsedUsers.find((u: any) => u.id === savedUser.id) || savedUser;
        const userWithPerms = getUserWithPermissions(freshUser, parsedRoles);
        setCurrentUser(userWithPerms);
      }

      setApiError('');
    } catch (err: any) {
      setApiError("Local Storage Database Initialize Error.");
    }
  };

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser?.id || 'usr_anonymous',
      userEmail: currentUser?.email || 'anonymous@pharmacy.com',
      role: currentUser?.role || 'cashier',
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('pharma_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const checkStockRulebookCompliance = (
    updatedDrugsList: Drug[],
    currentPurchaseOrdersList: PurchaseOrder[],
    currentSuppliersList: Supplier[],
    currentAlerts: NotificationAlert[]
  ) => {
    let poModified = false;
    let alertsModified = false;
    let nextPOs = [...currentPurchaseOrdersList];
    let nextAlerts = [...currentAlerts];

    updatedDrugsList.forEach(drug => {
      const alertId = `alt_stk_low_${drug.id}`;
      const hasAlert = nextAlerts.some(a => a.id === alertId);

      if (drug.quantity <= drug.lowStockThreshold) {
        if (!hasAlert) {
          const alertType = drug.quantity === 0 ? 'danger' : 'warning';
          const title = drug.quantity === 0 ? 'Out of Stock Alert' : 'Low Inventory Warning';
          const msg = drug.quantity === 0 
            ? `${drug.name} is completely out of stock.` 
            : `${drug.name} has dropped below safety threshold of ${drug.lowStockThreshold} (Current stock: ${drug.quantity})`;
          
          const newAlert: NotificationAlert = {
            id: alertId,
            type: 'low_stock',
            severity: alertType,
            title,
            message: msg,
            date: new Date().toISOString().split('T')[0],
            read: false,
            linkedId: drug.id
          };
          nextAlerts = [newAlert, ...nextAlerts];
          alertsModified = true;
          logActivity("Stock Advisory", `Safety threshold crossed for ${drug.name}: ${drug.quantity} items left.`);
        }

        // Draft Auto PO generation
        let supplierId = 'sup_1';
        let supplierName = 'PharmaCare Distributors Ltd';

        // 1. Find historical PO supplier
        const pastPo = nextPOs.find(p => p.items.some(item => item.drugId === drug.id));
        if (pastPo) {
          supplierId = pastPo.supplierId;
          supplierName = pastPo.supplierName;
        } else {
          // 2. Map supplier
          const matchedSupplier = currentSuppliersList.find(s => 
            s.name.toLowerCase().includes(drug.manufacturer.toLowerCase()) || 
            drug.manufacturer.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matchedSupplier) {
            supplierId = matchedSupplier.id;
            supplierName = matchedSupplier.name;
          } else if (currentSuppliersList.length > 0) {
            supplierId = currentSuppliersList[0].id;
            supplierName = currentSuppliersList[0].name;
          }
        }

        // Check active 'draft' status PO
        const existingDraftIdx = nextPOs.findIndex(p => p.supplierId === supplierId && p.status === 'draft');
        
        // Calculate reorder quantity
        const reorderQty = Math.max(100, drug.lowStockThreshold * 4);
        const itemPayload = {
          drugId: drug.id,
          name: drug.name,
          quantity: reorderQty,
          costPrice: drug.costPrice
        };

        if (existingDraftIdx !== -1) {
          const draftPo = nextPOs[existingDraftIdx];
          const itemExists = draftPo.items.some(it => it.drugId === drug.id);
          if (!itemExists) {
            const updatedItems = [...draftPo.items, itemPayload];
            const updatedCost = updatedItems.reduce((acc, curr) => acc + (curr.costPrice * curr.quantity), 0);
            nextPOs[existingDraftIdx] = {
              ...draftPo,
              items: updatedItems,
              totalCost: updatedCost
            };
            poModified = true;
            logActivity("Auto-Replenish Item Drafted", `Appended low-stocked '${drug.name}' (${reorderQty} units) to draft PO ${draftPo.orderNumber}`);
          }
        } else {
          const nextPoNo = `PO-AUTO-DRAFT-${String(nextPOs.length + 1).padStart(4, '0')}`;
          const newDraftPO: PurchaseOrder = {
            id: `po_draft_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            orderNumber: nextPoNo,
            supplierId,
            supplierName,
            orderDate: new Date().toISOString().split('T')[0],
            status: 'draft',
            items: [itemPayload],
            totalCost: drug.costPrice * reorderQty,
            branchId: drug.branchId
          };
          nextPOs = [newDraftPO, ...nextPOs];
          poModified = true;
          logActivity("Replenish Draft Created", `Drafted standard auto-replenish order ${nextPoNo} ($${newDraftPO.totalCost.toFixed(2)}) for "${supplierName}" supplying "${drug.name}"`);
        }
      } else {
        // Clear low stock alert if it is resolved
        if (hasAlert) {
          nextAlerts = nextAlerts.filter(a => a.id !== alertId);
          alertsModified = true;
        }
      }
    });

    if (poModified) {
      setPurchaseOrders(nextPOs);
      localStorage.setItem('pharma_purchase_orders', JSON.stringify(nextPOs));
    }
    if (alertsModified) {
      setAlerts(nextAlerts);
      localStorage.setItem('pharma_alerts', JSON.stringify(nextAlerts));
    }
  };

  const handleUpdatePOStatus = async (poId: string, nextStatus: 'draft' | 'pending' | 'received' | 'cancelled'): Promise<boolean> => {
    const poIdx = purchaseOrders.findIndex(po => po.id === poId);
    if (poIdx === -1) throw new Error("Order not found");
    const existingPo = purchaseOrders[poIdx];
    
    if (existingPo.status === nextStatus) return true;

    const updatedPo = {
      ...existingPo,
      status: nextStatus
    };

    let updatedDrugs = [...drugs];
    let updatedSuppliers = [...suppliers];

    if (nextStatus === 'received' && existingPo.status !== 'received') {
      existingPo.items.forEach((poItem: any) => {
        const drugIdx = updatedDrugs.findIndex(d => d.name.toLowerCase() === poItem.name.toLowerCase() && d.branchId === existingPo.branchId);
        if (drugIdx !== -1) {
          updatedDrugs[drugIdx] = {
            ...updatedDrugs[drugIdx],
            quantity: updatedDrugs[drugIdx].quantity + poItem.quantity
          };
        }
      });
      setDrugs(updatedDrugs);
      localStorage.setItem('pharma_drugs', JSON.stringify(updatedDrugs));

      updatedSuppliers = suppliers.map(s => {
        if (s.id === existingPo.supplierId) {
          return { ...s, balanceDue: s.balanceDue + existingPo.totalCost };
        }
        return s;
      });
      setSuppliers(updatedSuppliers);
      localStorage.setItem('pharma_suppliers', JSON.stringify(updatedSuppliers));
    }

    const updatedPOs = [...purchaseOrders];
    updatedPOs[poIdx] = updatedPo;
    setPurchaseOrders(updatedPOs);
    localStorage.setItem('pharma_purchase_orders', JSON.stringify(updatedPOs));

    logActivity("Update PO Status", `Transitioned purchase order ${existingPo.orderNumber} status to '${nextStatus.toUpperCase()}'`);
    
    if (nextStatus === 'received') {
      checkStockRulebookCompliance(updatedDrugs, updatedPOs, updatedSuppliers, alerts);
    }
    
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Dynamic latency step for organic look
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (loginPassword !== 'admin123' && loginPassword !== 'pharmacy123') {
        throw new Error("Invalid passcode. Hint: Use 'admin123' or 'pharmacy123'.");
      }

      const localUsers = localStorage.getItem('pharma_users');
      const activeUsers = localUsers ? JSON.parse(localUsers) : DEFAULT_USERS;

      const normalizedEmail = loginEmail.toLowerCase().replace('@pharmapos.com', '@pharmacy.com');
      const foundUser = activeUsers.find((u: any) => u.email.toLowerCase() === normalizedEmail);
      if (!foundUser) {
        throw new Error("User profile not found. Quick Profiles match with admin@pharmacy.com, pharmacist@pharmacy.com, or cashier@pharmacy.com.");
      }

      const savedRoles = localStorage.getItem('pharma_roles');
      const activeRoles = savedRoles ? JSON.parse(savedRoles) : DEFAULT_ROLES;
      const userWithPerms = getUserWithPermissions(foundUser, activeRoles);

      setCurrentUser(userWithPerms);
      localStorage.setItem('pharma_current_user', JSON.stringify(userWithPerms));
      
      // Log the login event
      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        userId: foundUser.id,
        userEmail: foundUser.email,
        role: foundUser.role as any,
        action: "User Sign In",
        timestamp: new Date().toISOString(),
        details: `Authorized successfully on branch ${foundUser.branchId}`
      };
      
      let localLogs = localStorage.getItem('pharma_audit_logs');
      let activeLogs = localLogs ? JSON.parse(localLogs) : DEFAULT_LOGS;
      const updatedLogs = [newLog, ...activeLogs];
      setAuditLogs(updatedLogs);
      localStorage.setItem('pharma_audit_logs', JSON.stringify(updatedLogs));

      loadAllDatabases();
    } catch (err: any) {
      setLoginError(err.message || "Authentication rejected");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogoutActual = () => {
    try {
      // Log session out client side
      logActivity("User Sign Out", "Session ended explicitly by user control.");
    } catch {
      // Ignore logger issues on unlatched logout states
    }
    localStorage.removeItem('pharma_current_user');
    setCurrentUser(null);
    setDrugs([]);
    setPrescriptions([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setBranches([]);
    setAlerts([]);
    setAuditLogs([]);
    setSales([]);
    setShowLogoutModal(false);
  };

  // PURE CLIENT-SIDE LOCALSTORAGE MUTATORS (Bypassing backends for offline compatibility)

  // Drug actions
  const handleAddDrug = async (drugData: any): Promise<Drug> => {
    // Client-side guard check mirroring role constraints
    if (currentUser?.role?.toLowerCase() !== 'admin') {
      throw new Error("Access Denied: Only administrators are authorized to catalogue new medications.");
    }

    const newDrug: Drug = {
      id: `drg_${Date.now()}`,
      ...drugData,
      quantity: Number(drugData.quantity || 0),
      costPrice: Number(drugData.costPrice || 0),
      sellingPrice: Number(drugData.sellingPrice || 0),
      lowStockThreshold: Number(drugData.lowStockThreshold || 10),
      branchId: currentUser?.branchId || 'branch_1'
    };
    const updated = [...drugs, newDrug];
    setDrugs(updated);
    localStorage.setItem('pharma_drugs', JSON.stringify(updated));

    logActivity("Create Drug", `Catalogued new drug '${newDrug.name}' Batch ${newDrug.batchNumber}`);
    checkStockRulebookCompliance(updated, purchaseOrders, suppliers, alerts);
    return newDrug;
  };

  const handleUpdateDrug = async (id: string, drugData: any): Promise<Drug> => {
    const drugIdx = drugs.findIndex(d => d.id === id);
    if (drugIdx === -1) throw new Error("Drug not found");
    const existing = drugs[drugIdx];
    const updatedDrug = {
      ...existing,
      ...drugData,
      quantity: drugData.quantity !== undefined ? Number(drugData.quantity) : existing.quantity,
      costPrice: drugData.costPrice !== undefined ? Number(drugData.costPrice) : existing.costPrice,
      sellingPrice: drugData.sellingPrice !== undefined ? Number(drugData.sellingPrice) : existing.sellingPrice,
      lowStockThreshold: drugData.lowStockThreshold !== undefined ? Number(drugData.lowStockThreshold) : existing.lowStockThreshold
    };
    const updated = [...drugs];
    updated[drugIdx] = updatedDrug;
    setDrugs(updated);
    localStorage.setItem('pharma_drugs', JSON.stringify(updated));

    let logMessage = `Modified details for drug '${existing.name}'`;
    if (drugData.quantity !== undefined && Number(drugData.quantity) !== existing.quantity) {
      logMessage = `Updated stock quantity for drug '${existing.name}' from ${existing.quantity} to ${drugData.quantity}`;
    }
    logActivity("Update Drug", logMessage);
    checkStockRulebookCompliance(updated, purchaseOrders, suppliers, alerts);
    return updatedDrug;
  };

  const handleDeleteDrug = async (id: string): Promise<boolean> => {
    const drug = drugs.find(d => d.id === id);
    if (!drug) throw new Error("Drug not found");
    const updated = drugs.filter(d => d.id !== id);
    setDrugs(updated);
    localStorage.setItem('pharma_drugs', JSON.stringify(updated));
    logActivity("Delete Drug", `De-catalogued drug '${drug.name}' Batch ${drug.batchNumber}`);
    return true;
  };

  // Checkout process
  const handlePOSCheckout = async (saleData: any): Promise<Sale> => {
    const newSale: Sale = {
      id: `sal_${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || '',
      items: saleData.items,
      subtotal: Number(saleData.subtotal),
      tax: Number(saleData.tax),
      discount: Number(saleData.discount),
      total: Number(saleData.total),
      paymentMethod: saleData.paymentMethod || 'cash',
      cashierId: currentUser?.id || 'usr_anonymous',
      cashierName: currentUser?.name || 'Anonymous Guest',
      branchId: currentUser?.branchId || 'branch_1'
    };

    // Deduct quantities from drugs
    const updatedDrugs = [...drugs];
    saleData.items.forEach((item: any) => {
      const drugIdx = updatedDrugs.findIndex(d => d.id === item.drugId);
      if (drugIdx !== -1) {
        updatedDrugs[drugIdx] = {
          ...updatedDrugs[drugIdx],
          quantity: Math.max(0, updatedDrugs[drugIdx].quantity - item.quantity)
        };
      }
    });
    setDrugs(updatedDrugs);
    localStorage.setItem('pharma_drugs', JSON.stringify(updatedDrugs));

    // Save sale
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    localStorage.setItem('pharma_sales', JSON.stringify(updatedSales));

    logActivity("POS Checkout", `Invoice ${newSale.invoiceNumber} processed totaling $${newSale.total.toFixed(2)} under payment method '${newSale.paymentMethod}'`);
    checkStockRulebookCompliance(updatedDrugs, purchaseOrders, suppliers, alerts);
    return newSale;
  };

  // Prescription uploading ocr
  const handleUploadPrescription = async (base64Image: string, mimeType: string): Promise<Prescription> => {
    const rxNo = `RX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      prescriptionNumber: rxNo,
      patientName: "John Doe (OCR Extracted)",
      patientAge: 38,
      doctorName: "Dr. Gregory House, MD",
      doctorLicense: "LIC-NY-99212",
      date: new Date().toISOString().split('T')[0],
      drugs: [
        {
          name: "Amoxicillin 500mg",
          dosage: "1 tablet",
          duration: "5 days",
          instructions: "Take twice daily",
          status: "unverified"
        }
      ],
      status: "pending",
      notes: "Prescription OCR digitally processed. Action required to verify details."
    };
    const updated = [newRx, ...prescriptions];
    setPrescriptions(updated);
    localStorage.setItem('pharma_prescriptions', JSON.stringify(updated));
    logActivity("Prescription Upload", `Uploaded prescription image, digitized system record ID: ${rxNo}`);
    return newRx;
  };

  const handleVerifyPrescription = async (id: string, status: 'verified' | 'rejected'): Promise<Prescription> => {
    const rxIdx = prescriptions.findIndex(rx => rx.id === id);
    if (rxIdx === -1) throw new Error("Prescription not found");
    const existing = prescriptions[rxIdx];
    const updatedRx = {
      ...existing,
      status,
      drugs: existing.drugs.map(d => ({ ...d, status: status === 'verified' ? 'verified' as any : 'unverified' as any }))
    };
    const updated = [...prescriptions];
    updated[rxIdx] = updatedRx;
    setPrescriptions(updated);
    localStorage.setItem('pharma_prescriptions', JSON.stringify(updated));
    logActivity("Verify Prescription", `Adjudicated prescription ${existing.prescriptionNumber} as ${status.toUpperCase()}`);
    return updatedRx;
  };

  // Suppliers mutator
  const handleAddSupplier = async (supplierData: any): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      ...supplierData,
      balanceDue: Number(supplierData.balanceDue || 0)
    };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    localStorage.setItem('pharma_suppliers', JSON.stringify(updated));
    logActivity("Create Supplier", `Onboarded new pharmaceutical supply vendor: ${newSupplier.name}`);
    return newSupplier;
  };

  const handleAddPurchaseOrder = async (poData: any): Promise<PurchaseOrder> => {
    const newPo: PurchaseOrder = {
      id: `po_${Date.now()}`,
      orderNumber: `PO-2026-${String(purchaseOrders.length + 1).padStart(4, '0')}`,
      supplierId: poData.supplierId,
      supplierName: poData.supplierName,
      orderDate: new Date().toISOString().split('T')[0],
      status: "pending",
      items: poData.items,
      totalCost: Number(poData.totalCost),
      branchId: currentUser?.branchId || 'branch_1'
    };
    const updated = [newPo, ...purchaseOrders];
    setPurchaseOrders(updated);
    localStorage.setItem('pharma_purchase_orders', JSON.stringify(updated));
    logActivity("Create PO", `Registered new purchase procurement order ${newPo.orderNumber} for ${newPo.supplierName}`);
    return newPo;
  };

  const handleReceivePO = async (poId: string): Promise<boolean> => {
    const poIdx = purchaseOrders.findIndex(po => po.id === poId);
    if (poIdx === -1) throw new Error("Order not found");
    const existingPo = purchaseOrders[poIdx];
    if (existingPo.status === 'received') return true;

    const updatedPo = {
      ...existingPo,
      status: 'received' as any
    };

    // Increment drug counts
    const updatedDrugs = [...drugs];
    existingPo.items.forEach((poItem: any) => {
      const drugIdx = updatedDrugs.findIndex(d => d.name.toLowerCase() === poItem.name.toLowerCase() && d.branchId === existingPo.branchId);
      if (drugIdx !== -1) {
        updatedDrugs[drugIdx] = {
          ...updatedDrugs[drugIdx],
          quantity: updatedDrugs[drugIdx].quantity + poItem.quantity
        };
      }
    });
    setDrugs(updatedDrugs);
    localStorage.setItem('pharma_drugs', JSON.stringify(updatedDrugs));

    const updatedPOs = [...purchaseOrders];
    updatedPOs[poIdx] = updatedPo;
    setPurchaseOrders(updatedPOs);
    localStorage.setItem('pharma_purchase_orders', JSON.stringify(updatedPOs));

    logActivity("Receive PO", `Settled purchase order ${existingPo.orderNumber} and credited inventory levels.`);
    checkStockRulebookCompliance(updatedDrugs, updatedPOs, suppliers, alerts);
    return true;
  };

  // Stock transfer
  const handleTransferStock = async (payload: any): Promise<boolean> => {
    const { drugId, sourceBranchId, targetBranchId, quantity } = payload;
    const transferCount = Number(quantity);

    const sourceDrugIdx = drugs.findIndex(d => d.id === drugId);
    if (sourceDrugIdx === -1) throw new Error("Source medication not found");
    const srcDrug = drugs[sourceDrugIdx];
    if (srcDrug.quantity < transferCount) {
      throw new Error(`Insufficient stock at source branch. Only ${srcDrug.quantity} items available.`);
    }

    const updatedDrugs = [...drugs];
    updatedDrugs[sourceDrugIdx] = {
      ...srcDrug,
      quantity: srcDrug.quantity - transferCount
    };

    const targetDrugIdx = drugs.findIndex(d => d.name.toLowerCase() === srcDrug.name.toLowerCase() && d.branchId === targetBranchId);
    if (targetDrugIdx !== -1) {
      updatedDrugs[targetDrugIdx] = {
        ...updatedDrugs[targetDrugIdx],
        quantity: updatedDrugs[targetDrugIdx].quantity + transferCount
      };
    } else {
      const targetDrug: Drug = {
        ...srcDrug,
        id: `drg_${Date.now()}_dest`,
        branchId: targetBranchId,
        quantity: transferCount
      };
      updatedDrugs.push(targetDrug);
    }

    setDrugs(updatedDrugs);
    localStorage.setItem('pharma_drugs', JSON.stringify(updatedDrugs));

    const sourceName = branches.find(b => b.id === sourceBranchId)?.name || sourceBranchId;
    const targetName = branches.find(b => b.id === targetBranchId)?.name || targetBranchId;

    logActivity("Branch Stock Transfer", `Transferred ${transferCount} units of '${srcDrug.name}' from ${sourceName} to ${targetName}`);
    return true;
  };

  // Dynamic Roles and Permissions adjustments
  const handleCreateRole = (newRole: RoleDefinition) => {
    const updated = [...roles, newRole];
    setRoles(updated);
    localStorage.setItem('pharma_roles', JSON.stringify(updated));
    logActivity("Create Role", `Created custom role profile '${newRole.name}' ('${newRole.key}')`);
  };

  const handleUpdateRolePermissions = (roleKey: string, newPermissions: string[]) => {
    const updated = roles.map(r => {
      if (r.key === roleKey) {
        return { ...r, permissions: newPermissions };
      }
      return r;
    });
    setRoles(updated);
    localStorage.setItem('pharma_roles', JSON.stringify(updated));
    const roleName = roles.find(r => r.key === roleKey)?.name || roleKey;
    logActivity("Update Role Permissions", `Modified permissions for '${roleName}' to: [${newPermissions.join(', ')}]`);
  };

  const handleDeleteRole = (roleKey: string) => {
    const roleToDelete = roles.find(r => r.key === roleKey);
    if (!roleToDelete) return;
    if (roleToDelete.isSystem) {
      throw new Error("System default roles cannot be deleted.");
    }
    const updated = roles.filter(r => r.key !== roleKey);
    setRoles(updated);
    localStorage.setItem('pharma_roles', JSON.stringify(updated));
    logActivity("Delete Role", `Permanently deleted custom role profile '${roleToDelete.name}'`);
  };

  const handleCreateUser = (newUser: any) => {
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('pharma_users', JSON.stringify(updated));
    logActivity("Create Staff Profile", `Onboarded new staff member '${newUser.name}' as ${newUser.role}`);
  };

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('pharma_users', JSON.stringify(updated));
    const uName = users.find(u => u.id === userId)?.name || userId;
    logActivity("Update Staff Role", `Adjusted authorization profile of '${uName}' to ${newRole}`);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    if (userToDelete.id === currentUser?.id) {
      throw new Error("Cannot de-authenticate active terminal operator.");
    }
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('pharma_users', JSON.stringify(updated));
    logActivity("De-authenticate Staff", `Removed credentials of staff member '${userToDelete.name}'`);
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Terminals...</span>
        </div>
      </div>
    );
  }

  // Auth Screen / Login Card Wrapper
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative" id="auth_screen_wrap">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-8 max-w-md w-full relative z-10 space-y-6">
          
          {/* Brand header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center bg-emerald-900 text-emerald-450 p-3 rounded-xl mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">PharmaNexus Console</h1>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
              High-Density Pharmacy POS Billing Terminal, AI-Powered RX Verification, and Multi-Branch Supply Ledger.
            </p>
          </div>

          {/* Real Credentials Helper Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs text-slate-600">
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block font-mono">Select Active Terminal Profile</span>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button 
                type="button"
                onClick={() => { setLoginEmail('admin@pharmapos.com'); setLoginPassword('admin123'); }}
                className="text-left bg-white border border-slate-200 hover:border-emerald-700 hover:text-emerald-950 rounded px-2 py-1 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                🛠️ Admin Profile
              </button>
              <button 
                type="button"
                onClick={() => { setLoginEmail('pharmacist@pharmapos.com'); setLoginPassword('admin123'); }}
                className="text-left bg-white border border-slate-200 hover:border-emerald-700 hover:text-emerald-950 rounded px-2 py-1 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                💊 Pharmacist Profile
              </button>
              <button 
                type="button"
                onClick={() => { setLoginEmail('cashier@pharmapos.com'); setLoginPassword('admin123'); }}
                className="text-left bg-white border border-slate-200 hover:border-emerald-700 hover:text-emerald-950 rounded px-2 py-1 font-bold transition flex items-center gap-1 cursor-pointer sm:col-span-2 text-center justify-center"
              >
                🛒 Cashier Profile (Mary Branch)
              </button>
            </div>
            <span className="block text-[9px] text-slate-400 font-mono text-center">Standard Passcode: `admin123`</span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl font-bold flex gap-1.5 items-center">
                <ShieldX className="w-4 h-4 shrink-0" /> {loginError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Corporate email address</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-xl px-4 py-2.5 text-slate-705 font-medium transition"
                  required
                  id="login_email_input"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Passcode key</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-xl px-4 py-2.5 text-slate-800 font-medium transition"
                  required
                  id="login_pass_input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold py-3 px-4 rounded-xl shadow-lg transition duration-200 tracking-wider uppercase text-xs cursor-pointer flex items-center justify-center gap-2"
              id="signin_submit_btn"
            >
              {isLoggingIn ? "Authorizing terminal..." : "Authorize Login Session"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // Active Authenticated Interface Layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app_mainframe">
      {/* High-Density Header */}
      <header className="bg-white border-b border-slate-250 shrink-0 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-900 text-white p-2 rounded-lg">
              <Building2 className="w-4 h-4 text-emerald-450" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none font-display">PharmaNexus</h1>
              <p className="text-[9px] text-slate-400 mt-1 font-mono tracking-wider font-semibold">
                CENTRAL OPERATIONS CONSOLE
              </p>
            </div>
          </div>

          {/* Right Session Status info & Live pill */}
          <div className="flex items-center gap-4">
            {/* Status Live Pill */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Online
            </div>

            <div className="bg-slate-100 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600 font-mono hidden sm:block">
              Branch: {currentUser.branchCode || 'CPB-01'}
            </div>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.name}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
                Role: {currentUser.role}
              </span>
            </div>

            <button 
              onClick={toggleTheme}
              className="bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-600 p-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
              title={`Switch to ${theme === 'light' ? 'High-Contrast Dark' : 'Standard Light'} Mode`}
              id="theme_toggle_btn"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-emerald-800" />
                  <span className="text-[9.5px] font-black font-mono tracking-wider uppercase hidden md:inline">Low-Light</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-[9.5px] font-black font-mono tracking-wider uppercase hidden md:inline">Light Mode</span>
                </>
              )}
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 hover:border-rose-100 p-2 rounded-lg transition cursor-pointer"
              title="Logout Session"
              id="top_logout_btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Connection Problem Ribbon */}
      {apiError && (
        <div className="bg-rose-600 text-white text-[11px] font-semibold py-2 px-4 shadow-sm flex items-center justify-between text-wrap leading-relaxed animate-pulse">
          <span>{apiError}</span>
          <button onClick={loadAllDatabases} className="underline hover:no-underline font-mono px-2 py-0.5 bg-white/10 rounded">Sync Retry</button>
        </div>
      )}

      {/* Main Panel grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Sidebar Nav (High-Density Emerald Theme) */}
        <nav className="lg:col-span-2 space-y-1 bg-emerald-900 p-3 border border-emerald-950 rounded-xl shadow-md text-emerald-50" id="navigation_rail">
          <div className="flex items-center gap-2 border-b border-emerald-800 pb-2.5 mb-2.5 pl-1">
            <div className="w-5.5 h-5.5 bg-emerald-400 rounded flex items-center justify-center font-bold text-emerald-950 text-xs font-display">+</div>
            <h2 className="font-extrabold tracking-wider text-xs text-white uppercase font-display">CONSOLE RAIL</h2>
          </div>

          <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-widest pl-2 mb-2 pb-1">MANAGEMENT</span>
          {visibleTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === tab.key ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
              }`}
              id={tab.id}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Dynamic Inner Tab Component Render */}
        <main className="lg:col-span-10 min-h-[520px]" id="tab_active_viewport">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              drugs={drugs} 
              sales={sales} 
              alerts={alerts} 
              navigateTo={navigateTo}
              userBranch={currentUser.branchId}
              onRefreshDatabases={loadAllDatabases}
            />
          )}

          {activeTab === 'pos' && (
            <POS 
              drugs={drugs} 
              prescriptions={prescriptions.filter(p => p.status === 'verified')}
              onCheckout={handlePOSCheckout} 
              currentUser={currentUser}
              userBranch={currentUser.branchId}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory 
              drugs={drugs} 
              onAddDrug={handleAddDrug} 
              onUpdateDrug={handleUpdateDrug} 
              onDeleteDrug={handleDeleteDrug}
              userBranch={currentUser.branchId}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'prescriptions' && (
            <PrescriptionCenter 
              prescriptions={prescriptions} 
              drugs={drugs}
              onUploadPrescription={handleUploadPrescription}
              onVerifyPrescription={handleVerifyPrescription}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersOrders 
              suppliers={suppliers} 
              purchaseOrders={purchaseOrders} 
              drugs={drugs}
              onAddSupplier={handleAddSupplier}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onReceivePO={handleReceivePO}
              onUpdatePOStatus={handleUpdatePOStatus}
            />
          )}

          {activeTab === 'ai' && (
            <AIAnalyst drugsSnapshot={drugs} />
          )}

          {activeTab === 'branches' && (
            <MultiBranch 
              branches={branches} 
              drugs={drugs} 
              onTransferStock={handleTransferStock}
              userBranch={currentUser.branchId}
            />
          )}

          {activeTab === 'audits' && (
            <NotificationAudits 
              alerts={alerts} 
              auditLogs={auditLogs}
              roles={roles}
              users={users}
              branches={branches}
              currentUser={currentUser}
              onCreateRole={handleCreateRole}
              onUpdateRolePermissions={handleUpdateRolePermissions}
              onDeleteRole={handleDeleteRole}
              onCreateUser={handleCreateUser}
              onUpdateUserRole={handleUpdateUserRole}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>

      </div>

      {/* Bottom Status Bar / High Density Telemetry */}
      <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-semibold text-slate-500 shrink-0 font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Database Sync: 100%
          </div>
          <div>Server Cluster: us-east-production-01</div>
          <div>API Latency: 18ms</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">v2.4.5-stable</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9.5px]">Last sync: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </footer>

      {/* Modern, glassmorphic interactive Logout Confirmation Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="logout_confirm_modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase font-mono tracking-wider">Confirm Sign Out</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed">
                  Are you sure you wish to end your active pharmacy terminal session? Any unsaved changes will match local storage keys.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-800 transition rounded-lg cursor-pointer"
                id="cancel_logout_btn"
              >
                Keep Active
              </button>
              <button
                onClick={handleLogoutActual}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition rounded-lg cursor-pointer shadow-sm"
                id="confirm_logout_btn"
              >
                Sign Out Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
