import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCurrentUserStore } from './stores/useCurrentUserStore';
import ItemsTable from './components/ItemsTable';
import TotalsSection from './components/TotalsSection';
import StaffLogin from './pages/StaffLogin';
import StaffManagementModal from './components/StaffManagementModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import UserMenuDropdown from './components/UserMenuDropdown';
import EditProfileModal from './components/EditProfileModal';
import CreateManagerAccount from './pages/CreateManagerAccount';
import { fullSync } from './lib/sync';
import { db } from './lib/db';
import InvoiceHeaderForm from './components/InvoiceHeaderForm';
import ActionBar from './components/ActionBar';

const schema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phoneNumber: z.string().optional(),
  invoiceNumber: z.string().min(3, "Invoice No. is required"),
  date: z.string(),
  paymentMode: z.enum(['Bank Transfer', 'Cash', 'Card Payment', 'Not Paid']),
});

function App() {
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { currentUser, loadFromStorage } = useCurrentUserStore();
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer' as const,
    },
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFromStorage();
      const staffCount = await db.staff.count();
      if (staffCount === 0) setIsFirstTime(true);
      else await fullSync();
      setLoading(false);
    };
    init();
  }, [loadFromStorage]);

  if (loading || isLoggingIn) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="h-12 w-12 border-4 border-t-red-600 border-white/10 rounded-full animate-spin"></div>
    </div>
  );

  if (isFirstTime) return <CreateManagerAccount onComplete={() => window.location.reload()} />;
  if (!currentUser) return <StaffLogin onLoginSuccess={() => setIsLoggingIn(true)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white border-b-4 border-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter">OCTAVIAN <span className="text-red-600">DYNAMICS</span></h1>
          <UserMenuDropdown onManageStaff={() => setShowStaffManagement(true)} onCompanySettings={() => setShowCompanySettings(true)} onEditProfile={() => setShowEditProfile(true)} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="h-2 bg-red-600 w-full" />
          <div className="p-10">
            <FormProvider {...methods}>
              <form onSubmit={(e) => e.preventDefault()}>
                <InvoiceHeaderForm />
                <div className="my-12 border-t border-gray-100" />
                <ItemsTable />
                <TotalsSection />
                <ActionBar />
              </form>
            </FormProvider>
          </div>
        </div>
      </main>

      {showStaffManagement && <StaffManagementModal onClose={() => setShowStaffManagement(false)} />}
      {showCompanySettings && <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </div>
  );
}

export default App;