// src/components/PastReceiptsModal.tsx

import { useState, useEffect } from 'react';
import { db } from '../lib/db';

type ReceiptSummary = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  timestamp: string;
  generatedByName?: string;
};

type Props = {
  onClose: () => void;
};

export default function PastReceiptsModal({ onClose }: Props) {
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
      generatedByName: r.generatedByName || 'Unknown',
    }));
    setReceipts(summaries);
  };

  const filtered = receipts.filter(r =>
    r.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.timestamp.slice(0,10).includes(search) ||
    (r.generatedByName && r.generatedByName.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.timestamp.localeCompare(a.timestamp);
    if (sortBy === 'date-asc') return a.timestamp.localeCompare(b.timestamp);
    if (sortBy === 'invoice') return a.invoiceNumber.localeCompare(b.invoiceNumber);
    return 0;
  });

  const handleView = async (id: number) => {
    const fullReceipt = await db.receipts.get(id);
    if (fullReceipt && fullReceipt.data) {
      localStorage.setItem('currentReceipt', JSON.stringify(fullReceipt.data));
      window.open('/receipt-preview', '_blank');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this receipt permanently?')) {
      await db.receipts.delete(id);
      loadReceipts();
    }
  };

  return (
    <div className="glass-backdrop px-4">
      <div className="glass-modal max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-white/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#022142] text-center">
            Past Receipts
          </h2>
        </div>

        {/* Search & Sort */}
        <div className="flex-shrink-0 px-6 py-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          <input
            type="text"
            placeholder="Search by invoice, customer, date, or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-white/80 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#022142]/30 text-base"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto px-6 py-4 bg-white/80 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#022142]/30"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="invoice">Invoice Number</option>
          </select>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No receipts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map(r => (
                <div
                  key={r.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-xl text-[#022142]">
                        #{r.invoiceNumber}
                      </div>
                      <div className="text-lg text-gray-800 mt-1">
                        {r.customerName}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <div>{new Date(r.timestamp).toLocaleString()}</div>
                        <div>By: <span className="font-medium">{r.generatedByName}</span></div>
                        <div className="font-bold text-[#022142]">
                          Total: ₦{r.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 sm:flex-col lg:flex-row">
                      <button
                        onClick={() => handleView(r.id)}
                        className="flex-1 px-6 py-3 bg-[#022142] text-white rounded-xl hover:bg-[#053f7c] transition font-medium shadow-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex-shrink-0 px-6 py-6 border-t border-white/30 text-center">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-gray-600 text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}