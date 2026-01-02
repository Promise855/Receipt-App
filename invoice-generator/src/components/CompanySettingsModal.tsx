import { useState } from 'react';
import { useCompanyStore } from '../stores/useCompanyStore';

type Props = {
  onClose: () => void;
};

export default function CompanySettingsModal({ onClose }: Props) {
  const { logo, name, address, phone, email1, email2, setSettings } = useCompanyStore();
  const [previewLogo, setPreviewLogo] = useState(logo);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewLogo(base64);
        setSettings({ logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal">
        <h2 className="text-2xl font-bold text-[#022142] mb-6">Company Settings</h2>

        {/* Logo Upload */}
        <div className="mb-6 text-center">
          <img 
            src={previewLogo} 
            alt="Company Logo" 
            className="mx-auto mb-4 w-32 h-32 object-contain border-2 border-gray-500 rounded"
          />
          <label className="block">
            <span className="px-6 py-3 bg-[#022142] text-white rounded-lg cursor-pointer hover:bg-[#053f7c] transition">
              Change Logo
            </span>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>
        </div>

        <div className="space-y-4">
          <textarea
            value={address}
            onChange={(e) => setSettings({ address: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg h-24"
            placeholder="Full Address"
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setSettings({ phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Phone"
          />
          <input
            type="email"
            value={email1}
            onChange={(e) => setSettings({ email1: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Email 1"
          />
          <input
            type="email"
            value={email2}
            onChange={(e) => setSettings({ email2: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Email 2"
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}