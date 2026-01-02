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

function App() {
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const { currentUser, loadFromStorage, logout } = useCurrentUserStore();
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadFromStorage();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="text-5xl">👤</div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-sm opacity-90 capitalize">{currentUser.role}</p>
            </div>
          </div>

          {/* Three-Dot Menu */}
          <UserMenuDropdown
            onManageStaff={() => setShowStaffManagement(true)}
            onCompanySettings={() => setShowCompanySettings(true)}
            onEditProfile={() => setShowEditProfile(true)}
          />

          {showStaffManagement && (
            <StaffManagementModal onClose={() => setShowStaffManagement(false)} />
          )}

          {showCompanySettings && (
            <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />
          )}

          {showEditProfile && (
            <EditProfileModal onClose={() => setShowEditProfile(false)} />
          )}
        </div>
      </div>

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