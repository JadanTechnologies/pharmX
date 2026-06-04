import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import {
  Download, Printer, Filter, TrendingUp, AlertTriangle, 
  Package, DollarSign, Calendar, Clock, RefreshCw
} from 'lucide-react';

interface ReportsProps {
  currentUser: any;
}

export default function Reports({ currentUser }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'transfers'>('sales');
  const [salesReport, setSalesReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [transfersReport, setTransfersReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [sales, inventory, transfers] = await Promise.all([
        fetch('/api/reports/sales').then(r => r.json()),
        fetch('/api/reports/inventory').then(r => r.json()),
        fetch('/api/reports/transfers').then(r => r.json())
      ]);

      if (sales.error) setError(sales.error);
      if (inventory.error) setError(inventory.error);
      if (transfers.error) setError(transfers.error);

      setSalesReport(sales);
      setInventoryReport(inventory);
      setTransfersReport(transfers);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const printReport = () => {
    window.print();
  };

  const downloadReport = (data: any, filename: string) => {
    const csv = convertToCSV(data);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const convertToCSV = (data: any) => {
    const headers = Object.keys(data).join(',');
    const rows = Object.values(data).map(v => (typeof v === 'object' ? JSON.stringify(v) : v)).join(',');
    return `${headers}\n${rows}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            Reports & Analytics Dashboard
          </h1>
          <p className="text-slate-600">Comprehensive pharmacy operational insights</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveReport('sales')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeReport === 'sales'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            💰 Sales Report
          </button>
          <button
            onClick={() => setActiveReport('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeReport === 'inventory'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            📦 Inventory Report
          </button>
          <button
            onClick={() => setActiveReport('transfers')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeReport === 'transfers'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            🔄 Transfer Report
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={printReport}
              className="px-4 py-2 rounded-lg font-medium bg-slate-600 text-white hover:bg-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => {
                const report = activeReport === 'sales' ? salesReport : activeReport === 'inventory' ? inventoryReport : transfersReport;
                downloadReport(report, `${activeReport}-report-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
              className="px-4 py-2 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-slate-600">Loading reports...</p>
          </div>
        )}

        {/* Sales Report */}
        {activeReport === 'sales' && salesReport && !loading && (
          <div className="space-y-6 print:break-inside-avoid">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Sales</p>
                <h3 className="text-3xl font-bold text-slate-900">{salesReport.totalSales}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-slate-900">${salesReport.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Items Sold</p>
                <h3 className="text-3xl font-bold text-slate-900">{salesReport.totalItemsSold}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Avg Transaction</p>
                <h3 className="text-3xl font-bold text-slate-900">${salesReport.averageTransactionValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Methods Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cash', value: salesReport.paymentMethods.cash },
                      { name: 'Card', value: salesReport.paymentMethods.card },
                      { name: 'Transfer', value: salesReport.paymentMethods.transfer }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top 10 Best-Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Drug Name</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Units Sold</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.topProducts.map((product: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900">{product.drugName}</td>
                        <td className="text-right py-3 px-4 text-slate-700">{product.unitsSold}</td>
                        <td className="text-right py-3 px-4 font-semibold text-emerald-600">${product.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Report */}
        {activeReport === 'inventory' && inventoryReport && !loading && (
          <div className="space-y-6 print:break-inside-avoid">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Items</p>
                <h3 className="text-3xl font-bold text-slate-900">{inventoryReport.totalDrugs}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Units in Stock</p>
                <h3 className="text-3xl font-bold text-slate-900">{inventoryReport.totalUnitsInStock}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Inventory Value</p>
                <h3 className="text-3xl font-bold text-slate-900">${inventoryReport.totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-rose-600">
                <p className="text-slate-600 text-sm font-medium mb-1">Alerts</p>
                <h3 className="text-3xl font-bold text-slate-900">{inventoryReport.lowStockItems.length + inventoryReport.expiredBatches.length}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Low Stock Items ({inventoryReport.lowStockItems.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {inventoryReport.lowStockItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-300 rounded text-sm">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-amber-700">Current: {item.quantity} | Threshold: {item.lowStockThreshold}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Expiry Alerts ({inventoryReport.expiredBatches.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {inventoryReport.expiredBatches.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-rose-50 border border-rose-300 rounded text-sm">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-rose-700">Batch: {item.batchNumber} | Expired: {new Date(item.expiryDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Inventory by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryReport.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalUnits" fill="#10b981" name="Units" />
                  <Bar dataKey="count" fill="#3b82f6" name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transfers Report */}
        {activeReport === 'transfers' && transfersReport && !loading && (
          <div className="space-y-6 print:break-inside-avoid">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <p className="text-slate-600 text-sm font-medium mb-1">Total Transfers</p>
              <h3 className="text-4xl font-bold text-slate-900">{transfersReport.totalTransfers}</h3>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Transfer History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Details</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfersReport.transfers.map((transfer: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700 text-sm">{new Date(transfer.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-900">{transfer.details}</td>
                        <td className="py-3 px-4 text-slate-700">{transfer.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style>{`
          @media print {
            body { background: white; }
            .print\\:break-inside-avoid { break-inside: avoid; }
          }
        `}</style>
      </div>
    </div>
  );
}
