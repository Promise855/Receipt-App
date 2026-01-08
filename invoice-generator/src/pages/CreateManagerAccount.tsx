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
  const [isInitializing, setIsInitializing] = useState(false);
  const { login } = useCurrentUserStore();

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Full name is required to set up the manager account.');
      setIsSubmitting(false);
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Please enter a 4-digit numeric PIN.');
      setIsSubmitting(false);
      return;
    }

    if (pin !== confirmPin) {
      setError('The PINs you entered do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      const pinHash = hashPin(pin);
      
      const addedId = await db.staff.add({
        name: name.trim(),
        pinHash: pinHash,
        role: 'manager',
        createdAt: new Date().toISOString(),
      });

      // Show the system initialization screen
      setIsInitializing(true);

      // Automatically log the manager in
      login({
        id: addedId as number,
        name: name.trim(),
        role: 'manager',
      });

      // Brief delay to allow the "Initializing" animation to play
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      console.error('Setup Error:', err);
      setError('Failed to create account. Please try again.');
      setIsInitializing(false);
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-gray-800 border-t-red-600 animate-spin"></div>
            <img src="/img/Octa-logo.png" alt="Logo" className="h-12 w-12 absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <h2 className="text-white text-2xl font-black tracking-widest uppercase">Initializing System</h2>
            <p className="text-red-600 font-bold text-sm tracking-[0.3em] animate-pulse">SETTING UP DASHBOARD...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] overflow-hidden max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.3)] border-b-8 border-red-600">
        <div className="bg-red-600 py-8 text-center">
          <img src="/img/Octa-logo.png" alt="Octavian Logo" className="h-16 w-16 mx-auto bg-white p-2 rounded-2xl mb-4" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Initial System Setup</h2>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-black text-black uppercase">Create Manager</h3>
            <p className="text-gray-500 font-medium">Set up the primary administrative account.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Manager Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold text-gray-800"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Set 4-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-2 py-4 text-2xl text-center tracking-[0.5em] bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-mono"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-2 py-4 text-2xl text-center tracking-[0.5em] bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-mono"
                  placeholder="••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl">
                <p className="text-red-700 text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || pin.length !== 4}
              className="w-full py-5 bg-black text-white text-xl font-black rounded-2xl hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-black transition-all duration-300 shadow-xl uppercase tracking-tighter flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                  Processing...
                </>
              ) : 'Finish Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}