// src/components/ItemsTable.tsx

import { useInvoiceStore } from '../stores/useInvoiceStore';
import { useEffect, useState } from 'react';
import ItemDetailsModal from './ItemDetailsModal'; // Renamed Popover to Modal to match previous step

export default function ItemsTable() {
  const { items, addItem, updateItem, removeItem, recalculateTotals } = useInvoiceStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Keep totals in sync
  useEffect(() => {
    recalculateTotals();
  }, [items, recalculateTotals]);

  // Original handler logic for reliable calculations
  const handleItemChange = (id: string, field: string, value: string | number) => {
    updateItem(id, { [field]: value });

    if (['qty', 'unitPrice', 'discount'].includes(field)) {
      const item = items.find(i => i.id === id);
      if (item) {
        const qty = field === 'qty' ? Number(value) || 0 : (item.qty || 0);
        const unitPrice = field === 'unitPrice' ? Number(value) || 0 : (item.unitPrice || 0);
        const discount = field === 'discount' ? Number(value) || 0 : (item.discount || 0);

        const amount = qty * unitPrice * (1 - discount / 100);
        updateItem(id, { amount: Number(amount.toFixed(2)) });
      }
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6 border-l-4 border-red-600 pl-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight">Receipt Items</h3>
        <button
          type="button"
          onClick={addItem}
          className="px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-95"
        >
          + Add New Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-xl">
        <table className="w-full min-w-[900px] border-collapse bg-white">
          <thead className="bg-black">
            <tr>
              <th className="px-4 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest w-12">S/N</th>
              <th className="px-4 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Item Name</th>
              <th className="px-4 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Description</th>
              <th className="px-4 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-32">Details</th>
              <th className="px-4 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-24">Qty</th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-white uppercase tracking-widest w-36">Unit Price</th>
              <th className="px-4 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-24">Disc %</th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-white uppercase tracking-widest w-40">Amount</th>
              <th className="px-4 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-20 bg-red-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic">
                  No items added yet
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-transparent focus:border-red-600 focus:bg-white rounded-lg text-sm font-bold text-black outline-none transition-all"
                      placeholder="Product..."
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-transparent focus:border-red-600 focus:bg-white rounded-lg text-sm font-medium text-gray-500 outline-none transition-all"
                      placeholder="Specifications..."
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                        item.serialNumber || item.imei || item.modelNumber
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 hover:bg-black hover:text-white'
                      }`}
                    >
                      {item.serialNumber || item.imei || item.modelNumber ? '✓ Added' : '+ Details'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                      className="w-full px-2 py-2 text-center bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-lg text-sm font-black text-black outline-none"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">₦</span>
                      <input
                        type="text"
                        value={item.unitPrice.toLocaleString()}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value.replace(/,/g, '')))}
                        className="w-full pl-5 pr-2 py-2 text-right bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-lg text-sm font-black text-black outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => handleItemChange(item.id, 'discount', Number(e.target.value))}
                      className="w-full px-2 py-2 text-center bg-red-50 border border-transparent focus:border-red-600 focus:bg-white rounded-lg text-sm font-black text-red-600 outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-black text-black">
                    ₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 bg-gray-50 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedItemId && (
        <ItemDetailsModal
          item={items.find(i => i.id === selectedItemId)}
          onUpdate={(details) => updateItem(selectedItemId, details)}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </div>
  );
}