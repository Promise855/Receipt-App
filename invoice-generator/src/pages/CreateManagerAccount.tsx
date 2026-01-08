// src/pages/CreateManagerAccount.tsx

import { useState } from 'react';
import { db } from '../lib/db';
import { hashPin } from '../utils';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';

type Props = {
  onComplete: () => void;
};

export default function CreateManagerAccount({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useCurrentUserStore();

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Please enter your full name');
      setIsSubmitting(false);
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      setIsSubmitting(false);
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const addedId = await db.staff.add({
        name: name.trim(),
        pinHash: hashPin(pin),
        role: 'manager',
        createdAt: new Date().toISOString(),
      });

      // Auto-login the new manager with correct ID
      login({
        id: Number(addedId),
        name: name.trim(),
        role: 'manager',
      });

      onComplete();
    } catch (err) {
      console.error('Failed to create manager account:', err);
      setError('Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#022142] via-blue-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Octavian Dynamics
          </h1>
          <p className="text-xl text-white/70 mt-3">
            Enterprise Receipt System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="px-10 pt-12 pb-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#022142] rounded-full mb-6 shadow-lg">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-3xl font-bold text-[#022142]">Welcome!</h2>
              <p className="text-gray-600 mt-3 text-lg">
                Create the <strong>manager account</strong> to begin
              </p>
            </div>

            <div className="space-y-7">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-[#022142] mb-2 uppercase tracking-wider">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#022142]/20 focus:border-[#022142] transition"
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>

              {/* PIN Field */}
              <div>
                <label className="block text-sm font-semibold text-[#022142] mb-2 uppercase tracking-wider">
                  4-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 4))}
                  className="w-full px-6 py-5 text-4xl text-center tracking-widest font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#022142]/20 focus:border-[#022142] transition"
                  placeholder="••••"
                />
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-semibold text-[#022142] mb-2 uppercase tracking-wider">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                  className="w-full px-6 py-5 text-4xl text-center tracking-widest font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#022142]/20 focus:border-[#022142] transition"
                  placeholder="••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-center text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || pin.length !== 4 || pin !== confirmPin}
              className="w-full mt-10 px-8 py-5 bg-[#022142] text-white text-xl font-bold rounded-2xl hover:bg-[#053f7c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Manager Account'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-8">
              This account will have full administrative access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}