// src/App.tsx

import { useEffect, useState } from 'react';
import { useCurrentUserStore } from './stores/useCurrentUserStore';
import ItemsTable from './components/ItemsTable';
import TotalsSection from './components/TotalsSection';
import StaffLogin from './pages/StaffLogin';
import StaffManagementModal from './components/StaffManagementModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import UserMenuDropdown from './components/UserMenuDropdown';
import EditProfileModal from './components/EditProfileModal';
import CreateManagerAccount from './pages/CreateManagerAccount';
import InvoiceFormWrapper from './components/InvoiceFormWrapper';
import { fullSync } from './lib/sync';
import { db } from './lib/db';
import InvoiceHeaderForm from './components/InvoiceHeaderForm';
import ActionBar from './components/ActionBar';

function App() {
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New transition state
  const { currentUser, loadFromStorage } = useCurrentUserStore();
  const [loading, setLoading] = useState(true);

  const checkStaffStatus = async () => {
    const staffCount = await db.staff.count();
    if (staffCount === 0) {
      setIsFirstTime(true);
    } else {
      setIsFirstTime(false);
      await fullSync();
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFromStorage();
      await checkStaffStatus();
      setLoading(false);
    };
    init();
  }, [loadFromStorage]);

  // Handle successful login transition
  const handleLoginSuccess = async () => {
    setIsLoggingIn(true);
    await loadFromStorage();
    // Intentional delay for professional "Loading Dashboard" feel
    setTimeout(() => {
      setIsLoggingIn(false);
    }, 1500);
  };

  // Centralized Loading Component
  if (loading || isLoggingIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-red-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-red-600 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-black tracking-[0.4em] uppercase">Octavian</h2>
            <p className="text-red-600 font-bold text-[10px] tracking-[0.2em] animate-pulse mt-1">
              {isLoggingIn ? 'INITIALIZING DASHBOARD...' : 'LOADING SYSTEM...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isFirstTime) {
    return <CreateManagerAccount onComplete={() => checkStaffStatus()} />;
  }

  if (!currentUser) {
    return <StaffLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white shadow-2xl border-b-4 border-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img src="/img/Octa-logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">
                OCTAVIAN <span className="text-red-600">DYNAMICS</span>
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-gray-400 font-bold uppercase">Receipt Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right hidden xs:block">
              <h2 className="text-sm sm:text-lg font-bold truncate leading-tight">{currentUser.name}</h2>
              <p className="text-[10px] sm:text-xs text-red-500 font-black uppercase tracking-wider">{currentUser.role}</p>
            </div>
            <UserMenuDropdown
              onManageStaff={() => setShowStaffManagement(true)}
              onCompanySettings={() => setShowCompanySettings(true)}
              onEditProfile={() => setShowEditProfile(true)}
            />
          </div>
        </div>
      </div>

      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-2 bg-red-600 w-full"></div>
            <div className="p-6 sm:p-10">
              <InvoiceHeaderForm />
              <div className="my-10 border-t border-gray-100"></div>
              <ItemsTable />
              <TotalsSection />
              <ActionBar />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {currentUser.role === 'manager' && showStaffManagement && (
        <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
      )}
      {currentUser.role === 'manager' && showCompanySettings && (
        <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />
      )}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
}

export default App;