// src/components/ActionBar.tsx

import { useState, Fragment, useEffect } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';
import PastReceiptsModal from './PastReceiptsModal';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { useFormContext } from 'react-hook-form';

export default function ActionBar() {
  const [showPast, setShowPast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const state = useInvoiceStore();
  const { watch, reset } = useFormContext();

  // Watch fields for confirmation modal
  const customerName = (watch('customerName') || '').trim();
  const invoiceNumber = (watch('invoiceNumber') || '').trim();

  // Ensure body scroll is active
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  const handleGenerateClick = () => {
    if (state.items.length === 0) {
      alert('Please add at least one item before generating receipt.');
      return;
    }
    if (customerName === '' || invoiceNumber === '') {
      alert('Please fill in customer name and invoice number.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    const currentUser = useCurrentUserStore.getState().currentUser;

    const receiptData = {
      ...state,
      customerName,
      invoiceNumber,
      phoneNumber: watch('phoneNumber'),
      date: watch('date'),
      paymentMode: watch('paymentMode'),
    };

    // Save to IndexDB via Dexie
    await db.receipts.add({
      data: receiptData,
      timestamp: new Date().toISOString(),
      invoiceNumber,
      customerName,
      total: state.total,
      generatedByStaffId: currentUser?.id,
      generatedByName: currentUser?.name
    });

    localStorage.setItem('currentReceipt', JSON.stringify(receiptData));
    window.open('/receipt-preview', '_blank');
  };

  return (
    <div className="mt-16 mb-24 pt-10 border-t border-gray-100">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Secondary Actions Layer */}
        <div className="flex items-center gap-4 order-2 lg:order-1">
          <button
            type="button"
            onClick={() => setShowPast(true)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors py-2 px-4 border border-transparent hover:border-gray-200 rounded-lg"
          >
            History
          </button>
          
          <button
            type="button"
            onClick={() => {
              state.resetInvoice();
              reset();
            }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-600 transition-colors py-2 px-4"
          >
            Reset Form
          </button>
        </div>

        {/* Primary Action Button - Octavian Power Style */}
        <div className="w-full lg:w-auto order-1 lg:order-2">
          <button
            type="button"
            onClick={handleGenerateClick}
            className="group relative w-full lg:w-80 overflow-hidden bg-black py-5 px-10 rounded-2xl transition-all hover:shadow-[0_20px_40px_rgba(220,38,38,0.3)] active:scale-95"
          >
            {/* Animated Hover Background */}
            <div className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></div>
            
            <div className="relative flex items-center justify-center gap-4">
              <span className="text-white text-xs font-black uppercase tracking-[0.4em]">
                Generate Receipt
              </span>
              <svg 
                className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {showPast && <PastReceiptsModal onClose={() => setShowPast(false)} />}

      {/* Confirmation Modal - Branded */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-2 border-black animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <span className="inline-block p-4 bg-red-50 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-2xl font-black text-black uppercase tracking-tight">Verify Transaction</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</span>
                  <span className="font-bold text-black uppercase">{customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</span>
                  <span className="font-mono font-bold text-black">{invoiceNumber}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement</span>
                  <span className="text-xl font-black text-red-600">₦{state.total.toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmGenerate}
                className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-600 transition-colors shadow-lg"
              >
                Confirm & Issue
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}