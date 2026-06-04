import React, { useState } from 'react';
import {
  Settings, Package, TrendingUp, Users, DollarSign, Clock, AlertCircle,
  Zap, BarChart3, ShoppingCart, RefreshCw, Lock, Mail, FileText, Target
} from 'lucide-react';

interface AdminFeaturesProps {
  currentUser: any;
}

export default function AdminFeatures({ currentUser }: AdminFeaturesProps) {
  const [activeFeature, setActiveFeature] = useState<string>('overview');

  const features = [
    { id: 'reorder', name: 'Auto Reorder Management', icon: <RefreshCw className="w-5 h-5" />, badge: 'Inventory' },
    { id: 'loyalty', name: 'Customer Loyalty Program', icon: <Users className="w-5 h-5" />, badge: 'CRM' },
    { id: 'expense', name: 'Expense Tracking', icon: <DollarSign className="w-5 h-5" />, badge: 'Finance' },
    { id: 'tax', name: 'Tax Management', icon: <FileText className="w-5 h-5" />, badge: 'Compliance' },
    { id: 'notifications', name: 'SMS/Email Alerts', icon: <Mail className="w-5 h-5" />, badge: 'Comms' },
    { id: 'shifts', name: 'Shift Management', icon: <Clock className="w-5 h-5" />, badge: 'HR' },
    { id: 'refills', name: 'Prescription Refills', icon: <AlertCircle className="w-5 h-5" />, badge: 'Rx' },
    { id: 'interactions', name: 'Drug Interactions', icon: <Zap className="w-5 h-5" />, badge: 'Safety' },
    { id: 'supplier', name: 'Supplier Analytics', icon: <BarChart3 className="w-5 h-5" />, badge: 'Supply' },
    { id: 'pricing', name: 'Price Management', icon: <TrendingUp className="w-5 h-5" />, badge: 'Sales' },
    { id: 'backup', name: 'Backup & Restore', icon: <Lock className="w-5 h-5" />, badge: 'System' },
    { id: 'search', name: 'Advanced Search', icon: <ShoppingCart className="w-5 h-5" />, badge: 'Tools' },
    { id: 'batch', name: 'Batch Management', icon: <Package className="w-5 h-5" />, badge: 'Inventory' },
    { id: 'returns', name: 'Returns & Refunds', icon: <RefreshCw className="w-5 h-5" />, badge: 'Sales' },
    { id: 'staff', name: 'Staff Performance', icon: <Users className="w-5 h-5" />, badge: 'HR' },
    { id: 'reconciliation', name: 'Stock Reconciliation', icon: <BarChart3 className="w-5 h-5" />, badge: 'Inventory' },
    { id: 'contracts', name: 'Supplier Contracts', icon: <FileText className="w-5 h-5" />, badge: 'Procurement' },
    { id: 'promotions', name: 'Promotions Manager', icon: <Target className="w-5 h-5" />, badge: 'Marketing' },
    { id: 'receivables', name: 'Receivables Tracking', icon: <DollarSign className="w-5 h-5" />, badge: 'Finance' },
    { id: 'compliance', name: 'Quality Compliance', icon: <AlertCircle className="w-5 h-5" />, badge: 'Quality' },
    { id: 'recall', name: 'Drug Recall Mgmt', icon: <AlertCircle className="w-5 h-5" />, badge: 'Safety' },
    { id: 'feedback', name: 'Customer Feedback', icon: <Users className="w-5 h-5" />, badge: 'CRM' }
  ];

  const renderFeatureContent = () => {
    switch(activeFeature) {
      case 'reorder':
        return <AutoReorderFeature />;
      case 'loyalty':
        return <LoyaltyProgramFeature />;
      case 'expense':
        return <ExpenseTrackingFeature />;
      case 'tax':
        return <TaxManagementFeature />;
      case 'notifications':
        return <NotificationsFeature />;
      case 'shifts':
        return <ShiftManagementFeature />;
      case 'refills':
        return <RefillTrackingFeature />;
      case 'interactions':
        return <DrugInteractionsFeature />;
      case 'supplier':
        return <SupplierAnalyticsFeature />;
      case 'pricing':
        return <PriceManagementFeature />;
      case 'backup':
        return <BackupRestoreFeature />;
      case 'search':
        return <AdvancedSearchFeature />;
      case 'batch':
        return <BatchManagementFeature />;
      case 'returns':
        return <ReturnsRefundsFeature />;
      case 'staff':
        return <StaffPerformanceFeature />;
      case 'reconciliation':
        return <StockReconciliationFeature />;
      case 'contracts':
        return <ContractsFeature />;
      case 'promotions':
        return <PromotionsFeature />;
      case 'receivables':
        return <ReceivablesFeature />;
      case 'compliance':
        return <ComplianceFeature />;
      case 'recall':
        return <RecallManagementFeature />;
      case 'feedback':
        return <FeedbackFeature />;
      default:
        return <OverviewFeature features={features} />;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            Admin Features & Operations Hub
          </h1>
          <p className="text-slate-300">Comprehensive management tools for business operations</p>
        </div>

        {/* Feature Grid Navigation */}
        {activeFeature === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {features.map(feature => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-cyan-400 group-hover:text-cyan-300 transition">{feature.icon}</div>
                  <span className="text-[9px] px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-semibold">{feature.badge}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{feature.name}</h3>
              </button>
            ))}
          </div>
        ) : null}

        {/* Back Button */}
        {activeFeature !== 'overview' && (
          <button
            onClick={() => setActiveFeature('overview')}
            className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
          >
            ← Back to Overview
          </button>
        )}

        {/* Feature Content */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          {renderFeatureContent()}
        </div>
      </div>
    </div>
  );
}

