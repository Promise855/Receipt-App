// src/components/PastReceiptsModal.tsx

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Listbox } from '@headlessui/react';

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

const sortOptions = [
  { id: 'date-desc', name: 'Date (Newest First)' },
  { id: 'date-asc', name: 'Date (Oldest First)' },
  { id: 'invoice', name: 'Invoice Number' },
] as const;

export default function PastReceiptsModal({ onClose }: Props) {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
    if (selectedSort.id === 'date-desc') return b.timestamp.localeCompare(a.timestamp);
    if (selectedSort.id === 'date-asc') return a.timestamp.localeCompare(a.timestamp);
    if (selectedSort.id === 'invoice') return a.invoiceNumber.localeCompare(b.invoiceNumber);
    return 0;
  });

  const handleView = async (id: number) => {
    const fullReceipt = await db.receipts.get(id);
    if (fullReceipt && fullReceipt.data) {
      localStorage.setItem('currentReceipt', JSON.stringify(fullReceipt.data));
      window.open('/receipt-preview', '_blank');
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await db.receipts.delete(deleteId);
      loadReceipts();
      setDeleteId(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete receipt');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <div className="glass-backdrop px-4">
      <div className="glass-modal max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-white/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#022142] text-center">
            Receipts
          </h2>
        </div>

        {/* Search & Sort */}
        <div className="flex-shrink-0 px-6 py-6 space-y-4 sm:space-y-0 sm:flex sm:gap-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by invoice, customer, date, or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 text-gray-900 rounded-xl border-2 border-[#ced4da] focus:border-[#022142] focus:outline-none focus:ring-4 focus:ring-[#022142]/20 transition text-base"
            />
          </div>

          <div className="w-full sm:w-64">
            <Listbox value={selectedSort} onChange={setSelectedSort}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white px-6 py-4 pr-12 text-left text-base bg-white/90 border-2 border-[#ced4da] focus:border-[#022142] focus:outline-none focus:ring-4 focus:ring-[#022142]/20 transition-all duration-200 hover:border-[#022142]/70">
                  <span className="block truncate">{selectedSort.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                    <svg className="h-6 w-6 text-[#022142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </Listbox.Button>

                <Listbox.Options className="absolute mt-2 w-full overflow-auto rounded-xl bg-white py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all ${
                          active ? 'bg-[#022142] text-white' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                            {option.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>

        {/* Scrollable Receipt List */}
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
                        onClick={() => openDeleteConfirm(r.id)}
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

      {/* Custom Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 glass-backdrop z-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-[#022142]">Delete Receipt?</h3>
              <p className="text-gray-700 mt-4">
                This action <strong>cannot be undone</strong>. The receipt will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}