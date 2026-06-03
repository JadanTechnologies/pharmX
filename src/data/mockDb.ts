import { 
  User, Branch, Drug, Supplier, PurchaseOrder, Prescription, Sale, ActivityLog, NotificationAlert 
} from '../types';

export interface RoleDefinition {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    key: "admin",
    name: "System Admin",
    description: "Full administrative controls. Can configure permissions, view audit logs, catalogue new drug recipes, and override clinical flags.",
    isSystem: true,
    permissions: ["pos_checkout", "inventory_write", "prescription_verify", "procurement_order", "inter_branch_transfer", "security_admin"]
  },
  {
    key: "pharmacist",
    name: "Registered Pharmacist",
    description: "Can check out drugs, run OCR scan verifications, and approve clinical matching of chemical substances.",
    isSystem: true,
    permissions: ["pos_checkout", "prescription_verify", "inter_branch_transfer"]
  },
  {
    key: "cashier",
    name: "Retail Cashier",
    description: "Standard terminal profile to operate cashier checkouts and process client invoices under retail prices.",
    isSystem: true,
    permissions: ["pos_checkout"]
  },
  {
    key: "inventory_manager",
    name: "Inventory Manager",
    description: "Can update inventory, issue Purchase Orders to medical suppliers, and arrange inter-branch shipments.",
    isSystem: true,
    permissions: ["inventory_write", "procurement_order", "inter_branch_transfer"]
  }
];

export const DEFAULT_USERS: (User & { branchCode: string })[] = [
  { id: "usr_1", email: "admin@pharmacy.com", name: "Alice Smith (CEO)", role: "admin" as any, branchId: "branch_1", branchCode: "CPB-01" },
  { id: "usr_2", email: "pharmacist@pharmacy.com", name: "Dr. Robert Chen, RPh", role: "pharmacist" as any, branchId: "branch_1", branchCode: "CPB-01" },
  { id: "usr_3", email: "cashier@pharmacy.com", name: "John Doe", role: "cashier" as any, branchId: "branch_1", branchCode: "CPB-01" },
  { id: "usr_4", email: "inv_manager@pharmacy.com", name: "Sarah Jenkins", role: "inventory_manager" as any, branchId: "branch_2", branchCode: "SMB-02" }
];

export const DEFAULT_BRANCHES: Branch[] = [
  { id: "branch_1", name: "Central Plaza Branch", location: "102 Medical Drive, Suite A", code: "CPB-01", phone: "+1 (555) 102-3920" },
  { id: "branch_2", name: "St. Mary Hospital Branch", location: "St. Mary Hospital Ground Floor", code: "SMB-02", phone: "+1 (555) 205-5942" }
];

