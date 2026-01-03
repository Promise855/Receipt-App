import { useInvoiceStore } from '../stores/useInvoiceStore';
import { useEffect, useState } from 'react';
import ItemDetailsPopover from './ItemDetailsPopover';


export default function ItemsTable() {
  const { items, addItem, updateItem, removeItem, recalculateTotals } = useInvoiceStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Recalculate whenever items change
  useEffect(() => {
    recalculateTotals();
  }, [items, recalculateTotals]);

  const handleItemChange = (id: string, field: string, value: string | number) => {
    updateItem(id, { [field]: value });

    // Special handling for numeric fields to calculate amount
    if (['qty', 'unitPrice', 'discount'].includes(field)) {
      const item = items.find(i => i.id === id);
      if (item) {
        const qty = field === 'qty' ? Number(value) || 0 : item.qty;
        const unitPrice = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
        const discount = field === 'discount' ? Number(value) || 0 : item.discount;

        const amount = qty * unitPrice * (1 - discount / 100);
        updateItem(id, { amount: Number(amount.toFixed(2)) });
      }
    }
  };

  const openDetailsPopover = (id: string) => {
    setSelectedItemId(id);
  };

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={addItem}
        id="addItem"
        className="mb-6 w-full sm:w-auto px-6 py-3 bg-[#022142] text-white text-sm sm:text-base font-medium rounded-md hover:bg-[#053f7c] transition -shadow-lg shadow-lg"
      >
        Add Item
      </button>

      <div id="itemTable" className="overflow-x-auto -mx-4 sm:-mx-0">
        <div className="table-wrapper min-w-full sm:min-w-0">
          <table className="w-full min-w-[900px] sm:min-w-0 border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa]">
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">S/N</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Name</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Item Description</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Item Details</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Qty</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">(₦) Unit Price</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Discount (%)</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Amount</th>
                <th className="border border-[#dee2e6] px-3 py-2 text-left text-xs sm:text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                        No items added yet. Click "Add Item" to start.
                    </td>
                    </tr>
                ) : (
                    items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8f9fa]">
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="text"
                            value={item.sn}
                            readOnly
                            className="w-12 bg-transparent text-center"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            required
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="Item name"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            required
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="Description"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm text-center">
                        <button
                            type="button"
                            onClick={() => openDetailsPopover(item.id)}
                            className={`details-btn px-3 py-1.5 bg-[#022142] text-white text-xs rounded hover:bg-[#02538b] transition ${
                            item.details.itemSN || item.details.itemMN || item.details.itemIMEI
                                ? 'bg-green-700 hover:bg-green-800'
                                : ''
                            }`}
                        >
                            {item.details.itemSN || item.details.itemMN || item.details.itemIMEI
                            ? 'Edit Details'
                            : 'Add Details'}
                        </button>
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                            required
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="text"
                            value={item.unitPrice.toLocaleString()}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value.replace(/,/g, '')))}
                            required
                            className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                            placeholder="0"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-xs sm:text-sm">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', Number(e.target.value))}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
                        />
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-right text-xs sm:text-sm font-medium">
                        ₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border border-[#dee2e6] px-3 py-2 text-center text-xs sm:text-sm">
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="removeItem px-3 py-1.5 bg-[#790707] text-white text-xs rounded hover:bg-[#c82333] transition"
                        >
                            Remove
                        </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
          </table>

          {selectedItemId && (
            <ItemDetailsPopover
                itemId={selectedItemId}
                onClose={() => setSelectedItemId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}