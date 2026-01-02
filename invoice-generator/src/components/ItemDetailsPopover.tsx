import { useState } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';

type Props = {
  itemId: string;
  onClose: () => void;
};

export default function ItemDetailsPopover({ itemId, onClose }: Props) {
  const { items, updateItem } = useInvoiceStore();
  const item = items.find(i => i.id === itemId);

  const [sn, setSn] = useState(item?.details.itemSN || '');
  const [mn, setMn] = useState(item?.details.itemMN || '');
  const [imei, setImei] = useState(item?.details.itemIMEI || '');

  const handleSave = () => {
    updateItem(itemId, {
      details: {
        itemSN: sn.trim() || undefined,
        itemMN: mn.trim() || undefined,
        itemIMEI: imei.trim() || undefined,
      },
    });
    onClose();
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal">
        <h3 className="text-xl font-semibold text-[#022142] mb-6">Item Details</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item S/N:</label>
            <input
              type="text"
              value={sn}
              onChange={(e) => setSn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-[#50a5ff] focus:outline-none"
              placeholder="Enter Serial Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item M/N:</label>
            <input
              type="text"
              value={mn}
              onChange={(e) => setMn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-[#50a5ff] focus:outline-none"
              placeholder="Enter Model Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item IMEI:</label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-[#50a5ff] focus:outline-none"
              placeholder="Enter IMEI"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#022142] text-white rounded-md hover:bg-[#053f7c] transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}