// src/components/PinLoginModal.tsx

import { useState } from 'react';
import { db } from '../lib/db';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { hashPin } from '../utils';

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
  const [lockCountdown, setLockCountdown] = useState(0); // seconds remaining
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (locked) return;

    setError('');

    const staff = await db.staff.get(staffId);
    if (!staff || !staff.pinHash) {
      setError('Staff PIN not configured. Contact manager.');
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
        setLockCountdown(300); // 5 minutes

        const interval = setInterval(() => {
          setLockCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setLocked(false);
              setAttempts(0);
              setError('');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setError('Too many wrong attempts. Account locked for 5 minutes.');
      } else {
        setError(`Wrong PIN. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? '' : 's'} left.`);
      }
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="text-2xl font-bold text-[#022142]">Enter PIN</h3>
          <p className="text-lg text-gray-700 mt-2">
            Welcome back, <strong>{staffName}</strong>
          </p>
        </div>

        <div className="mb-8">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-6 py-6 text-4xl text-center tracking-widest bg-white/90 rounded-2xl border-2 border-[#ced4da] focus:border-[#022142] focus:outline-none focus:ring-4 focus:ring-[#022142]/20 transition text-gray-900"
            placeholder="••••"
            disabled={locked}
            autoFocus
          />
        </div>

        {/* In-App Error Message */}
        {error && (
          <div className="mb-6 p-5 bg-red-100 border-2 border-red-300 rounded-2xl">
            <p className="text-center text-red-700 font-medium text-lg">{error}</p>
            {locked && lockCountdown > 0 && (
              <p className="text-center text-red-600 mt-3 font-bold">
                Try again in {formatCountdown(lockCountdown)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-8 py-4 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition shadow-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || locked}
            className="flex-1 px-8 py-4 bg-[#022142] text-white text-xl font-bold rounded-xl hover:bg-[#053f7c] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}