import { useState } from 'react';
import { db } from '../lib/db';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { hashPin } from '../utils'; // We'll add this function next

type Props = {
  staffId: number;
  staffName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PinLoginModal({ staffId, staffName, onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async () => {
    if (locked) return;

    const staff = await db.staff.get(staffId);
    if (!staff || !staff.pinHash) {
      alert('Staff PIN not set');
      return;
    }

    if (hashPin(pin) === staff.pinHash) {
      useCurrentUserStore.getState().login({
        id: staff.id!,
        name: staff.name,
        role: staff.role,
      });
      setPin('');
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      if (newAttempts >= 3) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 5 * 60 * 1000); // 5 minutes
        alert('Too many wrong attempts. Locked for 5 minutes.');
      } else {
        alert(`Wrong PIN. ${3 - newAttempts} attempts left.`);
      }
    }
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal max-w-sm">
        <h3 className="text-2xl font-bold text-[#022142] mb-6 text-center">
          Enter PIN for {staffName}
        </h3>

        <div className="mb-6">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-6 py-4 text-3xl text-center tracking-widest letter-spacing-8 bg-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#022142]"
            placeholder="••••"
            disabled={locked}
          />
        </div>

        {locked && (
          <p className="text-red-600 text-center mb-4">
            Locked due to too many attempts. Try again in 5 minutes.
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || locked}
            className="flex-1 px-6 py-3 bg-[#022142] text-white rounded-xl hover:bg-[#053f7c] transition font-medium disabled:opacity-50"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}