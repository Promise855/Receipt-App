// src/components/UserMenuDropdown.tsx

import { useState } from 'react';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';

type Props = {
  onManageStaff: () => void;
  onCompanySettings: () => void;
  onEditProfile: () => void;
};

export default function UserMenuDropdown({ onManageStaff, onCompanySettings, onEditProfile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { currentUser, logout } = useCurrentUserStore();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
    setIsOpen(false);
  };

  const confirmReset = async () => {
    try {
      // 1. Clear local IndexedDB
      await db.delete();
      localStorage.clear();
      sessionStorage.clear();

      // 2. Clear Supabase tables
      const tables = ['receipts', 'staff', 'company_settings'];
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', 0);
        if (error) console.error(`Error clearing ${table}:`, error);
      }

      alert('All data has been reset successfully! Reloading...');
      window.location.reload();
    } catch (err) {
      console.error('Reset failed:', err);
      alert('Reset failed. Check console for details.');
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="relative">
      {/* Three Dots Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl hover:bg-white/20 transition"
        aria-label="User menu"
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="px-6 py-4 bg-[#022142] text-white">
              <p className="font-bold text-lg">{currentUser?.name}</p>
              <p className="text-sm opacity-90 capitalize">{currentUser?.role}</p>
            </div>

            <div className="py-2">
              {/* Edit Profile */}
              <button
                onClick={() => {
                  onEditProfile();
                  setIsOpen(false);
                }}
                className="w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit My Profile
              </button>

              {/* Manager-Only Options */}
              {currentUser?.role === 'manager' && (
                <>
                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={() => {
                      onManageStaff();
                      setIsOpen(false);
                    }}
                    className="w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Manage Staff
                  </button>

                  <button
                    onClick={() => {
                      onCompanySettings();
                      setIsOpen(false);
                    }}
                    className="w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Settings
                  </button>

                  {/* Reset All Data - Manager Only */}
                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={handleResetClick}
                    className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset All Data (Testing)
                  </button>
                </>
              )}

              <hr className="my-2 border-gray-200" />

              {/* Switch User / End Shift */}
              <button
                onClick={handleLogoutClick}
                className="w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Switch User / End Shift
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 glass-backdrop z-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚪</div>
              <h3 className="text-2xl font-bold text-[#022142]">End Shift?</h3>
              <p className="text-gray-700 mt-4">
                Are you sure you want to end your shift and switch user?<br />
                All unsaved work will be lost.
              </p>
            </div>
            <div className="flex gap-6">
              <button onClick={cancelLogout} className="flex-1 px-8 py-4 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={confirmLogout} className="flex-1 px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition shadow-lg">
                End Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Data Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 glass-backdrop z-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-600">Reset All Data?</h3>
              <p className="text-gray-700 mt-4">
                This will <strong>permanently delete</strong> all receipts, staff, and settings<br />
                from <strong>this device</strong> and <strong>the cloud</strong>.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Only use this for testing or starting fresh.
              </p>
            </div>
            <div className="flex gap-6">
              <button onClick={cancelReset} className="flex-1 px-8 py-4 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={confirmReset} className="flex-1 px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition shadow-lg">
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}