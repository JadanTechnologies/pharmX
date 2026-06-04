import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Trash2, Printer, 
  CreditCard, HandCoins, Landmark, Ticket, X, CheckCircle, Flame
} from 'lucide-react';
import { Drug, SaleItem, Sale, Prescription } from '../types';

interface POSProps {
  drugs: Drug[];
  prescriptions: Prescription[];
  onCheckout: (saleData: any) => Promise<Sale>;
  currentUser: any;
  userBranch: string;
}

export default function POS({ drugs, prescriptions, onCheckout, currentUser, userBranch }: POSProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ drug: Drug; qty: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('');
  
  // Completed checkout reference for printable invoice overlay
  const [completedInvoice, setCompletedInvoice] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on initial mount or keyboard shortcut (F2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Catalog for Checkout: Only active branch and items in stock (or searchable)
  const filteredDrugs = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    
    return drugs.filter(d => 
      d.branchId === userBranch && (
        d.name.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query) ||
        d.barcode.includes(query)
      )
    );
  }, [searchQuery, drugs, userBranch]);

  // Handle direct barcode scanner enter key simulations
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Look for exact barcode match
    const matched = drugs.find(d => d.barcode === searchQuery && d.branchId === userBranch);
    if (matched) {
      addToCart(matched);
      setSearchQuery('');
    }
  };

  const addToCart = (drug: Drug) => {
    if (drug.quantity <= 0) {
      setErrorMessage(`Cannot add ${drug.name} (Out of Stock)`);
      return;
    }

    setCart(prev => {
      const idx = prev.findIndex(item => item.drug.id === drug.id);
      if (idx !== -1) {
        const currentQty = prev[idx].qty;
        if (currentQty >= drug.quantity) {
          setErrorMessage(`Cannot add more. Maximum available stock reached (${drug.quantity} qnt)`);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: currentQty + 1 };
        return updated;
      }
      return [...prev, { drug, qty: 1 }];
    });
    setErrorMessage('');
  };

  const updateCartQty = (drugId: string, quantity: number) => {
    const d = drugs.find(item => item.id === drugId)!;
    
    if (quantity > d.quantity) {
      setErrorMessage(`Insufficient inventory stock! Central Branch only has ${d.quantity} units for ${d.name}`);
      return;
    }

    if (quantity <= 0) {
      removeFromCart(drugId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.drug.id === drugId ? { ...item, qty: quantity } : item
    ));
    setErrorMessage('');
  };

  const removeFromCart = (drugId: string) => {
    setCart(prev => prev.filter(item => item.drug.id !== drugId));
  };

  // Associate Prescription: Prefills customer and inserts prescribed drugs!
  const handlePrescriptionSelect = (rxId: string) => {
    setSelectedPrescriptionId(rxId);
    if (!rxId) return;

    const rx = prescriptions.find(p => p.id === rxId);
    if (rx) {
      setCustomerName(rx.patientName);
      
      // Auto-add matching prescription drugs to cart if catalogued
      setCart([]);
      rx.drugs.forEach(rxDrug => {
        // Find drug in database
        const match = drugs.find(d => 
          d.branchId === userBranch && 
          d.name.toLowerCase().includes(rxDrug.name.toLowerCase().split(' ')[0])
        );
        if (match) {
          addToCart(match);
        }
      });
    }
  };

  // Financial Calculations
  const calculations = useMemo(() => {
    const subtotal = cart.reduce((acc, curr) => acc + (curr.drug.sellingPrice * curr.qty), 0);
    const taxRate = 0.05; // 5% Medical Sales Tax
    const tax = subtotal * taxRate;
    
    let discount = 0;
    if (discountType === 'percent') {
      discount = subtotal * (discountVal / 100);
    } else {
      discount = Math.min(discountVal, subtotal);
    }

    const total = Math.max(0, subtotal + tax - discount);

    return {
      subtotal,
      tax,
      discount,
      total
    };
  }, [cart, discountType, discountVal]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      setErrorMessage("No items in cart for checkout operations");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formattedItems = cart.map(item => ({
      drugId: item.drug.id,
      name: item.drug.name,
      quantity: item.qty,
      price: item.drug.sellingPrice,
      batchNumber: item.drug.batchNumber || 'N/A'
    }));

    const salePayload = {
      customerName,
      customerPhone,
      items: formattedItems,
      subtotal: calculations.subtotal,
      tax: calculations.tax,
      discount: calculations.discount,
      total: calculations.total,
      paymentMethod,
      prescriptionId: selectedPrescriptionId || undefined
    };

    try {
      const result = await onCheckout(salePayload);
      setCompletedInvoice(result);
      
      // Reset POS terminal elements
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedPrescriptionId('');
      setDiscountVal(0);
    } catch (e: any) {
      setErrorMessage(e.message || "Checkout failed. Please inspect database integrity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pos_grid">
      {/* Catalog Search & Fast-click additions */}
      <div className="lg:col-span-7 space-y-4">
        {/* Barcode Search Form */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-3 shadow-xs">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Search medications by compound, manufacturer, or scan Barcode (F2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 transition"
              id="pos_search_input"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 px-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Scanner Badge Indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Scanner Feed Ready
          </div>
        </div>

        {/* Suggestion list */}
        {searchQuery ? (
          <div className="bg-white border border-slate-100 rounded-xl max-h-96 overflow-y-auto divide-y divide-slate-100 shadow-md">
            {filteredDrugs.map(drug => (
              <div 
                key={drug.id} 
                onClick={() => {
                  addToCart(drug);
                  setSearchQuery('');
                }}
                className="p-3 hover:bg-emerald-50/50 transition duration-150 flex justify-between items-center cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 group-hover:text-emerald-700 transition text-sm">{drug.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-semibold">
                      {drug.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Batch: {drug.batchNumber} | Exp: {drug.expiryDate} | Barcode: {drug.barcode}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700">${drug.sellingPrice.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {drug.quantity > 0 ? `${drug.quantity} units left` : 'Out of Stock'}
                  </p>
                </div>
              </div>
            ))}
            {filteredDrugs.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching medications found in active retail branch stock.
              </div>
            )}
          </div>
        ) : null}

        {/* Prescription Linker */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-teal-100 text-teal-800 p-1 rounded-md">
                <Ticket className="w-4 h-4" />
              </span>
              <strong className="text-xs text-teal-900 font-bold uppercase tracking-wider">Dispense prescription link</strong>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Select verified customer prescriptions from list with automatic drug inventory items parsing.
            </p>
          </div>
          <select 
            onChange={(e) => handlePrescriptionSelect(e.target.value)}
            value={selectedPrescriptionId}
            className="bg-white border border-teal-200 text-slate-700 text-xs rounded-lg outline-hidden focus:border-teal-400 px-3 py-2 shrink-0 md:max-w-xs"
            id="pos_prescription_select"
          >
            <option value="">-- No linked prescription --</option>
            {prescriptions.map(rx => (
              <option key={rx.id} value={rx.id}>
                {rx.prescriptionNumber} - {rx.patientName} (Dr. {rx.doctorName})
              </option>
            ))}
          </select>
        </div>

        {/* Catalog Grid Pre-set fast sellers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> Fast-Moving Chemicals (Central Shop)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {drugs.filter(d => d.branchId === userBranch).slice(0, 6).map(drug => (
              <button
                key={drug.id}
                onClick={() => addToCart(drug)}
                disabled={drug.quantity === 0}
                className="bg-white border border-slate-100 p-3 rounded-xl hover:shadow-md transition text-left cursor-pointer group hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between h-24"
                id={`pos_fast_${drug.id}`}
              >
                <div>
                  <div className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase">{drug.category}</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-1 group-hover:text-emerald-700 transition">{drug.name}</div>
                </div>
                <div className="flex justify-between items-end mt-1 w-full">
                  <span className="text-xs font-extrabold text-slate-700">${drug.sellingPrice.toFixed(2)}</span>
                  <span className={`text-[9px] font-semibold px-1 rounded ${
                    drug.quantity === 0 ? 'bg-rose-100 text-rose-700' :
                    drug.quantity < drug.lowStockThreshold ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {drug.quantity === 0 ? 'Out' : `${drug.quantity} left`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* POS Cart Sidebar Operations */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between overflow-hidden min-h-[550px]" id="pos_cart_panel">
        
        {/* Cart Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="font-bold text-slate-700 text-sm">Cashier Invoice Cart</h3>
          </div>
          <span className="bg-emerald-150 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
            {cart.reduce((acc, curr) => acc + curr.qty, 0)} items
          </span>
        </div>

        {/* Cart list scroll area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[300px]">
          {cart.map(item => (
            <div key={item.drug.id} className="flex justify-between items-start gap-2 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-700 block truncate">{item.drug.name}</span>
                <span className="text-[10px] text-slate-400">Batch: {item.drug.batchNumber} | Exp: {item.drug.expiryDate}</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button 
                    onClick={() => updateCartQty(item.drug.id, item.qty - 1)}
                    className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold transition flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateCartQty(item.drug.id, Number(e.target.value))}
                    className="w-10 text-center bg-slate-50 border border-slate-200 outline-hidden rounded py-0.5 text-slate-700 font-semibold"
                  />
                  <button 
                    onClick={() => updateCartQty(item.drug.id, item.qty + 1)}
                    className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold transition flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right pl-2">
                <span className="font-semibold text-slate-700 block">${(item.drug.sellingPrice * item.qty).toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block">${item.drug.sellingPrice.toFixed(2)} ea</span>
                <button 
                  onClick={() => removeFromCart(item.drug.id)}
                  className="text-rose-400 hover:text-rose-600 transition p-1 mt-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
              <ShoppingCart className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <span>Cart is empty. Tap compounds on left to add.</span>
            </div>
          )}
        </div>

        {/* Customer fields & discounts */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Customer Customer</label>
              <input 
                type="text" 
                placeholder="Walk-in Patient"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-200 outline-hidden focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-705"
                id="pos_customer_name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Customer Phone</label>
              <input 
                type="text" 
                placeholder="Contact Details"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 outline-hidden focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-705"
                id="pos_customer_phone"
              />
            </div>
          </div>

          {/* Discounts */}
          <div className="flex gap-2 items-center justify-between">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Discounts / Promo</label>
            <div className="flex items-center gap-1">
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="bg-white border border-slate-200 rounded px-1 text-xs text-slate-600 h-6 outline-hidden"
              >
                <option value="percent">% Off</option>
                <option value="flat">Flat $</option>
              </select>
              <input 
                type="number"
                value={discountVal}
                min={0}
                onChange={(e) => setDiscountVal(Number(e.target.value || 0))}
                className="w-16 bg-white border border-slate-200 rounded px-1.5 text-xs text-slate-700 h-6 outline-hidden"
                id="pos_discount_input"
              />
            </div>
          </div>

          {/* Payment selector */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment Method Selection</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                  paymentMethod === 'cash' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="pay_cash"
              >
                <HandCoins className="w-3.5 h-3.5" /> Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                  paymentMethod === 'card' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="pay_card"
              >
                <CreditCard className="w-3.5 h-3.5" /> Card
              </button>
              <button 
                onClick={() => setPaymentMethod('transfer')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                  paymentMethod === 'transfer' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="pay_transfer"
              >
                <Landmark className="w-3.5 h-3.5" /> Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Summary and Submit */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 space-y-3">
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">${calculations.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Medical Sales Tax (5.0%)</span>
              <span className="font-semibold text-slate-700">${calculations.tax.toFixed(2)}</span>
            </div>
            {calculations.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Total Discount Applied</span>
                <span>-${calculations.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-800 font-bold border-t border-slate-200/50 pt-2">
              <span>Final Total</span>
              <span className="text-emerald-700 text-base">${calculations.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Fault Indicator */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-[10.5px] font-semibold leading-relaxed">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-xs hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            id="pos_checkout_submit"
          >
            {isSubmitting ? "Locking Invoice..." : "Submit Checkout & Print Invoice"}
          </button>
        </div>

      </div>

      {/* Invoice Receipt Modal Overlay */}
      {completedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <span className="inline-flex justify-center items-center bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3">
                <CheckCircle className="w-8 h-8" />
              </span>
              <h4 className="text-sm font-bold text-slate-800">Checkout Completed Successfully</h4>
              <p className="text-[11px] text-slate-400 mt-1">Invoice {completedInvoice.invoiceNumber} logged safely to ledger.</p>
            </div>

            {/* Thermal Receipt Simulator */}
            <div className="border border-dashed border-slate-200 p-4 font-mono text-[10px] text-slate-600 space-y-2 bg-yellow-50/20 rounded-md">
              <div className="text-center font-bold text-slate-800 uppercase">
                *** PHARMACARE CENTRAL RETAIL ***
              </div>
              <div className="text-center">
                102 Medical Drive, Suite A<br />
                Central Plaza, Code: CPB-01
              </div>
              <div className="border-b border-dashed border-slate-200 my-2"></div>
              <div>
                Date: {new Date(completedInvoice.date).toLocaleString()}<br />
                Cashier: {completedInvoice.cashierName}<br />
                Patient: {completedInvoice.customerName}
              </div>
              <div className="border-b border-dashed border-slate-200 my-2"></div>
              
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dashed border-slate-250 font-bold">
                    <th className="text-left py-1">Item med</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {completedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 truncate max-w-[120px]">{item.name}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-200 my-2"></div>
              
              <div className="space-y-1 text-right">
                <div>Subtotal: ${completedInvoice.subtotal.toFixed(2)}</div>
                <div>Medical Tax (5%): ${completedInvoice.tax.toFixed(2)}</div>
                {completedInvoice.discount > 0 && <div>Discount: -${completedInvoice.discount.toFixed(2)}</div>}
                <div className="font-bold text-slate-800 text-xs mt-1">TOTAL CHARGE: ${completedInvoice.total.toFixed(2)}</div>
              </div>

              <div className="border-b border-dashed border-slate-200 my-2"></div>
              
              <div className="text-center capitalize font-bold">
                Payment Status: PAID ({completedInvoice.paymentMethod})
              </div>
              <div className="text-center text-[8px] text-slate-400 mt-2 font-sans italic text-wrap leading-tight">
                Disclaimer: Keep medication in a cool, dry place. Generic substitution is permitted unless clinical exemption was registered on Rx sheet.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Thermal Print
              </button>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                id="pos_receipt_close"
              >
                Done Checkout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
