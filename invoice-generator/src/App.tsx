import InvoiceHeaderForm from './components/InvoiceHeaderForm';
import ItemsTable from './components/ItemsTable';
import TotalsSection from './components/TotalsSection';
import ActionBar from './components/ActionBar';
import { useState } from 'react';
import { useCompanyStore } from './stores/useCompanyStore';
import CompanySettingsModal from './components/CompanySettingsModal';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { logo, name } = useCompanyStore();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className='text-center mb-4'>
          <img src={logo} alt='Company Logo' className='mx-auto mb-4 w-40' />
          <button
            onClick={() => setShowSettings(true)}
            className='mt-2 text-md text-bold text-[#022142] hover:transform hover:scale-105 transition'>
              Edit Company Settings
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
          <InvoiceHeaderForm />
          <ItemsTable />
          <TotalsSection />
        </div>
      </div>

      <ActionBar />
      {showSettings && <CompanySettingsModal onClose={() => setShowSettings(false)} />} 
    </div>
  );
}

export default App;