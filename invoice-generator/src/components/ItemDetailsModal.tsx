// src/components/ItemDetailsModal.tsx

type Props = {
  item: any;
  onUpdate: (details: any) => void;
  onClose: () => void;
};

export default function ItemDetailsModal({ item, onUpdate, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 animate-fade-in">
        <div className="bg-black p-10 text-center relative border-b-8 border-red-600">
          <div className="absolute top-4 right-8 text-red-600 font-black text-6xl opacity-10 uppercase select-none pointer-events-none">DETAILS</div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">Product Identifiers</h3>
          <p className="text-red-600 text-xs font-black uppercase tracking-[0.3em] mt-2 relative z-10">Specify Serial Numbers & IMEI</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Number (S/N)</label>
              <input
                value={item.serialNumber || ''}
                onChange={(e) => onUpdate({ serialNumber: e.target.value })}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold text-lg"
                placeholder="Enter S/N..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Model Number (M/N)</label>
              <input
                value={item.modelNumber || ''}
                onChange={(e) => onUpdate({ modelNumber: e.target.value })}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold text-lg"
                placeholder="Enter Model #..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">IMEI Number</label>
              <input
                value={item.imei || ''}
                onChange={(e) => onUpdate({ imei: e.target.value })}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold text-lg"
                placeholder="Enter 15-digit IMEI..."
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-6 bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-2xl active:scale-95"
          >
            Save & Update Item
          </button>
        </div>
      </div>
    </div>
  );
}