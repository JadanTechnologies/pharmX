/**
 * Shared Type Definitions for Pharmacy Management System
 */

export type UserRole = 'admin' | 'pharmacist' | 'cashier' | 'inventory_manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  code: string;
  phone: string;
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  barcode: string;
  expiryDate: string; // YYYY-MM-DD
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balanceDue: number;
}

export interface PurchaseOrderItem {
  drugId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string; // YYYY-MM-DD
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalCost: number;
  branchId: string;
}

export interface PrescriptionDrug {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  status: 'verified' | 'unverified';
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientAge?: number;
  doctorName: string;
  doctorLicense?: string;
  date: string; // YYYY-MM-DD
  drugs: PrescriptionDrug[];
  imageUrl?: string;
  status: 'pending' | 'verified' | 'dispensed' | 'rejected';
  notes?: string;
}

export interface SaleItem {
  drugId: string;
  name: string;
  quantity: number;
  price: number;
  batchNumber: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string or YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'card';
  cashierId: string;
  cashierName: string;
  branchId: string;
  prescriptionId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  role: UserRole;
  action: string;
  timestamp: string; // ISO String
  details?: string;
}

export interface NotificationAlert {
  id: string;
  type: 'expiry' | 'low_stock' | 'payment' | 'system';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  date: string;
  read: boolean;
  linkedId?: string;
}
