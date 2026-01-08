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

function App() {
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { currentUser, loadFromStorage } = useCurrentUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      await loadFromStorage();

      const staffCount = await db.staff.count();
      if (staffCount === 0) {
        setIsFirstTime(true);
      } else {
        await fullSync();
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#022142] to-blue-950 flex items-center justify-center">
        <p className="text-white text-2xl">Loading Octavian Dynamics...</p>
      </div>
    );
  }

  if (isFirstTime) {
    return <CreateManagerAccount onComplete={() => setIsFirstTime(false)} />;
  }

  if (!currentUser) {
    return <StaffLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#022142] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Octavian Dynamics</h1>
            <p className="text-sm opacity-90">Invoice Generator</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{currentUser.name}</h2>
              <p className="text-sm sm:text-base opacity-90 capitalize mt-0.5">{currentUser.role}</p>
            </div>

            <div className="flex-shrink-0">
              <UserMenuDropdown
                onManageStaff={() => setShowStaffManagement(true)}
                onCompanySettings={() => setShowCompanySettings(true)}
                onEditProfile={() => setShowEditProfile(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manager Modals */}
      {currentUser.role === 'manager' && showStaffManagement && (
        <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
      )}

      {currentUser.role === 'manager' && showCompanySettings && (
        <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}

      {/* Main Content */}
      <div className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
            <InvoiceFormWrapper />
            <ItemsTable />
            <TotalsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;