// Feature Components
const OverviewFeature = ({ features }: any) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-white mb-4">22 Advanced Admin Features</h2>
    <p className="text-slate-300 mb-8">Click on any feature card above to manage it</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">📦 Inventory</h3>
        <p className="text-sm text-slate-300">Auto-reorder, batch tracking, stock reconciliation</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">👥 Customer Mgmt</h3>
        <p className="text-sm text-slate-300">Loyalty program, feedback system, receivables</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">💰 Finance</h3>
        <p className="text-sm text-slate-300">Expense tracking, tax management, pricing</p>
      </div>
    </div>
  </div>
);

const AutoReorderFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Automatic Reorder Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">Set Reorder Points</h3>
        <p className="text-sm text-slate-300 mb-3">Define minimum stock levels for automatic purchase orders</p>
        <input type="number" placeholder="Min quantity" className="w-full px-3 py-2 bg-slate-600 text-white rounded text-sm" />
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">Supplier Assignment</h3>
        <p className="text-sm text-slate-300 mb-3">Assign preferred suppliers per item</p>
        <select className="w-full px-3 py-2 bg-slate-600 text-white rounded text-sm">
          <option>Select Supplier</option>
        </select>
      </div>
    </div>
    <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition">
      Save Auto-Reorder Configuration
    </button>
  </div>
);

const LoyaltyProgramFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Customer Loyalty Program</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-700/50 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-cyan-400 mb-2">2,450</div>
        <p className="text-sm text-slate-300">Active Members</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-cyan-400 mb-2">₦48,900</div>
        <p className="text-sm text-slate-300">Points Redeemed</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-cyan-400 mb-2">12%</div>
        <p className="text-sm text-slate-300">Repeat Purchase Rate</p>
      </div>
    </div>
  </div>
);

const ExpenseTrackingFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Expense Tracking</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-700/50">
          <th className="px-4 py-2 text-left text-cyan-400">Expense Type</th>
          <th className="px-4 py-2 text-left text-cyan-400">Amount</th>
          <th className="px-4 py-2 text-left text-cyan-400">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-slate-700">
          <td className="px-4 py-2 text-white">Rent</td>
          <td className="px-4 py-2 text-white">₦50,000</td>
          <td className="px-4 py-2 text-white">June 1</td>
        </tr>
        <tr className="border-b border-slate-700">
          <td className="px-4 py-2 text-white">Utilities</td>
          <td className="px-4 py-2 text-white">₦5,000</td>
          <td className="px-4 py-2 text-white">June 4</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const TaxManagementFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Tax Management System</h2>
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <h3 className="font-bold text-cyan-400 mb-3">Tax Configuration</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="text-white font-medium">GST Rate:</label>
          <input type="number" defaultValue="5" className="w-32 px-3 py-2 bg-slate-600 text-white rounded text-sm" />
          <span className="text-slate-300">%</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-white font-medium">Local Tax:</label>
          <input type="number" defaultValue="2" className="w-32 px-3 py-2 bg-slate-600 text-white rounded text-sm" />
          <span className="text-slate-300">%</span>
        </div>
      </div>
    </div>
  </div>
);

const NotificationsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">SMS/Email Notifications</h2>
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-4 h-4" />
        <span className="text-white">Low stock alerts</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-4 h-4" />
        <span className="text-white">Expiry warnings</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-4 h-4" />
        <span className="text-white">Customer order receipts</span>
      </label>
    </div>
  </div>
);

const ShiftManagementFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Shift Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">Morning Shift</h3>
        <p className="text-sm text-slate-300">6 AM - 2 PM</p>
        <p className="text-sm text-slate-300">Staff: 3</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="font-bold text-cyan-400 mb-2">Evening Shift</h3>
        <p className="text-sm text-slate-300">2 PM - 10 PM</p>
        <p className="text-sm text-slate-300">Staff: 3</p>
      </div>
    </div>
  </div>
);

const RefillTrackingFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Prescription Refill Tracking</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-700/50">
          <th className="px-4 py-2 text-left text-cyan-400">Patient</th>
          <th className="px-4 py-2 text-left text-cyan-400">Drug</th>
          <th className="px-4 py-2 text-left text-cyan-400">Next Refill</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-slate-700">
          <td className="px-4 py-2 text-white">John Smith</td>
          <td className="px-4 py-2 text-white">Aspirin</td>
          <td className="px-4 py-2 text-white">June 10</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const DrugInteractionsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Drug Interaction Checker</h2>
    <div className="bg-amber-900/20 border border-amber-600/50 p-4 rounded-lg">
      <p className="text-amber-100 font-semibold mb-2">⚠️ Interaction Warning</p>
      <p className="text-sm text-slate-300">Aspirin + Warfarin: Increased bleeding risk</p>
    </div>
  </div>
);

const SupplierAnalyticsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Supplier Performance Analytics</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <p className="text-slate-400 text-sm mb-2">On-Time Delivery</p>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
        </div>
        <p className="text-sm text-white font-bold mt-2">92%</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <p className="text-slate-400 text-sm mb-2">Quality Score</p>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{width: '88%'}}></div>
        </div>
        <p className="text-sm text-white font-bold mt-2">88%</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <p className="text-slate-400 text-sm mb-2">Price Competitiveness</p>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
        </div>
        <p className="text-sm text-white font-bold mt-2">85%</p>
      </div>
    </div>
  </div>
);

const PriceManagementFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Price Management</h2>
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white">Base Cost</span>
          <input type="number" defaultValue="100" className="w-32 px-3 py-2 bg-slate-600 text-white rounded" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white">Markup %</span>
          <input type="number" defaultValue="30" className="w-32 px-3 py-2 bg-slate-600 text-white rounded" />
        </div>
        <div className="flex justify-between items-center border-t border-slate-600 pt-3">
          <span className="text-cyan-400 font-bold">Selling Price</span>
          <span className="text-cyan-400 font-bold">₦130</span>
        </div>
      </div>
    </div>
  </div>
);

const BackupRestoreFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Backup & Restore</h2>
    <div className="space-y-3">
      <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition">
        ✓ Create Backup Now
      </button>
      <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition">
        Restore from Backup
      </button>
    </div>
  </div>
);

const AdvancedSearchFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Advanced Search</h2>
    <div className="space-y-3">
      <input type="text" placeholder="Search drugs, customers, orders..." className="w-full px-4 py-2 bg-slate-600 text-white rounded" />
      <div className="flex gap-2 flex-wrap">
        <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm">Date Range</button>
        <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm">Category</button>
        <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm">Status</button>
      </div>
    </div>
  </div>
);

const BatchManagementFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Batch Management</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-700/50">
          <th className="px-4 py-2 text-left text-cyan-400">Batch</th>
          <th className="px-4 py-2 text-left text-cyan-400">Qty</th>
          <th className="px-4 py-2 text-left text-cyan-400">Expiry</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-slate-700">
          <td className="px-4 py-2 text-white">BATCH001</td>
          <td className="px-4 py-2 text-white">500</td>
          <td className="px-4 py-2 text-white">Dec 2026</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const ReturnsRefundsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Returns & Refunds</h2>
    <div className="text-center py-8">
      <p className="text-3xl font-bold text-white mb-2">₦12,450</p>
      <p className="text-slate-300">Total Refunds This Month</p>
    </div>
  </div>
);

const StaffPerformanceFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Staff Performance Metrics</h2>
    <div className="space-y-3">
      <div className="bg-slate-700/50 p-3 rounded">
        <div className="flex justify-between mb-2">
          <span className="text-white">Transactions</span>
          <span className="text-cyan-400 font-bold">245</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">Avg Transaction</span>
          <span className="text-cyan-400 font-bold">₦1,250</span>
        </div>
      </div>
    </div>
  </div>
);

const StockReconciliationFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Stock Reconciliation</h2>
    <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition">
      Start Inventory Count
    </button>
  </div>
);

const ContractsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Supplier Contracts</h2>
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <p className="text-white font-semibold mb-2">Active Contracts: 5</p>
      <p className="text-slate-300 text-sm">Manage supplier agreements and terms</p>
    </div>
  </div>
);

const PromotionsFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Promotions Manager</h2>
    <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition">
      + Create New Promotion
    </button>
  </div>
);

const ReceivablesFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Receivables Tracking</h2>
    <div className="text-center py-8">
      <p className="text-3xl font-bold text-white mb-2">₦45,000</p>
      <p className="text-slate-300">Outstanding Receivables</p>
    </div>
  </div>
);

const ComplianceFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Quality Compliance</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-900/20 p-3 rounded text-center">
        <p className="text-2xl font-bold text-green-400">✓</p>
        <p className="text-sm text-white">Storage Temp OK</p>
      </div>
      <div className="bg-green-900/20 p-3 rounded text-center">
        <p className="text-2xl font-bold text-green-400">✓</p>
        <p className="text-sm text-white">Humidity OK</p>
      </div>
    </div>
  </div>
);

const RecallManagementFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Drug Recall Management</h2>
    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition">
      Report Product Recall
    </button>
  </div>
);

const FeedbackFeature = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Customer Feedback</h2>
    <div className="space-y-3">
      <div className="bg-slate-700/50 p-4 rounded">
        <div className="flex justify-between mb-2">
          <span className="text-white font-semibold">Avg Rating</span>
          <span className="text-yellow-400 font-bold">4.6/5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white text-sm">Total Reviews</span>
          <span className="text-white font-bold">328</span>
        </div>
      </div>
    </div>
  </div>
);
