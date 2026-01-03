import { useEffect, useState } from 'react';
import { useCurrentUserStore } from './stores/useCurrentUserStore';
import InvoiceHeaderForm from './components/InvoiceHeaderForm';
import ItemsTable from './components/ItemsTable';
import TotalsSection from './components/TotalsSection';
import ActionBar from './components/ActionBar';
import StaffLogin from './pages/StaffLogin';
import StaffManagementModal from './components/StaffManagementModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import UserMenuDropdown from './components/UserMenuDropdown';
import EditProfileModal from './components/EditProfileModal';
import { fullSync } from './lib/sync';

function App() {
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const { currentUser, loadFromStorage, logout } = useCurrentUserStore();
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadFromStorage();
      if (currentUser) {
        await fullSync();
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-[#022142] flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Octavian Dynamics...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <StaffLogin />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Current User Bar */}
      <div className="bg-[#022142] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Left: User Info */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="text-4xl sm:text-5xl flex-shrink-0">👤</div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{currentUser.name}</h2>
                <p className="text-sm sm:text-base opacity-90 capitalize mt-0.5">{currentUser.role}</p>
              </div>
            </div>

            {/* Right: Three-Dot Menu - Always aligned to the far right */}
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

      {/* Modals */}
      {showStaffManagement && (
        <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
      )}

      {showCompanySettings && (
        <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}

      {/* Main Content */}
      <div className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
            <InvoiceHeaderForm />
            <ItemsTable />
            <TotalsSection />
          </div>
        </div>
      </div>

      <ActionBar />
    </div>
  );
}

export default App;