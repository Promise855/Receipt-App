// src/components/ActionBar.tsx

import { useState } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';
import PastReceiptsModal from './PastReceiptsModal';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { supabase } from '../lib/supabase';

export default function ActionBar() {
  const [showPast, setShowPast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const state = useInvoiceStore();

  const handleGenerateClick = () => {
    // Check for items
    if (state.items.length === 0) {
      alert('Please add at least one item before generating receipt.');
      return;
    }

    // Safe trim check
    const customerName = (state.customerName || '').trim();
    const invoiceNumber = (state.invoiceNumber || '').trim();

    if (customerName === '' || invoiceNumber === '') {
      alert('Please fill in customer name and invoice number.');
      return;
    }

    console.log('Validation passed — showing confirmation modal');
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    const currentUser = useCurrentUserStore.getState().currentUser;

    if (!currentUser) {
      alert('No User Logged In');
      return;
    }

    try {
      const plainData = {
        customerName: (state.customerName || '').trim(),
        phoneNumber: (state.phoneNumber || '').trim(),
        invoiceNumber: (state.invoiceNumber || '').trim(),
        date: state.date || new Date().toISOString().split('T')[0],
        paymentMode: state.paymentMode || 'Cash',
        items: state.items.map(item => ({
          id: item.id,
          sn: item.sn,
          name: item.name,
          description: item.description,
          details: { ...item.details },
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          amount: item.amount || 0,
        })),
        itemQty: state.itemQty || 0,
        subTotal: state.subTotal || 0,
        total: state.total || 0,
        amountInWords: state.amountInWords || '',
        generatedByStaffId: currentUser.id,
        generatedByName: currentUser.name,
      };

      console.log('Saving receipt locally...');

      // Save locally to Dexie
      const savedId = await db.receipts.add({
        data: plainData,
        timestamp: new Date().toISOString(),
        invoiceNumber: plainData.invoiceNumber,
        customerName: plainData.customerName,
        total: plainData.total,
        generatedByStaffId: currentUser.id,
        generatedByName: currentUser.name,
      });

      console.log('Receipt saved locally with ID:', savedId);

      // Sync to Supabase
      const { error } = await supabase.from('receipts').insert({
        invoice_number: plainData.invoiceNumber,
        customer_name: plainData.customerName,
        phone_number: plainData.phoneNumber,
        date: plainData.date,
        payment_mode: plainData.paymentMode,
        total: plainData.total,
        sub_total: plainData.subTotal,
        item_qty: plainData.itemQty,
        amount_in_words: plainData.amountInWords,
        items: plainData.items,
        generated_by_staff_id: plainData.generatedByStaffId,
        generated_by_name: plainData.generatedByName,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase sync error:', error);
      } else {
        console.log('Receipt synced to cloud successfully!');
      }

      // Save for preview
      localStorage.setItem('currentReceipt', JSON.stringify(plainData));

      // Open preview window (avoid popup blocker)
      setTimeout(() => {
        const previewWindow = window.open('/receipt-preview', '_blank');
        if (!previewWindow) {
          alert('Popup blocked! Please allow popups for this site to view the receipt.');
        } else {
          console.log('Receipt preview opened');
        }
      }, 100);

    } catch (error) {
      console.error('Receipt generation failed:', error);
      alert('Failed to generate receipt. See console for details.');
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
          <button
            onClick={handleGenerateClick}
            className="w-full sm:w-auto flex-1 px-8 py-5 bg-[#022142] text-white text-lg sm:text-xl font-bold rounded-xl hover:bg-[#053f7c] transition shadow-xl"
          >
            Generate Receipt
          </button>

          <button
            onClick={() => setShowPast(true)}
            className="w-full sm:w-auto flex-1 px-8 py-5 bg-gray-700 text-white text-lg sm:text-xl font-bold rounded-xl hover:bg-gray-800 transition shadow-xl"
          >
            View Receipts
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="glass-backdrop">
          <div className="glass-modal max-w-md text-center">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-xl font-bold text-[#022142] mb-4">
              Confirm Generate Receipt
            </h3>
            <p className="text-gray-700 mb-6">
              Invoice: <strong>{state.invoiceNumber || 'N/A'}</strong><br />
              Customer: <strong>{state.customerName || 'N/A'}</strong><br />
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

      {showPast && (
        <PastReceiptsModal onClose={() => setShowPast(false)} />
      )}
    </>
  );
}