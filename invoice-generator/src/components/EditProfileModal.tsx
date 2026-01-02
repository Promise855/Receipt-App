// src/components/EditProfileModal.tsx

import { useState } from 'react';
import { db } from '../lib/db';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { hashPin } from '../utils';

type Props = {
  onClose: () => void;
};

export default function EditProfileModal({ onClose }: Props) {
  const { currentUser, login } = useCurrentUserStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    onClose();
    return null;
  }

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // If changing PIN
    if (newPin || confirmPin) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        setError('New PIN must be 4 digits');
        return;
      }
      if (newPin !== confirmPin) {
        setError('New PIN and confirmation do not match');
        return;
      }
    }

    try {
      const updateData: Partial<any> = { name: name.trim() };
      if (newPin) {
        updateData.pinHash = hashPin(newPin);
      }

      await db.staff.update(currentUser.id, updateData);

      // Update current session
      login({
        id: currentUser.id,
        name: name.trim(),
        role: currentUser.role,
      });

      alert('Profile updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal max-w-md">
        <h2 className="text-3xl font-bold text-[#022142] mb-8 text-center">
          Edit My Profile
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-[#022142] mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-[#022142] mb-2">
              Change PIN (optional)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
              placeholder="New 4-digit PIN"
              className="w-full px-6 py-4 text-center text-3xl tracking-widest bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none"
            />
          </div>

          {newPin && (
            <div>
              <label className="block text-lg font-bold text-[#022142] mb-2">
                Confirm New PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                placeholder="Confirm PIN"
                className="w-full px-6 py-4 text-center text-3xl tracking-widest bg-white rounded-xl border-2 border-gray-300 focus:border-[#022142] focus:outline-none"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-center mt-4 font-medium">{error}</p>
        )}

        <div className="mt-10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-8 py-4 bg-[#022142] text-white text-xl font-bold rounded-xl hover:bg-[#053f7c] transition shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}