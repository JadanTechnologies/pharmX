import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Filter, AlertTriangle, 
  Calendar, RotateCcw, ShieldAlert, CheckCircle, HelpCircle,
  Sliders
} from 'lucide-react';
import { Drug } from '../types';

interface InventoryProps {
  drugs: Drug[];
  onAddDrug: (drugData: any) => Promise<Drug>;
  onUpdateDrug: (id: string, drugData: any) => Promise<Drug>;
  onDeleteDrug: (id: string) => Promise<boolean>;
  userBranch: string;
  currentUser: any;
}

export default function Inventory({ drugs, onAddDrug, onUpdateDrug, onDeleteDrug, userBranch, currentUser }: InventoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'near_expiry'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Low Stock Category Threshold Settings State
  const [categoryThresholds, setCategoryThresholds] = useState<Record<string, number>>(() => {
    const defaultVals = {
      'Analgesics': 15,
      'Antibiotics': 30,
      'Cardiovascular': 20,
      'Antidiabetics': 25,
      'Vitamins & Supplements': 15,
      'Hormones & Insulin': 20,
      'Other': 10
    };
    try {
      const saved = localStorage.getItem('pharma_category_thresholds');
      return saved ? JSON.parse(saved) : defaultVals;
    } catch {
      return defaultVals;
    }
  });

  const handleUpdateThreshold = (categoryName: string, newValue: number) => {
    const updated = { ...categoryThresholds, [categoryName]: newValue };
    setCategoryThresholds(updated);
    localStorage.setItem('pharma_category_thresholds', JSON.stringify(updated));
  };

  // Modal controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // Form States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Analgesics');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formCost, setFormCost] = useState('0');
  const [formSelling, setFormSelling] = useState('0');
  const [formQuantity, setFormQuantity] = useState('0');
  const [formLowStock, setFormLowStock] = useState('15');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(drugs.map(d => d.category)));
  }, [drugs]);

  // Sync newly discovered categories with default trigger thresholds dynamically
  useEffect(() => {
    let changed = false;
    const updated = { ...categoryThresholds };
    categories.forEach(cat => {
      if (cat && updated[cat] === undefined) {
        updated[cat] = 10;
        changed = true;
      }
    });
    if (changed) {
      setCategoryThresholds(updated);
      localStorage.setItem('pharma_category_thresholds', JSON.stringify(updated));
    }
  }, [categories]);

  // SVG Barcode Generator simulating Code-128
  const renderSvgBarcode = (barcode: string) => {
    // Generate a simple stylized representation based on the barcode string character hash
    const lines: boolean[] = [];
    let seed = 0;
    for (let i = 0; i < barcode.length; i++) {
      seed += barcode.charCodeAt(i);
    }

    // Pseudo-random deterministic lines
    for (let k = 0; k < 35; k++) {
      const bit = ((seed + k * 17) & 9) % 3 === 0;
      lines.push(bit);
    }

    return (
      <div className="flex flex-col items-center">
        <svg width="100" height="30" className="opacity-80">
          {lines.map((bit, idx) => (
            <rect 
              key={idx}
              x={idx * 2.8} 
              y="0" 
              width={bit ? "1" : "2"} 
              height="28" 
              fill="#1e293b" 
            />
          ))}
        </svg>
        <span className="font-mono text-[9px] tracking-widest text-[#64748b] mt-0.5">{barcode}</span>
      </div>
    );
  };

  // Filter logic matching active branch, search input & status selection
  const filteredDrugs = useMemo(() => {
    const today = new Date('2026-06-03');

    return drugs.filter(d => {
      // Filter Branch
      if (d.branchId !== userBranch) return false;

      // Filter Search
      const textMatches = searchQuery === '' || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.barcode.includes(searchQuery);

      if (!textMatches) return false;

      // Filter Category Table
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;

      // Filter tab selectors
      if (filterType === 'low_stock') {
        const threshold = categoryThresholds[d.category] !== undefined ? categoryThresholds[d.category] : d.lowStockThreshold;
        return d.quantity <= threshold;
      }
      if (filterType === 'near_expiry') {
        const exp = new Date(d.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 60; // Flag warning window of 60 days
      }

      return true;
    });
  }, [drugs, userBranch, searchQuery, categoryFilter, filterType, categoryThresholds]);

  const openAddModal = () => {
    setFormName('');
    setFormCategory('Analgesics');
    setFormManufacturer('');
    setFormBatch(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormBarcode(Math.floor(890123000000 + Math.random() * 899999).toString());
    setFormExpiry('2027-12-31');
    setFormCost('2.50');
    setFormSelling('5.50');
    setFormQuantity('100');
    setFormLowStock('20');
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (drug: Drug) => {
    setSelectedDrug(drug);
    setFormName(drug.name);
    setFormCategory(drug.category);
    setFormManufacturer(drug.manufacturer);
    setFormBatch(drug.batchNumber);
    setFormBarcode(drug.barcode);
    setFormExpiry(drug.expiryDate);
    setFormCost(drug.costPrice.toString());
    setFormSelling(drug.sellingPrice.toString());
    setFormQuantity(drug.quantity.toString());
    setFormLowStock(drug.lowStockThreshold.toString());
    setFormError('');
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const hasInventoryWrite = currentUser?.role === 'admin' || currentUser?.permissions?.includes('inventory_write');
    if (!hasInventoryWrite) {
      setFormError("Access Denied: Only administrators or staff with inventory write authorization are permitted to catalogue new medications.");
      return;
    }

    if (!formName || !formManufacturer || !formBatch || !formBarcode || !formExpiry) {
      setFormError("All catalog fields are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      const drugPayload = {
        name: formName,
        category: formCategory,
        manufacturer: formManufacturer,
        batchNumber: formBatch,
        barcode: formBarcode,
        expiryDate: formExpiry,
        costPrice: Number(formCost),
        sellingPrice: Number(formSelling),
        quantity: Number(formQuantity),
        lowStockThreshold: Number(formLowStock),
        branchId: userBranch
      };

      await onAddDrug(drugPayload);
      setIsAddOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create drug entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrug) return;
    setFormError('');

    const hasInventoryWrite = currentUser?.role === 'admin' || currentUser?.permissions?.includes('inventory_write');
    if (!hasInventoryWrite) {
      setFormError("Access Denied: Only administrators or authorized staff with inventory write permission can modify drug details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const drugPayload = {
        name: formName,
        category: formCategory,
        manufacturer: formManufacturer,
        batchNumber: formBatch,
        barcode: formBarcode,
        expiryDate: formExpiry,
        costPrice: Number(formCost),
        sellingPrice: Number(formSelling),
        quantity: Number(formQuantity),
        lowStockThreshold: Number(formLowStock)
      };

      await onUpdateDrug(selectedDrug.id, drugPayload);
      setIsEditOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to update drug metrics.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await onDeleteDrug(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    } catch (err: any) {
      alert("Failed to delete item: " + err.message);
    }
  };

  return (
    <div className="space-y-6" id="inventory_tab_root">
      
      {/* Tab Selectors & Filter Blocks */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
        {/* Quick Lists tabs */}
        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-150 rounded-lg shrink-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              filterType === 'all' 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-400 hover:text-slate-800'
            }`}
            id="inv_tab_all"
          >
            All Stock Catalog
          </button>
          <button 
            onClick={() => setFilterType('low_stock')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
              filterType === 'low_stock' 
                ? 'bg-rose-500 text-white shadow-xs' 
                : 'text-rose-600 hover:bg-rose-50'
            }`}
            id="inv_tab_low"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stocks
          </button>
          <button 
            onClick={() => setFilterType('near_expiry')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
              filterType === 'near_expiry' 
                ? 'bg-amber-500 text-white shadow-xs' 
                : 'text-amber-600 hover:bg-amber-50'
            }`}
            id="inv_tab_expiry"
          >
            <Calendar className="w-3.5 h-3.5" /> Near Expiry (60d)
          </button>
        </div>

        {/* Action Buttons */}
        {currentUser?.role === 'admin' || currentUser?.permissions?.includes('inventory_write') ? (
          <button 
            onClick={openAddModal}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition.transform active:scale-95 shadow-sm shrink-0"
            id="inv_add_drug_btn"
          >
            <Plus className="w-4 h-4" /> Add New Medication
          </button>
        ) : (
          <button 
            disabled
            className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-75 shrink-0"
            id="inv_add_drug_btn_disabled"
            title="Your role does not have authorization to catalogue new medical inventory lines."
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Add Medication (Requires Inventory Write)
          </button>
        )}
      </div>

      {/* Dynamic 'Inventory Threshold' Rulebook Control Panel (Admins edit, staff read-only) */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-3" id="stock_rules_container">
        {currentUser?.role === 'admin' || currentUser?.permissions?.includes('inventory_write') ? (
          <div className="space-y-3" id="admin_thresholds_panel">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-mono">Category Low-Stock Thresholds Settings</h4>
              </div>
              <span className="text-[9px] font-mono select-none px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-100/30 font-black tracking-wider uppercase">
                ⚙️ Admin Managed
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed max-w-4xl">
              Administrators can define custom safety stock levels for specific drug categories below. Medications belonging to these groups will automatically signal warning flags on the dashboard and inventory console when their stock falls at or below these configured counts.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
              {Object.keys(categoryThresholds).map((cat) => {
                const val = categoryThresholds[cat];
                return (
                  <div key={cat} className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex flex-col justify-between transition hover:border-slate-350 select-none">
                    <span className="text-[9.5px] text-slate-400 font-extrabold truncate block uppercase tracking-wide">
                      {cat}
                    </span>
                    <div className="flex items-center justify-between mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateThreshold(cat, Math.max(0, val - 5))}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-950 text-[11px] font-bold transition select-none cursor-pointer"
                        title="Decrease limit by 5"
                        id={`dec_thresh_${cat.replace(/\s+/g, '_')}`}
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-black text-slate-800 dark:text-emerald-400">{val} <span className="text-[9px] font-medium text-slate-400">qty</span></span>
                      <button
                        type="button"
                        onClick={() => handleUpdateThreshold(cat, val + 5)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-950 text-[11px] font-bold transition select-none cursor-pointer"
                        title="Increase limit by 5"
                        id={`inc_thresh_${cat.replace(/\s+/g, '_')}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2" id="staff_rules_view">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-600" />
                <h4 className="font-extrabold text-slate-755 text-xs font-mono uppercase">Active Low-Stock Threshold Limits</h4>
              </div>
              <span className="text-[8.5px] font-mono select-none px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                🔒 Read Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Low stock indicators are governed by the following administrator-defined category limits:
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {Object.keys(categoryThresholds).map((cat) => {
                const val = categoryThresholds[cat];
                return (
                  <div key={cat} className="bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-md text-[10px] text-slate-500 flex items-center gap-1.5 font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[8.5px]">{cat}:</span>
                    <span className="font-mono text-slate-850 dark:text-slate-350">{val} units</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Database Filters Search Line */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="inventory_search_row">
        {/* Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search database inventory lines by chemical name, barcode, manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 shadow-xs"
            id="inv_search_input"
          />
        </div>

        {/* Category drop */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 outline-hidden focus:border-emerald-500 text-slate-600 shadow-xs"
            id="inv_category_filter"
          >
            <option value="all">All Medical Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="inventory_datatable">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-4">Medication details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Supplier Batch / Expiry</th>
                <th className="p-4 text-center">In Stock Qty</th>
                <th className="p-4">Price Matrix</th>
                <th className="p-4 text-center">Barcode</th>
                <th className="p-4 text-center">Control actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDrugs.map((drug) => {
                const isOutOfStock = drug.quantity === 0;
                const effectiveThreshold = categoryThresholds[drug.category] !== undefined ? categoryThresholds[drug.category] : drug.lowStockThreshold;
                const isLowStock = drug.quantity <= effectiveThreshold;
                const isExpiring = new Date(drug.expiryDate) <= new Date('2026-08-01');

                return (
                  <tr key={drug.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-700 text-sm">{drug.name}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{drug.manufacturer}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                        {drug.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-slate-600">Batch {drug.batchNumber}</div>
                      <div className={`text-[10px] mt-0.5 font-semibold ${isExpiring ? 'text-rose-600' : 'text-slate-400'}`}>
                        Exp: {drug.expiryDate}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`font-bold text-sm ${
                        isOutOfStock ? 'text-rose-600 font-extrabold' : 
                        isLowStock ? 'text-amber-500' : 'text-slate-800'
                      }`}>
                        {drug.quantity} units
                      </div>
                      <div 
                        className="text-[10px] text-slate-400 mt-0.5 underline decoration-dotted cursor-help" 
                        title={categoryThresholds[drug.category] !== undefined ? "Category-specific custom safe stock trigger level defined by Admin" : "Global/Drug item default low stock warning threshold"}
                      >
                        Trigger: {effectiveThreshold}
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="text-slate-700"><span className="text-slate-400 text-[10px] mr-1">Sell:</span>${drug.sellingPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400"><span className="text-slate-400 text-[9px] mr-1">Cost:</span>${drug.costPrice.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-center">
                      {renderSvgBarcode(drug.barcode)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => openEditModal(drug)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          id={`inv_edit_${drug.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(drug.id, drug.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          id={`inv_del_${drug.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDrugs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No medications match your filter selections or keyword.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Drug Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">Create Database Medication Record</h4>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Medication Name / Chemical Formulation</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg, Atorvastatin 10mg"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                  id="inv_form_name"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Category Group</label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-600"
                  id="inv_form_cat"
                >
                  <option value="Analgesics">Analgesics</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Antidiabetics">Antidiabetics</option>
                  <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                  <option value="Hormones & Insulin">Hormones & Insulin</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Manufacturer Laboratory</label>
                <input 
                  type="text" 
                  value={formManufacturer} 
                  onChange={(e) => setFormManufacturer(e.target.value)}
                  placeholder="e.g. Pfizer, Sandoz, GSK"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                  id="inv_form_man"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Batch Number (Tracking)</label>
                <input 
                  type="text" 
                  value={formBatch} 
                  onChange={(e) => setFormBatch(e.target.value)}
                  placeholder="e.g. AMX-202611"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                  id="inv_form_batch"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Expiry Date Tag</label>
                <input 
                  type="date" 
                  value={formExpiry} 
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-750"
                  required
                  id="inv_form_exp"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Barcode Standard Code</label>
                <input 
                  type="text" 
                  value={formBarcode} 
                  onChange={(e) => setFormBarcode(e.target.value)}
                  placeholder="e.g. 890123456001"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-707"
                  required
                  id="inv_form_barcode"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Wholesale Cost Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formCost} 
                  onChange={(e) => setFormCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700 font-mono"
                  id="inv_form_cost"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Retail Selling Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formSelling} 
                  onChange={(e) => setFormSelling(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700 font-mono"
                  id="inv_form_sell"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Initial Stock Quantity</label>
                <input 
                  type="number" 
                  value={formQuantity} 
                  onChange={(e) => setFormQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  id="inv_form_qty"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Low Stock Warning Limit</label>
                <input 
                  type="number" 
                  value={formLowStock} 
                  onChange={(e) => setFormLowStock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-705"
                  id="inv_form_limit"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 justify-end border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                id="inv_form_submit"
              >
                {isSubmitting ? "Onboarding..." : "Register Drug Line"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Medication Modal */}
      {isEditOpen && selectedDrug && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">Edit Medication Configs: {selectedDrug.name}</h4>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Medication Name / Chemical Formulation</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Category Group</label>
                <input 
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Manufacturer Laboratory</label>
                <input 
                  type="text" 
                  value={formManufacturer} 
                  onChange={(e) => setFormManufacturer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Batch Number (Tracking)</label>
                <input 
                  type="text" 
                  value={formBatch} 
                  onChange={(e) => setFormBatch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Expiry Date Tag</label>
                <input 
                  type="date" 
                  value={formExpiry} 
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-707"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Wholesale Cost Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formCost} 
                  onChange={(e) => setFormCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Retail Selling Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formSelling} 
                  onChange={(e) => setFormSelling(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Current Stock Quantity</label>
                <input 
                  type="number" 
                  value={formQuantity} 
                  onChange={(e) => setFormQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-700 font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Low Stock Warning Limit</label>
                <input 
                  type="number" 
                  value={formLowStock} 
                  onChange={(e) => setFormLowStock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-3 py-2 outline-hidden text-slate-705"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 justify-end border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsEditOpen(false)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer"
                id="inv_form_save"
              >
                {isSubmitting ? "Saving changes..." : "Save Medication Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sleek, Non-Blocking Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete_confirm_modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800 uppercase font-mono tracking-wider">De-Catalogue Drug</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you absolutely sure you wish to permanently de-catalogue <span className="font-bold text-slate-700">{deleteConfirmName}</span> from active pharmacy databases? This action is irreversible.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition rounded-lg cursor-pointer font-mono"
                id="cancel_delete_btn"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition rounded-lg cursor-pointer shadow-sm font-mono"
                id="confirm_delete_btn"
              >
                De-Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline Close Icon
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinelinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
