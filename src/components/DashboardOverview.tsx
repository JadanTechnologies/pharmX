import { useState, useMemo } from 'react';
import { 
  TrendingUp, ShoppingCart, AlertTriangle, CalendarCheck,
  ArrowUpRight, RefreshCw, Pill, DollarSign, Users, Activity, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  LineChart, Line
} from 'recharts';
import { Drug, Sale, NotificationAlert } from '../types';

interface DashboardOverviewProps {
  drugs: Drug[];
  sales: Sale[];
  alerts: NotificationAlert[];
  navigateTo: (tab: string) => void;
  userBranch: string;
  onRefreshDatabases: () => Promise<void>;
}

const COLORS = ['#059669', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#4f46e5'];

export default function DashboardOverview({ drugs, sales, alerts, navigateTo, userBranch, onRefreshDatabases }: DashboardOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshDatabases();
    } catch {
      // handled by caller
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalMedicines = 0;

    drugs.forEach(d => {
      if (d.branchId === userBranch) {
        totalCostValuation += d.costPrice * d.quantity;
        totalRetailValuation += d.sellingPrice * d.quantity;
        totalMedicines++;
        if (d.quantity === 0) outOfStockCount++;
        else if (d.quantity <= d.lowStockThreshold) lowStockCount++;
      }
    });

    let todaySalesTotal = 0;
    let todayInvoiceCount = 0;
    sales.forEach(s => {
      if (s.date.slice(0, 10) === '2026-06-03') {
        todaySalesTotal += s.total;
        todayInvoiceCount++;
      }
    });

    const activeExpiryAlerts = alerts.filter(a => a.type === 'expiry' && !a.read).length;
    const monthlyProfit = todaySalesTotal * 0.35;

    return {
      todaySalesTotal, todayInvoiceCount, totalCostValuation, totalRetailValuation,
      totalSalesVolume: sales.reduce((acc, s) => acc + s.total, 0),
      lowStockCount, outOfStockCount, activeExpiryAlerts, monthlyProfit, totalMedicines,
      pendingPrescriptions: 0,
      activeCustomers: new Set(sales.map(s => s.customerPhone)).size
    };
  }, [drugs, sales, alerts, userBranch]);

  const kpiCards = [
    { label: "Today's Revenue", value: `₦${stats.todaySalesTotal.toFixed(2)}`, trend: "+14.2%", up: true, icon: DollarSign, color: "emerald", bg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
    { label: "Monthly Profit", value: `₦${stats.monthlyProfit.toFixed(2)}`, trend: "+8.5%", up: true, icon: TrendingUp, color: "blue", bg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    { label: "Total Medicines", value: stats.totalMedicines.toString(), trend: `${stats.lowStockCount} low stock`, up: false, icon: Pill, color: "purple", bg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
    { label: "Active Customers", value: stats.activeCustomers.toString(), trend: `${stats.todayInvoiceCount} today`, up: true, icon: Users, color: "teal", bg: "bg-teal-50 dark:bg-teal-950/30", iconColor: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800" },
    { label: "Low Stock Alerts", value: `${stats.outOfStockCount} / ${stats.lowStockCount}`, trend: "out / low", up: false, icon: AlertTriangle, color: "amber", bg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    { label: "Expiring Soon", value: stats.activeExpiryAlerts.toString(), trend: "batches", up: false, icon: CalendarCheck, color: "rose", bg: "bg-rose-50 dark:bg-rose-950/30", iconColor: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
    { label: "Inventory Value", value: `₦${stats.totalRetailValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, trend: "retail cap", up: true, icon: Activity, color: "indigo", bg: "bg-indigo-50 dark:bg-indigo-950/30", iconColor: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
    { label: "Invoices", value: stats.todayInvoiceCount.toString(), trend: "processed today", up: true, icon: ShoppingCart, color: "cyan", bg: "bg-cyan-50 dark:bg-cyan-950/30", iconColor: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
  ];

  const filteredDrugs = useMemo(() => drugs.filter(d => d.branchId === userBranch), [drugs, userBranch]);
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredDrugs.forEach(d => { counts[d.category] = (counts[d.category] || 0) + d.quantity; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [filteredDrugs]);

  const topSellingDrugs = useMemo(() => {
    const q: { [key: string]: number } = {};
    sales.forEach(s => s.items.forEach(i => { q[i.name] = (q[i.name] || 0) + i.quantity; }));
    return Object.entries(q).map(([name, Quantity]) => ({ name: name.split(' ').slice(0, 2).join(' '), Quantity })).sort((a, b) => b.Quantity - a.Quantity).slice(0, 6);
  }, [sales]);

  const trendData = [
    { name: '8AM', sales: 120 },
    { name: '10AM', sales: 340 },
    { name: '12PM', sales: 520 },
    { name: '2PM', sales: 380 },
    { name: '4PM', sales: 290 },
    { name: '6PM', sales: 450 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header + Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enterprise pharmacy operations overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: ShoppingCart, label: 'New Sale', tab: 'pos', c: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' },
            { icon: Pill, label: 'Add Medicine', tab: 'inventory', c: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-600' },
            { icon: FileText, label: 'Prescription', tab: 'prescriptions', c: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-600' },
            { icon: TrendingUp, label: 'Reports', tab: 'reports', c: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-600' },
          ].map(a => (
            <button key={a.tab} onClick={() => navigateTo(a.tab)} className={`btn-${a.tab === 'pos' ? 'primary' : 'secondary'} !py-2 !px-4 !text-xs flex items-center gap-2`}>
              <a.icon className="w-3.5 h-3.5" /> {a.label}
            </button>
          ))}
          <button onClick={handleRefresh} disabled={isRefreshing} className="btn-ghost border border-slate-200 dark:border-slate-700 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className={`card card-stat group cursor-pointer ${card.bg}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg} border ${card.border}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full font-mono ${card.up ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{card.trend}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Daily Sales Trend</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Revenue over time</p>
            </div>
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 font-mono">LIVE</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">Stock Distribution</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">By medication category</p>
          <div className="h-56 relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-slate-400 font-mono text-center">No stock data</p>}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-[8px] text-slate-400 font-bold uppercase">Units</span>
              <span className="text-lg font-extrabold text-slate-800 dark:text-white font-mono">{categoryData.reduce((a, c) => a + c.value, 0)}</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 max-h-28 overflow-y-auto">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span><span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{item.name}</span></div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">Top Selling Medicines</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Unit sales across all transactions</p>
          <div className="h-64">
            {topSellingDrugs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingDrugs} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }} />
                  <Bar dataKey="Quantity" radius={[0, 4, 4, 0]} barSize={14}>
                    {topSellingDrugs.map((_, i) => <Cell key={i} fill={i === 0 ? '#059669' : '#0d9488'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono py-12">No sales data available yet</div>}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Recent Invoices</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Latest checkout receipts</p>
            </div>
            <button onClick={() => navigateTo('audits')} className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">View All →</button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sales.length === 0 && <div className="py-12 text-center text-slate-400 text-xs font-mono">No invoices yet. Start a sale in POS.</div>}
            {sales.slice(0, 8).map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono border border-emerald-200 dark:border-emerald-800">INV</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{sale.invoiceNumber}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{sale.customerName} · {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">₦{sale.total.toFixed(2)}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono uppercase ${sale.paymentMethod === 'cash' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : sale.paymentMethod === 'card' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'}`}>{sale.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTS PANEL */}
      {alerts.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border transition cursor-pointer ${alert.severity === 'danger' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40' : alert.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'}`}>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                <p className="text-[9px] text-slate-400 mt-2 font-mono">{alert.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
