// src/components/CompanySettingsModal.tsx

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
      <div className="glass-modal max-w-2xl">
        <h2 className="text-3xl font-bold text-[#022142] mb-8 text-center">
          Company Settings (Manager Only)
        </h2>

        {/* Logo Upload & Preview */}
        <div className="text-center mb-8">
          <img
            src={previewLogo || '/img/Octa-logo.png'}
            alt="Company Logo Preview"
            className="mx-auto mb-6 w-40 h-40 object-contain rounded-xl border-4 border-gray-300 shadow-lg"
          />
          <label className="inline-block px-8 py-4 bg-[#022142] text-white text-lg font-semibold rounded-xl cursor-pointer hover:bg-[#053f7c] transition shadow-md">
            Change Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-[#022142] mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setSettings({ name: e.target.value })}
              className="w-full px-6 py-4 text-lg bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-[#022142] mb-2">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setSettings({ address: e.target.value })}
              rows={3}
              className="w-full px-6 py-4 text-lg bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-gray-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-[#022142] mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setSettings({ phone: e.target.value })}
              className="w-full px-6 py-4 text-lg bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold text-[#022142] mb-2">
                Email 1
              </label>
              <input
                type="email"
                value={email1}
                onChange={(e) => setSettings({ email1: e.target.value })}
                className="w-full px-6 py-4 text-lg bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-lg font-bold text-[#022142] mb-2">
                Email 2
              </label>
              <input
                type="email"
                value={email2}
                onChange={(e) => setSettings({ email2: e.target.value })}
                className="w-full px-6 py-4 text-lg bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onClose}
            className="px-12 py-5 bg-gray-600 text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}