export const DEFAULT_DRUGS: Drug[] = [
  {
    id: "drg_1",
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    manufacturer: "Sigma Labs",
    batchNumber: "AMX-202604",
    barcode: "890123456001",
    expiryDate: "2027-12-15",
    costPrice: 7.2,
    sellingPrice: 12.5,
    quantity: 129,
    lowStockThreshold: 30,
    branchId: "branch_1"
  },
  {
    id: "drg_2",
    name: "Atorvastatin 20mg",
    category: "Cardiovascular",
    manufacturer: "Pfizer Inc.",
    batchNumber: "ATV-202601",
    barcode: "890123456002",
    expiryDate: "2027-08-20",
    costPrice: 15,
    sellingPrice: 25.5,
    quantity: 85,
    lowStockThreshold: 20,
    branchId: "branch_1"
  },
  {
    id: "drg_3",
    name: "Metformin 850mg",
    category: "Antidiabetics",
    manufacturer: "Bristol-Myers Squibb",
    batchNumber: "MTF-202511",
    barcode: "890123456003",
    expiryDate: "2027-05-10",
    costPrice: 4.1,
    sellingPrice: 8.5,
    quantity: 15,
    lowStockThreshold: 20,
    branchId: "branch_1"
  },
  {
    id: "drg_4",
    name: "Paracetamol 500mg (Panadol)",
    category: "Analgesics",
    manufacturer: "GSK Pharma",
    batchNumber: "PCT-202602",
    barcode: "890123456004",
    expiryDate: "2028-09-30",
    costPrice: 0.8,
    sellingPrice: 2,
    quantity: 450,
    lowStockThreshold: 50,
    branchId: "branch_1"
  },
  {
    id: "drg_5",
    name: "Ibuprofen 400mg",
    category: "Analgesics",
    manufacturer: "Bayer AG",
    batchNumber: "IBU-202605",
    barcode: "890123456005",
    expiryDate: "2026-06-20",
    costPrice: 2.1,
    sellingPrice: 4.5,
    quantity: 220,
    lowStockThreshold: 25,
    branchId: "branch_1"
  },
  {
    id: "drg_6",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    manufacturer: "Sandoz",
    batchNumber: "LSN-202509",
    barcode: "890123456006",
    expiryDate: "2027-02-14",
    costPrice: 10,
    sellingPrice: 18,
    quantity: 0,
    lowStockThreshold: 15,
    branchId: "branch_1"
  },
  {
    id: "drg_7",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    manufacturer: "Sandoz",
    batchNumber: "LSN-202509-B",
    barcode: "890123456006",
    expiryDate: "2027-02-14",
    costPrice: 10,
    sellingPrice: 18,
    quantity: 48,
    lowStockThreshold: 15,
    branchId: "branch_2"
  },
  {
    id: "drg_8",
    name: "Vitamin C 1000mg",
    category: "Vitamins & Supplements",
    manufacturer: "Nature Made",
    batchNumber: "VTC-202603",
    barcode: "890123456008",
    expiryDate: "2026-11-20",
    costPrice: 2.5,
    sellingPrice: 5.9,
    quantity: 320,
    lowStockThreshold: 40,
    branchId: "branch_1"
  },
  {
    id: "drg_9",
    name: "Insulin Glargine 100 U/mL",
    category: "Hormones & Insulin",
    manufacturer: "Sanofi-Aventis",
    batchNumber: "INS-202610",
    barcode: "890123456009",
    expiryDate: "2027-04-12",
    costPrice: 35,
    sellingPrice: 65,
    quantity: 42,
    lowStockThreshold: 10,
    branchId: "branch_1"
  }
];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup_1",
    name: "PharmaCare Distributors Ltd",
    contactPerson: "Sarah Connor",
    phone: "+1 (555) 789-0123",
    email: "sarah@pharmacaredist.com",
    address: "49 Industrial Blvd, Sector 4",
    balanceDue: 450
  },
  {
    id: "sup_2",
    name: "Global BioHealth Pharmaceuticals",
    contactPerson: "Marcus Aurelius",
    phone: "+1 (555) 234-5678",
    email: "marcus@globalbiohealth.com",
    address: "88 Empire State Way, NY",
    balanceDue: 1200
  },
  {
    id: "sup_3",
    name: "Astra Supplies International",
    contactPerson: "David Miller",
    phone: "+1 (555) 345-6789",
    email: "david.m@astrasupplies.com",
    address: "7 London Bridge Rd, London",
    balanceDue: 0
  }
];

export const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po_1",
    orderNumber: "PO-2026-0001",
    supplierId: "sup_1",
    supplierName: "PharmaCare Distributors Ltd",
    orderDate: "2026-05-15",
    status: "received",
    items: [
      {
        drugId: "drg_1",
        name: "Amoxicillin 500mg",
        quantity: 100,
        costPrice: 7.2
      },
      {
        drugId: "drg_4",
        name: "Paracetamol 500mg (Panadol)",
        quantity: 200,
        costPrice: 0.8
      }
    ],
    totalCost: 880,
    branchId: "branch_1"
  },
  {
    id: "po_2",
    orderNumber: "PO-2026-0002",
    supplierId: "sup_2",
    supplierName: "Global BioHealth Pharmaceuticals",
    orderDate: "2026-06-01",
    status: "pending",
    items: [
      {
        drugId: "drg_2",
        name: "Atorvastatin 20mg",
        quantity: 50,
        costPrice: 15
      },
      {
        drugId: "drg_9",
        name: "Insulin Glargine 100 U/mL",
        quantity: 15,
        costPrice: 35
      }
    ],
    totalCost: 1275,
    branchId: "branch_1"
  }
];

