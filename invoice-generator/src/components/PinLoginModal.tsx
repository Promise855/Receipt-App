// src/components/PinLoginModal.tsx

import { useState, useEffect } from 'react';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { hashPin } from '../utils';

type Props = {
  staff: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PinLoginModal({ staff, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { login } = useCurrentUserStore();

  useEffect(() => {
    const savedLockout = localStorage.getItem(`lockout_${staff.id}`);
    if (savedLockout) {
      const remaining = parseInt(savedLockout) - Date.now();
      if (remaining > 0) setLockoutTime(parseInt(savedLockout));
    }
  }, [staff.id]);

  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        if (lockoutTime - Date.now() <= 0) {
          setLockoutTime(null);
          setAttempts(0);
          localStorage.removeItem(`lockout_${staff.id}`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime, staff.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    if (val.length === 4) validatePin(val);
  };

  const validatePin = async (inputPin: string) => {
    const hashedInput = hashPin(inputPin);
    if (hashedInput === staff.pinHash) {
      login({ id: staff.id, name: staff.name, role: staff.role });
      onSuccess(); // Trigger transition in App.tsx
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin('');
      if (nextAttempts >= 3) {
        const lockUntil = Date.now() + 5 * 60 * 1000;
        setLockoutTime(lockUntil);
        localStorage.setItem(`lockout_${staff.id}`, lockUntil.toString());
        setError('Security lockout active.');
      } else {
        setError(`Invalid PIN. ${3 - nextAttempts} attempts left.`);
      }
    }
  };

  const getRemainingTime = () => {
    if (!lockoutTime) return '';
    const seconds = Math.floor((lockoutTime - Date.now()) / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-fade-in">
        <div className="p-8 sm:p-12 text-center">
          <div className="w-20 h-20 bg-black rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-1">{staff.name}</h3>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">Verify Access PIN</p>

          <div className="relative max-w-[240px] mx-auto">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              disabled={!!lockoutTime}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 text-center text-3xl tracking-[1em] font-mono focus:border-red-600 focus:bg-white outline-none transition-all"
              placeholder="••••"
            />
            {lockoutTime && (
              <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center">
                <p className="text-red-600 font-black text-[10px] uppercase">Locked</p>
                <p className="text-black font-mono font-bold text-lg">{getRemainingTime()}</p>
              </div>
            )}
          </div>
          {error && !lockoutTime && <p className="mt-4 text-red-600 font-bold text-[10px] uppercase tracking-tight">{error}</p>}
          <button onClick={onClose} className="mt-10 w-full py-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-600 transition-colors">
            Cancel and Return
          </button>
        </div>
        <div className="h-2 bg-red-600 w-full"></div>
      </div>
    </div>
  );
}