// src/components/UserMenuDropdown.tsx

import { useState } from 'react';
import { useCurrentUserStore } from '../stores/useCurrentUserStore';

type Props = {
  onManageStaff: () => void;
  onCompanySettings: () => void;
  onEditProfile: () => void;
};

export default function UserMenuDropdown({ onManageStaff, onCompanySettings }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useCurrentUserStore();

  const handleLogout = () => {
    if (confirm('End shift and switch user?')) {
      logout();
      setIsOpen(false);
    }
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="px-6 py-4 bg-[#022142] text-white">
              <p className="font-bold text-lg">{currentUser?.name}</p>
              <p className="text-sm opacity-90 capitalize">{currentUser?.role}</p>
            </div>

            <div className="py-2">
                {/* Edit Profile - Always visible */}
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

                <hr className="my-2 border-gray-200" />
              {/* Switch User / End Shift - Always visible */}
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Switch User / End Shift
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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}