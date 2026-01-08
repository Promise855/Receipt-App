// src/components/PastReceiptsModal.tsx

import { useState, useEffect, useMemo, Fragment } from 'react';
import { db } from '../lib/db';
import { Listbox, Transition } from '@headlessui/react';

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
  { id: 'date-desc', name: 'Newest First' },
  { id: 'date-asc', name: 'Oldest First' },
  { id: 'invoice', name: 'By Invoice #' },
] as const;

const MAX_RECEIPTS = 200;

export default function PastReceiptsModal({ onClose }: Props) {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        setLoading(true);
        const all = await db.receipts
          .orderBy('timestamp')
          .reverse()
          .limit(MAX_RECEIPTS)
          .toArray();

        const summaries = all.map(r => ({
          id: r.id!,
          invoiceNumber: r.invoiceNumber || 'N/A',
          customerName: r.customerName || 'Unknown',
          total: r.total || 0,
          timestamp: r.timestamp || '',
          generatedByName: r.generatedByName || 'Unknown',
        }));

        setReceipts(summaries);
      } catch (error) {
        console.error('Failed to load receipts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReceipts();
  }, []);

  const filteredAndSorted = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = receipts.filter(r => 
      r.invoiceNumber.toLowerCase().includes(searchLower) ||
      r.customerName.toLowerCase().includes(searchLower) ||
      r.generatedByName?.toLowerCase().includes(searchLower)
    );

    return [...filtered].sort((a, b) => {
      if (selectedSort.id === 'date-desc') return b.timestamp.localeCompare(a.timestamp);
      if (selectedSort.id === 'date-asc') return a.timestamp.localeCompare(b.timestamp);
      if (selectedSort.id === 'invoice') return a.invoiceNumber.localeCompare(b.invoiceNumber);
      return 0;
    });
  }, [receipts, search, selectedSort]);

  const handleView = async (id: number) => {
    const fullReceipt = await db.receipts.get(id);
    if (fullReceipt) {
      localStorage.setItem('currentReceipt', JSON.stringify(fullReceipt));
      window.open('/receipt-preview', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border-4 border-black">
        
        {/* TOP BRANDED BAR */}
        <div className="bg-black text-white px-8 py-6 flex justify-between items-center border-b-4 border-red-600">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Archive <span className="text-red-600">Vault</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Transaction History</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTROLS */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border-b border-gray-100">
          <div className="md:col-span-2 relative group">
            <input
              type="text"
              placeholder="SEARCH BY CLIENT OR INVOICE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 focus:border-black py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all shadow-sm"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <Listbox value={selectedSort} onChange={setSelectedSort}>
            <div className="relative">
              <Listbox.Button className="w-full bg-white border-2 border-gray-200 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest flex justify-between items-center">
                {selectedSort.name}
                <span className="text-red-600 text-[10px]">▼</span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-2 w-full bg-white border-2 border-black rounded-xl shadow-2xl z-[110] overflow-hidden outline-none">
                  {sortOptions.map((opt) => (
                    <Listbox.Option key={opt.id} value={opt} className={({ active }) => `px-6 py-4 cursor-pointer text-[10px] font-black uppercase ${active ? 'bg-black text-white' : 'text-gray-600'}`}>{opt.name}</Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing database...</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <p className="text-sm font-black uppercase tracking-widest">No Records Found</p>
            </div>
          ) : (
            filteredAndSorted.map(r => (
              <div key={r.id} className="group bg-white border border-gray-100 hover:border-black rounded-2xl p-6 transition-all hover:shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded">#{r.invoiceNumber}</span>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                        {new Date(r.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-black">{r.customerName}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Processed By: {r.generatedByName}</p>
                </div>
                
                <div className="flex items-center gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl font-black text-black">₦{r.total.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleView(r.id)} className="bg-black text-white p-4 rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button onClick={() => setDeleteId(r.id)} className="bg-gray-50 text-gray-400 p-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full border-2 border-black shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">Destroy Record?</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">This action is permanent and cannot be reversed.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={async () => {
                await db.receipts.delete(deleteId);
                setReceipts(prev => prev.filter(r => r.id !== deleteId));
                setDeleteId(null);
              }} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shadow-lg">Confirm Delete</button>
              <button onClick={() => setDeleteId(null)} className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Go Back</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #000; }
      `}</style>
    </div>
  );
}