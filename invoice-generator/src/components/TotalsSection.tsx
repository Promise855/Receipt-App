// src/components/TotalsSection.tsx

import { useInvoiceStore } from '../stores/useInvoiceStore';

export default function TotalsSection() {
  const { itemQty, subTotal, total, amountInWords } = useInvoiceStore();

  return (
    <div className="mt-12 py-8 border-t-2 border-black">
      <div className="flex flex-col md:flex-row justify-between gap-12">
        
        {/* Left: Summary Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Items</p>
              <p className="text-xl font-bold text-black">{itemQty}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sub-Total</p>
              <p className="text-xl font-bold text-black">₦{subTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-2">Amount in Words</p>
            <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-md">
              {amountInWords || 'Zero Naira Only'}
            </p>
          </div>
        </div>

        {/* Right: The Big Total */}
        <div className="md:text-right flex flex-col justify-end">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Grand Total</p>
          <div className="inline-flex items-baseline gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-xl">
            <span className="text-xl font-bold">₦</span>
            <span className="text-5xl font-black tracking-tighter">
              {total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* Security Footer */}
      <div className="mt-10 pt-4 border-t border-gray-50 flex justify-between items-center">
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em]">Octavian Dynamics • Internal Document</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}