export const DEFAULT_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx_1",
    prescriptionNumber: "RX-77281",
    patientName: "Emma Watson",
    patientAge: 32,
    doctorName: "Dr. Gregory House, MD",
    doctorLicense: "LIC-NY-99212",
    date: "2026-06-02",
    drugs: [
      {
        name: "Amoxicillin 500mg",
        dosage: "1 tablet organic",
        duration: "7 days",
        instructions: "Take 3 times daily after meals",
        status: "verified"
      },
      {
        name: "Paracetamol 500mg",
        dosage: "500mg as needed",
        duration: "3 days",
        instructions: "Take 1-2 tablets every 6 hours for fever",
        status: "verified"
      }
    ],
    status: "verified",
    notes: "Ensure patient registers allergy list before checkout."
  },
  {
    id: "rx_2",
    prescriptionNumber: "RX-10294",
    patientName: "Arthur Dent",
    patientAge: 42,
    doctorName: "Dr. Leonard McCoy, MD",
    doctorLicense: "LIC-SF-24901",
    date: "2026-06-03",
    drugs: [
      {
        name: "Atorvastatin 20mg",
        dosage: "1 pill daily",
        duration: "30 days",
        instructions: "Take once daily before sleep",
        status: "unverified"
      }
    ],
    status: "pending",
    notes: "Requires signature validation."
  }
];

export const DEFAULT_SALES: Sale[] = [
  {
    id: "sal_1780506501323",
    invoiceNumber: "INV-100237",
    date: "2026-06-03T17:08:21.323Z",
    customerName: "Emma Watson",
    customerPhone: "",
    items: [
      {
        drugId: "drg_1",
        name: "Amoxicillin 500mg",
        quantity: 1,
        price: 12.5,
        batchNumber: "AMX-202604"
      }
    ],
    subtotal: 12.5,
    tax: 0.625,
    discount: 0,
    total: 13.125,
    paymentMethod: "cash",
    cashierId: "usr_3",
    cashierName: "John Doe",
    branchId: "branch_1"
  },
  {
    id: "sal_2",
    invoiceNumber: "INV-1002302",
    date: "2026-06-03T09:40:15Z",
    customerName: "Avery Johnson",
    customerPhone: "555-9081",
    items: [
      {
        drugId: "drg_2",
        name: "Atorvastatin 20mg",
        quantity: 3,
        price: 25.5,
        batchNumber: "ATV-202601"
      },
      {
        drugId: "drg_8",
        name: "Vitamin C 1000mg",
        quantity: 2,
        price: 5.9,
        batchNumber: "VTC-202603"
      }
    ],
    subtotal: 88.3,
    tax: 4.41,
    discount: 0,
    total: 92.71,
    paymentMethod: "cash",
    cashierId: "usr_3",
    cashierName: "John Doe",
    branchId: "branch_1"
  }
];

export const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: "log_1",
    userId: "usr_1",
    userEmail: "admin@pharmacy.com",
    role: "admin",
    action: "User Sign In",
    timestamp: "2026-06-03T17:19:15.601Z",
    details: "Authorized successfully on branch branch_1"
  },
  {
    id: "log_2",
    userId: "usr_3",
    userEmail: "cashier@pharmacy.com",
    role: "cashier",
    action: "POS Checkout",
    timestamp: "2026-06-03T17:08:21.325Z",
    details: "Invoice INV-100237 processed totaling $13.13 under payment method 'cash'"
  }
];

export const DEFAULT_ALERTS: NotificationAlert[] = [
  {
    id: "alt_stk_low_drg_3",
    type: "low_stock",
    severity: "warning",
    title: "Low Inventory Warning",
    message: "Metformin 850mg is low on stock: 15 units left (Threshold: 20)",
    date: "2026-06-03",
    read: false,
    linkedId: "drg_3"
  },
  {
    id: "alt_exp_drg_5",
    type: "expiry",
    severity: "danger",
    title: "Upcoming Stock Expiry",
    message: "Ibuprofen 400mg (Batch IBU-202605) will expire on 2026-06-20 (in 17 days)",
    date: "2026-06-03",
    read: false,
    linkedId: "drg_5"
  },
  {
    id: "alt_stk_out_drg_6",
    type: "low_stock",
    severity: "danger",
    title: "Out of Stock Alert",
    message: "Lisinopril 10mg is completely out of stock. Customers cannot checkout this item.",
    date: "2026-06-03",
    read: false,
    linkedId: "drg_6"
  }
];
