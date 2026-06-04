import React, { useState, useMemo } from 'react';
import { 
  GitCommit, ArrowRightLeft, Building2, MapPin, Phone, 
  Tag, RefreshCw, CheckCircle2, ShieldAlert, AlertCircle, Sparkles
} from 'lucide-react';
import { Branch, Drug } from '../types';

interface MultiBranchProps {
  branches: Branch[];
  drugs: Drug[];
  currentUser: any;
  onTransferStock: (payload: any) => Promise<boolean>;
  userBranch: string;
}

export default function MultiBranch({ branches, drugs, currentUser, onTransferStock, userBranch }: MultiBranchProps) {
  const [selectedBarcode, setSelectedBarcode] = useState('');
  const [fromBranchId, setFromBranchId] = useState('branch_2');
  const [toBranchId, setToBranchId] = useState('branch_1');
  const [transferQty, setTransferQty] = useState('10');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group unique medications based on barcode to display stock comparison grids
  const medicationComparisonGrid = useMemo(() => {
    const map: { [barcode: string]: { name: string; category: string; [branchId: string]: any } } = {};

    drugs.forEach(d => {
      if (!map[d.barcode]) {
        map[d.barcode] = {
          name: d.name,
          category: d.category,
        };
      }
      map[d.barcode][d.branchId] = d.quantity;
    });

    return Object.entries(map).map(([barcode, data]) => ({
      barcode,
      ...data
    }));
  }, [drugs]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedBarcode) {
      setErrorMessage("Please select a medication to initiate transfer.");
      return;
    }
    if (fromBranchId === toBranchId) {
      setErrorMessage("Source and destination branch locations must be distinct.");
      return;
    }
    
    const qty = Number(transferQty);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage("Transfer quantity must be a positive integer.");
      return;
    }

    // Verify source stock quantity client-side first
    const sourceDrug = drugs.find(d => d.barcode === selectedBarcode && d.branchId === fromBranchId);
    if (!sourceDrug || sourceDrug.quantity < qty) {
      setErrorMessage(`Insufficient stock at selected source branch. Current supply: ${sourceDrug ? sourceDrug.quantity : 0} units.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        drugBarcode: selectedBarcode,
        fromBranchId,
        toBranchId,
        transferQuantity: qty
      };

      await onTransferStock(payload);
      
      const matchedMed = drugs.find(d => d.barcode === selectedBarcode);
      const fromName = branches.find(b => b.id === fromBranchId)?.name || fromBranchId;
      const toName = branches.find(b => b.id === toBranchId)?.name || toBranchId;

      setSuccessMessage(`Successfully routed transfer of ${qty} units of '${matchedMed?.name}' from ${fromName} into ${toName}! Stock has been synchronized.`);
      setTransferQty('10');
    } catch (e: any) {
      setErrorMessage(e.message || "Branch transfer failed. Contact systems administrator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="multi_branch_panel">
      {/* Locations map simulation cards */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {branches.map(branch => {
            // Count total inventory units inside this branch specifically
            const totalBranchUnits = drugs
              .filter(d => d.branchId === branch.id)
              .reduce((acc, curr) => acc + curr.quantity, 0);

            const isUserHome = branch.id === userBranch;

            return (
              <div 
                key={branch.id} 
                className={`bg-white border p-5 rounded-xl shadow-xs hover:shadow-md transition relative overflow-hidden ${
                  isUserHome ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-slate-100'
                }`}
              >
                {isUserHome && (
                  <span className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                    Your Active Branch
                  </span>
                )}
                
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600 shrink-0" /> {branch.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Code: {branch.code}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-505">
                  <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {branch.location}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400 shrink-0" /> {branch.phone}</p>
                </div>

                <div className="border-t border-slate-50 mt-4 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Stocked Volume</span>
                  <strong className="font-extrabold text-slate-700 text-sm">{totalBranchUnits} units</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Inventory Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Cross-Branch Inventory Map</h3>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">Branch Stocks Contrast</span>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3">Chemical Compound</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3 text-center">Central Plaza</th>
                  <th className="p-3 text-center">St. Mary Hospital</th>
                  <th className="p-3 text-center">Total System Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {medicationComparisonGrid.map((row) => {
                  const b1Qty = row['branch_1'] || 0;
                  const b2Qty = row['branch_2'] || 0;
                  const total = b1Qty + b2Qty;

                  return (
                    <tr key={row.barcode} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <span className="font-bold text-slate-700 block">{row.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{row.category}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">{row.barcode}</td>
                      <td className="p-3 text-center font-bold text-sm">
                        <span className={b1Qty === 0 ? 'text-rose-500 font-extrabold' : 'text-slate-700'}>{b1Qty}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-sm">
                        <span className={b2Qty === 0 ? 'text-rose-500 font-extrabold' : 'text-slate-700'}>{b2Qty}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-sm text-emerald-700">
                        {total} qnt
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Inter-Branch transfer form */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between max-h-[480px]">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" /> Stock Transfer Console
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Relocate stock lines dynamically across sister branches to balance out-of-stock items blockades immediately.
          </p>

          <form onSubmit={handleTransferSubmit} className="space-y-3.5 mt-4 text-xs">
            {/* select drug */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Medication compound</label>
              <select
                value={selectedBarcode}
                onChange={(e) => { setSelectedBarcode(e.target.value); setErrorMessage(''); setSuccessMessage(''); }}
                className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded px-2.5 py-1.5 text-slate-705 font-medium"
                required
              >
                <option value="">-- Choose medication --</option>
                {/* De-duplicate list to unique barcodes in dropdown */}
                {medicationComparisonGrid.map(row => (
                  <option key={row.barcode} value={row.barcode}>{row.name}</option>
                ))}
              </select>
            </div>

            {/* From branch selection */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Source branch (From)</label>
                <select
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden rounded px-2 py-1.5 text-slate-600"
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Target branch (To)</label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden rounded px-2 py-1.5 text-slate-600"
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                </select>
              </div>
            </div>

            {/* Quantity transfer */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Stock relocation quantity</label>
              <input 
                type="number"
                min={1}
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded px-3 py-1.5 text-slate-800 font-bold"
                required
              />
            </div>

            {/* Errors block */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-250 text-rose-700 p-2 text-[10.5px] rounded font-semibold leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Success block */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-2.5 text-[10.5px] rounded font-semibold leading-relaxed">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedBarcode}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2.5 px-4 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
              id="confirm_transfer_btn"
            >
              {isSubmitting ? "Routing transit..." : "Confirm Stock Transfer"}
            </button>
          </form>

        </div>

        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center gap-2 mt-4">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-normal">
            <strong>System Sync:</strong> Multi-branch transfers settle inventory tables in real-time, matching transaction logs with secure trace tags automatically.
          </p>
        </div>
      </div>

    </div>
  );
}
