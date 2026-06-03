import React, { useState, useMemo } from 'react';
import { 
  Building, User, Phone, Mail, MapPin, Plus, 
  Search, ClipboardList, CheckSquare, Clock, PackageCheck, AlertTriangle,
  Sparkles, Filter, Ban, CheckCircle, Trash2, ArrowRightLeft, Info, HelpCircle
} from 'lucide-react';
import { Supplier, PurchaseOrder, Drug } from '../types';

interface SuppliersOrdersProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  drugs: Drug[];
  onAddSupplier: (supplierData: any) => Promise<Supplier>;
  onAddPurchaseOrder: (poData: any) => Promise<PurchaseOrder>;
  onReceivePO: (poId: string) => Promise<boolean>;
  onUpdatePOStatus?: (poId: string, status: 'draft' | 'pending' | 'received' | 'cancelled') => Promise<boolean>;
}

export default function SuppliersOrders({ 
  suppliers, 
  purchaseOrders, 
  drugs, 
  onAddSupplier, 
  onAddPurchaseOrder, 
  onReceivePO,
  onUpdatePOStatus
}: SuppliersOrdersProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'suppliers'>('orders');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'pending' | 'received' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supplier Form
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supError, setSupError] = useState('');

  // Purchase Order Form
  const [isAddPOOpen, setIsAddPOOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<{ drugId: string; quantity: number }[]>([]);
  const [poError, setPoError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiveConfirmPoId, setReceiveConfirmPoId] = useState<string | null>(null);

  // Auto-fill price details on PO compile
  const computedTotalCost = useMemo(() => {
    return orderItems.reduce((acc, curr) => {
      const match = drugs.find(d => d.id === curr.drugId);
      const cost = match ? match.costPrice : 0;
      return acc + (cost * curr.quantity);
    }, 0);
  }, [orderItems, drugs]);

  const handleAddItemLine = () => {
    if (drugs.length === 0) return;
    setOrderItems(prev => [...prev, { drugId: drugs[0].id, quantity: 100 }]);
  };

  const handleUpdateItemLine = (idx: number, field: 'drugId' | 'quantity', val: any) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleRemoveItemLine = (idx: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  const submitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupError('');
    if (!supName || !supContact) {
      setSupError('Company and primary contact names are mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: supName,
        contactPerson: supContact,
        phone: supPhone,
        email: supEmail,
        address: supAddress
      };
      await onAddSupplier(payload);
      setIsAddSupplierOpen(false);
      setSupName('');
      setSupContact('');
      setSupPhone('');
      setSupEmail('');
      setSupAddress('');
    } catch (e: any) {
      setSupError(e.message || "Failed to add supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoError('');
    if (!selectedSupplierId) {
      setPoError('Please select a supplier.');
      return;
    }
    if (orderItems.length === 0) {
      setPoError('Add at least one drug item to order.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find supplier name to avoid missing metadata
      const matchedSup = suppliers.find(s => s.id === selectedSupplierId);
      const payload = {
        supplierId: selectedSupplierId,
        supplierName: matchedSup?.name || 'Pharma Supplier',
        items: orderItems.map(item => {
          const match = drugs.find(d => d.id === item.drugId);
          return {
            drugId: item.drugId,
            name: match ? match.name : 'Unknown Drug',
            quantity: item.quantity,
            costPrice: match ? match.costPrice : 0
          };
        }),
        totalCost: computedTotalCost
      };
      await onAddPurchaseOrder(payload);
      setIsAddPOOpen(false);
      setSelectedSupplierId('');
      setOrderItems([]);
    } catch (e: any) {
      setPoError(e.message || "Failed to register purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper counters
  const counts = useMemo(() => {
    return {
      all: purchaseOrders.length,
      draft: purchaseOrders.filter(po => po.status === 'draft').length,
      pending: purchaseOrders.filter(po => po.status === 'pending').length,
      received: purchaseOrders.filter(po => po.status === 'received').length,
      cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length,
    };
  }, [purchaseOrders]);

  // Filtered and searched PO list
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [purchaseOrders, filterStatus, searchQuery]);

  return (
    <div className="space-y-6" id="suppliers_orders_root_updated">
      
      {/* Sub menu tabs styled like highly precise Clinical ERP Navigation */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-2.5 font-bold text-xs tracking-wider uppercase border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeSubTab === 'orders' 
              ? 'border-emerald-600 text-emerald-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="po_tab_trigger"
        >
          <ClipboardList className="w-4 h-4" />
          Wholesale Procurement Orders
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`pb-2.5 font-bold text-xs tracking-wider uppercase border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeSubTab === 'suppliers' 
              ? 'border-emerald-600 text-emerald-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="vendor_tab_trigger"
        >
          <Building className="w-4 h-4" />
          Registered Distributors & Suppliers
        </button>
      </div>

      {activeSubTab === 'orders' ? (
        <div className="space-y-5 animate-fade-in" id="orders_panel">
          
          {/* Helpful ERP compliant stock advisory banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/65 rounded-xl p-4.5 flex gap-3 text-slate-700 shadow-sm" id="erp_stock_compliance_banner">
            <Sparkles className="w-5.5 h-5.5 shrink-0 text-emerald-600 mt-0.5 animate-pulse" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-emerald-900 uppercase tracking-wide block">Automated Stock Replenishment Protocols Active</span>
              <p className="text-slate-650 leading-relaxed font-medium">
                Our dynamic <span className="font-bold text-emerald-950">Safety Stock Compliance</span> system monitors active branch inventory counts. Whenever retail stock falls at or below your predefined safety levels, the system automatically drafts a wholesale Purchase Order match and groups it by distributor.
              </p>
              <div className="flex gap-1.5 mt-2 text-[10.5px] font-mono text-emerald-800 font-bold">
                <span>⚡ Reorder trigger level: Category Threshold</span>
                <span className="text-emerald-300">|</span>
                <span>📋 Action required: Approve drafts in queue below to transmit order to distributors.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4.5 border border-slate-150 rounded-xl shadow-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-emerald-700" />
                Procurement Operations Queue
              </h3>
              <p className="text-[11px] text-slate-400">Track raw bulk supplies, authorize system drafts, and match product deliveries.</p>
            </div>
            <button
              onClick={() => { setIsAddPOOpen(true); handleAddItemLine(); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs shrink-0 self-start sm:self-center"
              id="po_create_btn"
            >
              <Plus className="w-4 h-4" /> Issue Manual Purchase Order
            </button>
          </div>

          {/* ERP Filtering & Search Toolbar */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1 px-1.5 mr-1">
                <Filter className="w-3 h-3" /> Filter Queue:
              </span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition text-slate-700 cursor-pointer ${
                  filterStatus === 'all' 
                    ? 'bg-slate-800 text-white shadow-xs' 
                    : 'bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Orders <span className="ml-0.5 opacity-75 font-mono text-[10px]">({counts.all})</span>
              </button>
              
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'draft' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white border border-slate-200 hover:bg-blue-50/50 text-blue-700'
                }`}
              >
                <Sparkles className="w-3 h-3 text-current shrink-0" />
                Drafts <span className="ml-0.5 opacity-75 font-mono text-[10px]">({counts.draft})</span>
              </button>

              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'pending' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-white border border-slate-200 hover:bg-amber-50/50 text-amber-700'
                }`}
              >
                <Clock className="w-3 h-3 text-current shrink-0" />
                In Transit <span className="ml-0.5 opacity-75 font-mono text-[10px]">({counts.pending})</span>
              </button>

              <button
                onClick={() => setFilterStatus('received')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'received' 
                    ? 'bg-emerald-700 text-white shadow-xs' 
                    : 'bg-white border border-slate-200 hover:bg-emerald-50/50 text-emerald-800'
                }`}
              >
                <PackageCheck className="w-3 h-3 text-current shrink-0" />
                Delivered <span className="ml-0.5 opacity-75 font-mono text-[10px]">({counts.received})</span>
              </button>

              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'cancelled' 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'bg-white border border-slate-200 hover:bg-rose-55/40 text-rose-700'
                }`}
              >
                <Ban className="w-3 h-3 text-current shrink-0" />
                Cancelled <span className="ml-0.5 opacity-75 font-mono text-[10px]">({counts.cancelled})</span>
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative flex-1 max-w-xs self-end md:self-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendor, drug, order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-emerald-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Grid list of PO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPOs.map(po => {
              const isDraft = po.status === 'draft';
              const isPending = po.status === 'pending';
              const isReceived = po.status === 'received';
              const isCancelled = po.status === 'cancelled';

              return (
                <div 
                  key={po.id} 
                  className={`border rounded-xl p-5 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between ${
                    isDraft ? 'bg-gradient-to-br from-blue-50/30 to-slate-50/10 border-blue-200 ring-2 ring-blue-50/25' : 
                    isCancelled ? 'bg-slate-50/80 border-slate-200 opacity-65' : 'bg-white border-slate-150'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        {isDraft ? (
                          <span className="bg-blue-100 text-blue-800 font-mono text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-1 shadow-2xs border border-blue-200">
                            <Sparkles className="w-2.5 h-2.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
                            Auto-Draft Setup
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{po.orderNumber}</span>
                        )}
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{po.supplierName}</h4>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <span>Order Date: {po.orderDate}</span>
                          <span>&bull;</span>
                          <span>ID: {po.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      {/* Explicit High-Contrast Badging for Clinical ERP */}
                      <span className={`text-[9.5px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1 border ${
                        isReceived ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        isPending ? 'bg-amber-55/70 text-amber-900 border-amber-200' : 
                        isDraft ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-100 text-slate-600 border-slate-250'
                      }`}>
                        {isReceived && <PackageCheck className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        {isDraft && <Info className="w-3.5 h-3.5" />}
                        {po.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-3">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Ordered medications catalogue</span>
                      <div className="space-y-2">
                        {po.items.map((item, idx) => {
                          const matchedDrug = drugs.find(d => d.id === item.drugId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-xs text-slate-705 font-medium hover:bg-slate-50/40 p-1 rounded transition">
                              <span className="flex items-center gap-1.5 text-slate-720 font-bold font-sans">
                                <span className="text-emerald-600 font-mono mr-0.5">↳</span> {item.name}
                                {matchedDrug && (
                                  <span className="text-[9px] font-normal text-slate-400 font-mono">
                                    [Shelf stock: {matchedDrug.quantity}]
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-slate-700 font-semibold">{item.quantity} units @ ${item.costPrice.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Pathways */}
                  <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Estimated wholesale cost</span>
                      <span className="text-sm font-extrabold text-slate-800 font-mono">${po.totalCost.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-1.5">
                      {isDraft && onUpdatePOStatus && (
                        <>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to discard this automated replenishment draft order?")) {
                                await onUpdatePOStatus(po.id, 'cancelled');
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1"
                            title="Discard Draft PO"
                            id={`po_discard_${po.id}`}
                          >
                            <Ban className="w-3.5 h-3.5" /> Discard
                          </button>
                          
                          <button
                            onClick={async () => {
                              await onUpdatePOStatus(po.id, 'pending');
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition shadow-xs active:scale-95 cursor-pointer flex items-center gap-1 border border-teal-750"
                            id={`po_transmit_${po.id}`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" /> Transmit PO
                          </button>
                        </>
                      )}

                      {isPending && (
                        <button
                          onClick={() => setReceiveConfirmPoId(po.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250 font-bold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
                          id={`po_receive_${po.id}`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Items Received
                        </button>
                      )}

                      {/* Cancel pending option */}
                      {isPending && onUpdatePOStatus && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Cancel this running purchase order? Inventory counts won't be credited.")) {
                              await onUpdatePOStatus(po.id, 'cancelled');
                            }
                          }}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 px-2 py-1.5 rounded-lg transition"
                          title="Flag Order Cancelled"
                        >
                          Cancel PO
                        </button>
                      )}

                      {isReceived && (
                        <span className="text-emerald-800 bg-emerald-50/40 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Settled & Intaken
                        </span>
                      )}

                      {isCancelled && (
                        <span className="text-slate-400 bg-slate-100 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPOs.length === 0 && (
              <div className="md:col-span-2 bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700">No Procurement Matches Found</h4>
                <p className="text-xs text-slate-400 mt-1">Adjust your filter status pill or search terms to display catalogued listings.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in" id="suppliers_panel">
          
          {/* Supplier listing list */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-150 p-5 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
              <Building className="w-5 h-5 text-emerald-700" /> Registered Distributors Directory catalog
            </h3>
            
            <p className="text-[11px] text-slate-400">
              Approved partners authorized for pharmaceutical supplies. Displaying running outstanding debts/balances.
            </p>

            <div className="divide-y divide-slate-100" id="supplier_datatable">
              {suppliers.map(sup => (
                <div key={sup.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-55/20 transition px-1 rounded-lg">
                  <div className="space-y-1 bg-transparent">
                    <h4 className="font-extrabold text-slate-950 text-sm">{sup.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold font-sans">
                      <span className="flex items-center gap-1 text-slate-600"><User className="w-3.5 h-3.5 text-emerald-600" /> Rep: {sup.contactPerson}</span>
                      <span className="flex items-center gap-1 text-slate-605"><Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}</span>
                      <span className="flex items-center gap-1 text-slate-605"><Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address: {sup.address}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-slate-50 p-2 border border-slate-100 rounded-lg">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">Outstanding Payable Balance</span>
                    <span className={`text-xs font-extrabold font-mono ${sup.balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                      ${sup.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {suppliers.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic text-xs">
                  No partners listed. Create a supplier record on the right sidebar.
                </div>
              )}
            </div>
          </div>

          {/* Supplier Onboard Form Card */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4 self-start">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Plus className="w-4.5 h-4.5 text-emerald-600" /> Register New Wholesale Supplier
            </h3>
            
            {supError && (
              <div className="bg-rose-50 border border-rose-250 text-rose-700 p-3 rounded-lg text-xs font-bold leading-relaxed">
                {supError}
              </div>
            )}

            <form onSubmit={submitSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Company Legal Title *</label>
                <input 
                  type="text" 
                  value={supName} 
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Novartis Pharma" 
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 focus:bg-white rounded-lg px-3 py-2.5 text-slate-800 font-bold transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Primary Rep Rep Name Location *</label>
                <input 
                  type="text" 
                  value={supContact} 
                  onChange={(e) => setSupContact(e.target.value)}
                  placeholder="e.g. John Doe, Logistics Director" 
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 focus:bg-white rounded-lg px-3 py-2.5 text-slate-800 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Active Contact Telephone Number *</label>
                <input 
                  type="text" 
                  value={supPhone} 
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 901-4433" 
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 focus:bg-white rounded-lg px-3 py-2.5 text-slate-800 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Corporate Mail Address</label>
                <input 
                  type="email" 
                  value={supEmail} 
                  onChange={(e) => setSupEmail(e.target.value)}
                  placeholder="e.g. sales@novartis.com" 
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 focus:bg-white rounded-lg px-3 py-2.5 text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Physical Warehouse / Billing Address</label>
                <textarea 
                  rows={2}
                  value={supAddress} 
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="e.g. Factory Gate block 12" 
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 focus:bg-white rounded-lg px-3 py-2 text-slate-800 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white font-extrabold py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition cursor-pointer shadow-xs font-sans tracking-wide active:scale-95"
                id="vendor_submit_direct"
              >
                {isSubmitting ? "Issuing profile..." : "Save Distributor Record"}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* PO Issuance manual Modal */}
      {isAddPOOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={submitPurchaseOrder} className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-150">
              <h4 className="font-bold text-slate-800 text-sm">Create Manual Purchase Order Form</h4>
              <button type="button" onClick={() => setIsAddPOOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {poError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs font-bold leading-normal">
                {poError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Select Supplier */}
              <div>
                <label className="block text-slate-500 font-bold mb-1">Target Wholesaler & Distributor</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg p-2.5 text-slate-705 font-bold cursor-pointer transition"
                  required
                >
                  <option value="">-- Choose registered supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} - contact rep {s.contactPerson}</option>)}
                </select>
              </div>

              {/* Dynamic order lines */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="block text-slate-500 font-bold">Medication Item Lines</span>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="text-emerald-700 font-bold hover:underline py-1 px-1 flex items-center gap-0.5 cursor-pointer"
                  >
                    + Add drug line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {orderItems.map((line, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {/* Drug Selector */}
                      <select
                        value={line.drugId}
                        onChange={(e) => handleUpdateItemLine(idx, 'drugId', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded p-1.5 outline-hidden font-semibold cursor-pointer"
                      >
                        {drugs.map(d => <option key={d.id} value={d.id}>{d.name} (wholesale cost: ${d.costPrice.toFixed(2)})</option>)}
                      </select>

                      {/* Quantity input */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Qty:</span>
                        <input 
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => handleUpdateItemLine(idx, 'quantity', Number(e.target.value || 0))}
                          className="w-16 bg-white border border-slate-250 rounded p-1 text-center font-bold font-mono outline-hidden"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemLine(idx)}
                        className="text-rose-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {orderItems.length === 0 && (
                    <p className="p-4 text-center text-slate-400 italic font-medium">Add drug item lines to proceed.</p>
                  )}
                </div>
              </div>

              {/* Summary Valuation */}
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs text-slate-600 border border-slate-150 font-sans">
                <span className="font-bold">Estimated Grand Wholesale Total Charge</span>
                <span className="font-extrabold text-sm text-slate-800 font-mono">${computedTotalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 justify-end border-t border-slate-150">
              <button 
                type="button" 
                onClick={() => setIsAddPOOpen(false)} 
                className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-black py-2.5 px-4 rounded-lg text-xs cursor-pointer transition active:scale-95"
              >
                Draft Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || orderItems.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                id="po_form_submit"
              >
                {isSubmitting ? "Submitting order..." : "Transmit Purchase Order"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modern, glassmorphic interactive PO Receipt Confirmation Overlay */}
      {receiveConfirmPoId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="po_confirm_overlay">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase font-mono tracking-wider">Acknowledge Inventory Intake</h3>
                <p className="text-xs text-slate-405 leading-relaxed font-medium">
                  Confirming delivery of these medication batches will automatically credit items into your retail branch compound counts. Are you ready to verify intake labels?
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReceiveConfirmPoId(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-150 transition rounded-lg cursor-pointer"
                id="cancel_receive_btn"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await onReceivePO(receiveConfirmPoId);
                  } catch (err) {
                    // Fail silently
                  } finally {
                    setReceiveConfirmPoId(null);
                  }
                }}
                className="px-3.5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition rounded-lg cursor-pointer shadow-xs"
                id="confirm_receive_btn"
              >
                Confirm Intake
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
