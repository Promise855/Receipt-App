import { useInvoiceStore } from '../stores/useInvoiceStore';
import { db } from '../lib/db';

export default function GenerateButton() {
  const state = useInvoiceStore();

  const handleGenerate = async () => {
    if (state.items.length === 0) {
      alert('Please add at least one item before generating receipt.');
      return;
    }
    if (!state.customerName.trim() || !state.invoiceNumber.trim()) {
      alert('Please fill in customer name and invoice number.');
      return;
    }

    try {
        // Create a clean plain object (no functions, no proxies)
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
            details: { ...item.details }, // shallow copy
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

        // Keep localStorage fallback for preview
        localStorage.setItem('currentReceipt', JSON.stringify(plainData));

        const previewWindow = window.open('/receipt-preview', '_blank');
        if (!previewWindow) {
        alert('Please allow popups to view the receipt.');
        } else {
        alert('Receipt generated and saved successfully!');
        }
    } catch (error) {
        console.error('Detailed save error:', error);
        alert('Save failed. Open console (F12) for details.');
    }
  };

  return (
    <div className="mt-12 text-center">
      <button
        type="button"
        onClick={handleGenerate}
        className="px-8 py-3 bg-[#022142] text-white text-lg font-semibold rounded-lg hover:bg-[#053f7c] transition transform hover:scale-105 shadow-md"
      >
        Generate Receipt
      </button>
    </div>
  );
}