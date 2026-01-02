import { useState } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';
import PastReceiptsModal from './PastReceiptsModal';

export default function ActionBar() {
const [showPast, setShowPast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const state = useInvoiceStore();

  const handleGenerateClick = () => {
    if (state.items.length === 0) {
      alert('Please add at least one item before generating receipt.');
      return;
    }
    if (!state.customerName.trim() || !state.invoiceNumber.trim()) {
      alert('Please fill in customer name and invoice number.');
      return;
    }
    setShowConfirm(true); // Show confirmation
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);

    try {
      const plainData = {
        customerName: state.customerName,
        phoneNumber: state.phoneNumber,
        invoiceNumber: state.invoiceNumber,
        date: state.date,
        paymentMode: state.paymentMode,
        items: state.items.map(item => ({
          id: item.id,
          sn: item.sn,
          name: item.name,
          description: item.description,
          details: { ...item.details },
          qty: item.qty,
          unitPrice: item.unitPrice,
          discount: item.discount,
          amount: item.amount,
        })),
        itemQty: state.itemQty,
        subTotal: state.subTotal,
        total: state.total,
        amountInWords: state.amountInWords,
      };

      await db.receipts.add({
        data: plainData,
        timestamp: new Date().toISOString(),
        invoiceNumber: state.invoiceNumber,
        customerName: state.customerName,
        total: state.total,
      });

      localStorage.setItem('currentReceipt', JSON.stringify(plainData));

      const previewWindow = window.open('/receipt-preview', '_blank');
      if (!previewWindow) {
        alert('Please allow popups to view the receipt.');
      } 
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ Failed to save receipt. Check console.');
    }
  };

  return (
    <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
                {/* Generate Receipt */}
                <button
                onClick={handleGenerateClick}
                className="flex-1 px-6 py-3 bg-[#022142] text-white text-lg font-bold rounded-xl hover:bg-[#053f7c] transition-all shadow-lg"
                >
                Generate Receipt
                </button>

                {/* View Past Receipts */}
                <button
                onClick={() => setShowPast(true)}
                className="flex-1 px-6 py-3 bg-gray-700 text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                >
                View Past Receipts
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
                        Invoice: <strong>{state.invoiceNumber}</strong><br />
                        Customer: <strong>{state.customerName}</strong><br />
                        Total: <strong>₦{state.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
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

      {/* Past Receipts Modal */}
      {showPast && <PastReceiptsModal onClose={() => setShowPast(false)} />}
    </>
  );
}