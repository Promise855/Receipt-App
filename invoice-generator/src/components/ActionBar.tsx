// src/components/ActionBar.tsx

import { useState } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';
import PastReceiptsModal from './PastReceiptsModal';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { supabase } from '../lib/supabase';
import { useFormContext } from 'react-hook-form';
import { fullSync } from '../lib/sync';

export default function ActionBar() {
  const [showPast, setShowPast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const state = useInvoiceStore();
  const { watch } = useFormContext();

  const customerName = (watch('customerName') || '').trim();
  const invoiceNumber = (watch('invoiceNumber') || '').trim();
  const phoneNumber = (watch('phoneNumber') || '').trim();

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

    if (!currentUser) {
      alert('User not logged in. Please refresh and log in again.');
      return;
    }

    try {
      const receiptData = {
        data: { ...state },
        timestamp: new Date().toISOString(),
        invoiceNumber: invoiceNumber,
        customerName,
        phoneNumber: phoneNumber || null,
        total: state.total,
        subTotal: state.subTotal,
        itemQty: state.itemQty,
        amountInWords: state.amountInWords,
        generatedByStaffId: currentUser.id,
        generatedByName: currentUser.name,
        date: state.date,
        paymentMode: state.paymentMode,
        items: state.items,
      };

      // Save locally
      await db.receipts.add(receiptData);

      // Save to preview (for ReceiptPreview page)
      localStorage.setItem('currentReceipt', JSON.stringify({
        ...state,
        customerName,
        phoneNumber: phoneNumber || '',
        invoiceNumber,
      }));

      // Trigger cloud sync in background
      fullSync().catch(console.error);

      // Navigate to preview
      window.location.href = '/receipt-preview';
    } catch (err) {
      console.error('Failed to generate receipt:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <button
            onClick={() => setShowPast(true)}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            View Past Receipts
          </button>

          <button
            onClick={handleGenerateClick}
            className="px-8 py-3 bg-[#022142] text-white rounded-lg hover:bg-[#053f7c] transition font-bold text-lg shadow-md"
          >
            Generate Receipt
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="glass-backdrop">
          <div className="glass-modal max-w-md text-center">
            <div className="text-6xl mb-4">Receipt</div>
            <h3 className="text-xl font-bold text-[#022142] mb-4">
              Confirm Generate Receipt
            </h3>
            <p className="text-gray-700 mb-6">
              Invoice: <strong>{invoiceNumber}</strong><br />
              Customer: <strong>{customerName}</strong><br />
              Total: <strong>₦{(state.total || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmGenerate}
                className="px-6 py-3 bg-[#022142] text-white rounded-lg hover:bg-[#053f7c] transition font-medium shadow-md"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {showPast && <PastReceiptsModal onClose={() => setShowPast(false)} />}
    </>
  );
}