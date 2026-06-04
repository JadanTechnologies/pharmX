import { useState, useMemo } from 'react';
import { 
  TrendingUp, CalendarCheck, Package, ShoppingCart, 
  ArrowUpRight, AlertTriangle, ShieldCheck, Tag, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, 
  PieChart, Pie
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

export default function DashboardOverview({ drugs, sales, alerts, navigateTo, userBranch, onRefreshDatabases }: DashboardOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigateIfAllowed = (tab: string) => {
    navigateTo(tab);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshDatabases();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    // Total Inventory Valuation (wholesale and retail selling prices)
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    drugs.forEach(d => {
      // Branch filtering
      if (d.branchId === userBranch) {
        totalCostValuation += d.costPrice * d.quantity;
        totalRetailValuation += d.sellingPrice * d.quantity;
        if (d.quantity === 0) {
          outOfStockCount++;
        } else if (d.quantity <= d.lowStockThreshold) {
          lowStockCount++;
        }
      }
    });

    // Sales Calculations (All sales in DB, with emphasis on current date "2026-06-03")
    const targetDateStr = '2026-06-03';
    let todaySalesTotal = 0;
    let todayInvoiceCount = 0;
    let totalSalesVolume = 0;

    sales.forEach(s => {
      const saleDate = s.date.slice(0, 10);
      if (saleDate === targetDateStr) {
        todaySalesTotal += s.total;
        todayInvoiceCount++;
      }
      totalSalesVolume += s.total;
    });

    const activeExpiryAlerts = alerts.filter(a => a.type === 'expiry' && !a.read).length;

    return {
      todaySalesTotal,
      todayInvoiceCount,
      totalCostValuation,
      totalRetailValuation,
      totalSalesVolume,
      lowStockCount,
      outOfStockCount,
      activeExpiryAlerts
    };
  }, [drugs, sales, alerts, userBranch]);

  // Chart Data: Hourly sales simulation for today (2026-06-03)
  const todaySalesTrendData = useMemo(() => {
    return [
      { name: '08:00 AM', Sales: 120, Transactions: 2 },
      { name: '10:00 AM', Sales: todaySalesTotalFactor(0.2, 340), Transactions: 4 },
      { name: '12:00 PM', Sales: todaySalesTotalFactor(0.35, 520), Transactions: 8 },
      { name: '02:00 PM', Sales: todaySalesTotalFactor(0.15, 230), Transactions: 3 },
      { name: '04:00 PM', Sales: todaySalesTotalFactor(0.3, 440), Transactions: 6 },
      { name: '06:00 PM', Sales: stats.todaySalesTotal > 0 ? stats.todaySalesTotal * 0.1 : 80, Transactions: 1 },
    ];

    function todaySalesTotalFactor(factor: number, fallback: number) {
      return stats.todaySalesTotal > 0 ? stats.todaySalesTotal * factor : fallback;
    }
  }, [stats.todaySalesTotal]);

  // Chart Data: Quantity per medicine Category
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    drugs.forEach(d => {
      if (d.branchId === userBranch) {
        counts[d.category] = (counts[d.category] || 0) + d.quantity;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [drugs, userBranch]);

  // Chart Data: Top 5 selling drugs based on sales history
  const topSellingDrugsData = useMemo(() => {
    const quantities: { [key: string]: number } = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        quantities[i.name] = (quantities[i.name] || 0) + i.quantity;
      });
    });

    return Object.entries(quantities)
      .map(([name, Quantity]) => ({ name: name.split(' ')[0], Quantity })) // Shorten name
      .sort((a, b) => b.Quantity - a.Quantity)
      .slice(0, 5);
  }, [sales]);

  // Colors for Recharts Pie
  const COLORS = ['#059669', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];

  return (
    <div className="space-y-5 animate-fade-in" id="dashboard_tab_root">
      {/* High-Density Action Banner */}
      <div className="bg-emerald-900 border border-emerald-950 rounded-xl p-5 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase font-mono mb-1">Operational Overview</p>
          <h2 className="text-2xl font-extrabold tracking-tight font-display mb-1.5">Pharmacy Central Dashboard</h2>
          <p className="text-emerald-100/90 text-xs leading-relaxed font-medium">
            Welcome back to the PharmaNexus Portal. You are logged into the <strong className="text-white font-semibold">Central Plaza</strong> workspace. 
            Review real-time sales velocities, track batch stock expiries, and verify prescriptions live.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button 
              onClick={() => navigateIfAllowed('pos')}
              className="bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              id="dash_btn_pos"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Open POS Terminal
            </button>
            <button 
              onClick={() => navigateIfAllowed('prescriptions')}
              className="bg-emerald-800 hover:bg-emerald-700/80 text-emerald-100 font-bold text-xs px-3.5 py-2 rounded-md border border-emerald-700/60 transition cursor-pointer flex items-center gap-1.5"
              id="dash_btn_presc"
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Prescription OCR
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-emerald-800 hover:bg-emerald-700/80 text-emerald-100 font-bold text-xs px-3.5 py-2 rounded-md border border-emerald-700/60 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Refetch systems databases"
              id="dash_btn_refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              {isRefreshing ? 'Syncing...' : 'Sync Refresh'}
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-6 select-none pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-emerald-450 animate-pulse" />
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="stats_panel_grid">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-205 p-4 rounded-lg shadow-xs hover:border-slate-300 transition duration-150">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">Today's Sales Revenue</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-display">${stats.todaySalesTotal.toFixed(2)}</h3>
              <p className="text-emerald-600 text-[11px] mt-1.5 flex items-center font-bold">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2% <span className="text-slate-400 font-normal ml-1">vs yesterday</span>
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 p-2 rounded">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-3.5 pt-2.5 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Invoices Processed</span>
            <span className="font-bold text-slate-705">{stats.todayInvoiceCount} items</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-205 p-4 rounded-lg shadow-xs hover:border-slate-300 transition duration-150">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">Inventory Wholesale Value</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-display">${stats.totalCostValuation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
              <p className="text-teal-600 text-[11px] mt-1.5 font-bold">
                Retail cap: <span className="text-teal-700 font-mono">${stats.totalRetailValuation.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </p>
            </div>
            <div className="bg-teal-50 text-teal-700 p-2 rounded">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-3.5 pt-2.5 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Drugs Stocked Categories</span>
            <span className="font-bold text-slate-705">{categoryData.length} classes</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div 
          onClick={() => navigateIfAllowed('inventory')}
          className="bg-white border border-slate-205 p-4 rounded-lg shadow-xs hover:border-slate-300 transition duration-150 cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">Out Of / Low Stock</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-display font-mono">
                <span className="text-rose-600 font-extrabold">{stats.outOfStockCount}</span>
                <span className="text-slate-300 font-normal mx-1">/</span>
                <span className="text-amber-500 font-extrabold">{stats.lowStockCount}</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-1.5 group-hover:text-emerald-700 transition font-bold">
                Needs purchase reorders &rarr;
              </p>
            </div>
            <div className="bg-rose-50 text-rose-700 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-3.5 pt-2.5 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Minimum warnings</span>
            <span className="font-bold text-slate-705">{stats.outOfStockCount + stats.lowStockCount} drugs</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div 
          onClick={() => navigateIfAllowed('audits')}
          className="bg-white border border-slate-205 p-4 rounded-lg shadow-xs hover:border-slate-300 transition duration-150 cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">Expiry compliance warnings</p>
              <h3 className="text-xl font-extrabold text-rose-600 mt-1 font-display font-mono">{stats.activeExpiryAlerts}</h3>
              <p className="text-slate-500 text-[11px] mt-1.5 group-hover:text-emerald-750 transition font-bold">
                Batches expiring soon &rarr;
              </p>
            </div>
            <div className="bg-amber-50 text-amber-700 p-2 rounded">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-3.5 pt-2.5 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Quarantine window</span>
            <span className="font-bold text-slate-705 font-mono">60 days</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="analytics_visualizers">
        {/* Area Chart: Hourly Revenue Trend today */}
        <div className="bg-white p-4 rounded-lg border border-slate-205 lg:col-span-2 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-display">Hourly Sales Activity Velocities</h3>
              <p className="text-[11px] text-slate-400">Current Sales Flow for today {targetDateStr()}</p>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-150 font-mono">LIVE FEED</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={todaySalesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Sales Volume']}
                />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Inventory Breakdown */}
        <div className="bg-white p-4 rounded-lg border border-slate-205 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-display">Stock Category Mix</h3>
            <p className="text-[11px] text-slate-400 mb-2">Distribution by medication class</p>
            <div className="h-40 relative flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} units`, 'Quantity']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-xs font-mono">No local stocks logged in branch.</div>
              )}
              <div className="absolute flex flex-col items-center">
                <span className="text-[8px] text-slate-400 font-bold uppercase font-mono">Units</span>
                <span className="text-base font-extrabold text-slate-800 font-mono">
                  {categoryData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-1 mt-1 border-t border-slate-100 pt-2" id="category_mix_legend">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="text-slate-500 font-mono font-bold shrink-0">{item.value} qnt</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="dashboard_lower_grid">
        {/* Bar Chart: Top Selling Drugs */}
        <div className="bg-white p-4 rounded-lg border border-slate-205 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-display">Medication Sales Velocity</h3>
          <p className="text-[11px] text-slate-400 mb-3">Top-selling compounds ordered by unit sales</p>
          <div className="h-56">
            {topSellingDrugsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingDrugsData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={9} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Quantity" fill="#0d9488" radius={[0, 3, 3, 0]} barSize={12}>
                    {topSellingDrugsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#059669' : '#0d9488'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                No checkout invoices found to plot demand trends.
              </div>
            )}
          </div>
        </div>

        {/* Recent Checkout Activities */}
        <div className="bg-white p-4 rounded-lg border border-slate-205 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-display">Live Checkout Invoices</h3>
                <p className="text-[11px] text-slate-400">Recent customer ticket receipts</p>
              </div>
              <button 
                onClick={() => navigateIfAllowed('audits')}
                className="text-emerald-700 text-xs font-bold hover:underline hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer font-mono"
              >
                Log Ledger &rarr;
              </button>
            </div>
            
            <div className="space-y-2" id="recent_invoice_list">
              {sales.slice(0, 4).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition duration-150">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-850 px-2 py-1 rounded-md font-mono text-[9px] font-bold border border-emerald-100/50">
                      INV
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-800 font-mono">{sale.invoiceNumber}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{sale.customerName} &bull; {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-slate-900 font-mono">${sale.total.toFixed(2)}</span>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono">{sale.items.reduce((acc, curr) => acc + curr.quantity, 0)} items</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-mono">
                  Zero sales registered in POS today. Open the POS Terminal to start checkout.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center gap-2.5 mt-3">
            <span className="bg-amber-100 text-amber-800 p-1.5 rounded-md self-start shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </span>
            <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-700 font-semibold">Regulatory Standard:</strong> Verify prescription claims for restricted classes before POS checkout. Use the AI Clinical Analyst to audit safe dispense schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function targetDateStr() {
    return "(June 3, 2026)";
  }
}
