// src/components/ActionBar.tsx

import { useState, Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';
import PastReceiptsModal from './PastReceiptsModal';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { useFormContext } from 'react-hook-form';

export default function ActionBar() {
  const [showPast, setShowPast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const state = useInvoiceStore();
  const { watch, reset } = useFormContext();

  // Watch form fields for the confirmation modal and validation
  const customerName = (watch('customerName') || '').trim();
  const invoiceNumber = (watch('invoiceNumber') || '').trim();
  const phoneNumber = watch('phoneNumber');
  const date = watch('date');
  const paymentMode = watch('paymentMode');

  // AUTO-HIDE ERROR PROMPT: Clears message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleGenerateClick = () => {
    // 1. Check if items exist
    if (state.items.length === 0) {
      setErrorMsg("Attention: Please add at least one item to the list.");
      return;
    }
    // 2. Check if header fields are filled
    if (!customerName || !invoiceNumber) {
      setErrorMsg("Required: Customer Name and Invoice Number are missing.");
      return;
    }
    
    setErrorMsg(null);
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    const currentUser = useCurrentUserStore.getState().currentUser;

    /** * DATA CLONE FIX: 
     * We create a clean object with ONLY data. 
     * We do NOT spread 'state' because it contains Zustand functions 
     * which IndexDB cannot save.
     */
    const receiptData = {
      items: state.items,
      subTotal: state.subTotal,
      total: state.total,
      itemQty: state.itemQty,
      amountInWords: state.amountInWords,
      customerName,
      invoiceNumber,
      phoneNumber,
      date,
      paymentMode
    };

    try {
      await db.receipts.add({
        data: receiptData,
        timestamp: new Date().toISOString(),
        invoiceNumber,
        customerName,
        total: state.total,
        generatedByStaffId: currentUser?.id,
        generatedByName: currentUser?.name
      });

      // Store in localStorage for the preview page
      localStorage.setItem('currentReceipt', JSON.stringify(receiptData));
      
      // Open preview in new tab
      window.open('/receipt-preview', '_blank');
    } catch (err) {
      console.error("Failed to save receipt:", err);
      setErrorMsg("Database Error: Could not save the receipt.");
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-100 relative">
      
      {/* BRANDED IN-APP PROMPT */}
      <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-50">
        <Transition
          show={errorMsg !== null}
          as={Fragment}
          enter="transition ease-out duration-500"
          enterFrom="opacity-0 -translate-y-4 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="transition ease-in duration-500"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 -translate-y-4 scale-95"
        >
          <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.25em] px-8 py-3 rounded-full shadow-[0_15px_30px_rgba(220,38,38,0.4)] flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errorMsg}
          </div>
        </Transition>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 order-2 lg:order-1">
          <button 
            type="button" 
            onClick={() => setShowPast(true)} 
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            HISTORY
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              state.resetInvoice();
              reset(); // Resets React Hook Form
              setErrorMsg(null);
            }} 
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
          >
            RESET FORM
          </button>
        </div>

        <button
          type="button"
          onClick={handleGenerateClick}
          className="group relative w-full lg:w-80 bg-black py-5 rounded-2xl overflow-hidden transition-all hover:shadow-[0_20px_40px_rgba(220,38,38,0.3)] active:scale-95"
        >
          <div className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
          <span className="relative text-white text-xs font-black uppercase tracking-[0.4em]">
            Generate Receipt
          </span>
        </button>
      </div>

      {showPast && <PastReceiptsModal onClose={() => setShowPast(false)} />}
      
      {/* CONFIRMATION OVERLAY */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full border-2 border-black shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black uppercase mb-6 text-center tracking-tighter">Confirm Issue</h3>
            
            <div className="space-y-3 mb-8 text-[11px] font-black uppercase tracking-widest">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400">Client:</span>
                <span className="text-black truncate ml-4">{customerName}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-400">Total:</span>
                <span className="text-red-600 text-xl font-black">₦{state.total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={confirmGenerate} 
              className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors mb-3 shadow-lg"
            >
              Confirm & Print
            </button>
            
            <button 
              onClick={() => setShowConfirm(false)} 
              className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}