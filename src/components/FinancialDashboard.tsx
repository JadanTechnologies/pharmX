import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieIcon, CreditCard } from 'lucide-react';

interface FinancialDashboardProps {
  currentUser: any;
}

export default function FinancialDashboard({ currentUser }: FinancialDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate financial data
    const mockData = {
      totalRevenue: 245000,
      totalCosts: 145000,
      netProfit: 100000,
      profitMargin: 40.8,
      dailyRevenue: [
        { date: 'Jun 1', revenue: 5200, costs: 2800 },
        { date: 'Jun 2', revenue: 6100, costs: 3200 },
        { date: 'Jun 3', revenue: 4800, costs: 2600 },
        { date: 'Jun 4', revenue: 7300, costs: 3900 }
      ],
      categoryRevenue: [
        { category: 'Antibiotics', revenue: 65000, percentage: 26.5 },
        { category: 'Pain Relief', revenue: 55000, percentage: 22.4 },
        { category: 'Vitamins', revenue: 45000, percentage: 18.4 },
        { category: 'Chronic Mgmt', revenue: 38000, percentage: 15.5 },
        { category: 'OTC', revenue: 42000, percentage: 17.1 }
      ],
      expenses: [
        { name: 'COGS', value: 85000, percentage: 58.6 },
        { name: 'Staff', value: 35000, percentage: 24.1 },
        { name: 'Operations', value: 15000, percentage: 10.3 },
        { name: 'Utilities', value: 10000, percentage: 6.9 }
      ]
    };

    setDashboardData(mockData);
    setLoading(false);
  }, [timeRange]);

  if (loading || !dashboardData) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              Financial Dashboard
            </h1>
            <p className="text-slate-600">Revenue, expenses, and profitability analysis</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === range
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              ${dashboardData.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-green-600 text-sm font-semibold">+12.5% vs last period</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-sm font-medium">Total Costs</p>
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              ${dashboardData.totalCosts.toLocaleString()}
            </h3>
            <p className="text-blue-600 text-sm font-semibold">59.2% of revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-600">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-sm font-medium">Net Profit</p>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              ${dashboardData.netProfit.toLocaleString()}
            </h3>
            <p className="text-emerald-600 text-sm font-semibold">{dashboardData.profitMargin}% margin</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-600 text-sm font-medium">Avg Daily Revenue</p>
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              ${(dashboardData.totalRevenue / 30).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-purple-600 text-sm font-semibold">Daily average</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Cost Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue vs Costs Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.dailyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="costs" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {dashboardData.categoryRevenue.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {dashboardData.categoryRevenue.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{cat.category}</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: COLORS[idx % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-slate-900">${cat.revenue.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">{cat.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Operating Expenses</h3>
            <div className="space-y-4">
              {dashboardData.expenses.map((exp: any, idx: number) => (
                <div key={idx} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-slate-900">{exp.name}</p>
                    <p className="font-bold text-slate-900">${exp.value.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-slate-600"
                      style={{ width: `${exp.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{exp.percentage}% of total expenses</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
