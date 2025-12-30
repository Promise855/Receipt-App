import { useState, useEffect } from 'react';
import { db } from '../lib/db';

type ReceiptSummary = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  timestamp: string;
};

export default function PastReceiptsModal({ onClose }: { onClose: () => void }) {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'invoice'>('date-desc');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const all = await db.receipts.toArray();
    const summaries = all.map(r => ({
      id: r.id!,
      invoiceNumber: r.invoiceNumber,
      customerName: r.customerName,
      total: r.total,
      timestamp: r.timestamp,
    }));
    setReceipts(summaries);
  };

  const filtered = receipts.filter(r =>
    r.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.timestamp.slice(0,10).includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.timestamp.localeCompare(a.timestamp);
    if (sortBy === 'date-asc') return a.timestamp.localeCompare(b.timestamp);
    if (sortBy === 'invoice') return a.invoiceNumber.localeCompare(b.invoiceNumber);
    return 0;
  });
  const handleView = async (id: number) => {
    try {
        const fullReceipt = await db.receipts.get(id);
        if (fullReceipt && fullReceipt.data) {
        localStorage.setItem('currentReceipt', JSON.stringify(fullReceipt.data));
        window.open('/receipt-preview', '_blank');
        } else {
        alert('Receipt data not found.');
        }
    } catch (error) {
        console.error('Failed to load receipt:', error);
        alert('Error loading receipt.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this receipt permanently?')) {
      await db.receipts.delete(id);
      loadReceipts();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold text-[#022142] mb-6">Past Receipts</h2>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by invoice, name, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="invoice">Invoice Number</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No receipts found.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.map(r => (
              <li key={r.id} className="flex justify-between items-center p-4 bg-gray-50 rounded hover:bg-gray-100">
                <div>
                  <strong>#{r.invoiceNumber}</strong> - {r.customerName}
                  <span className="ml-4 text-sm text-gray-600">
                    {new Date(r.timestamp).toLocaleDateString()} | ₦{r.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(r.id)}
                    className="px-4 py-2 bg-[#022142] text-white rounded hover:bg-[#053f7c]"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}