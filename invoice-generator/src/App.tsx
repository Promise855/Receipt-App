import { useState } from 'react';
import InvoiceHeaderForm from './components/InvoiceHeaderForm';
import ItemsTable from './components/ItemsTable';
import TotalsSection from './components/TotalsSection';
import GenerateButton from './components/GenerateButton';
import PastReceiptsModal from './components/PastReceiptsModal';

function App() {
  const [showPast, setShowPast] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          <div className="absolute top-8 right-8">
            <button
              onClick={() => setShowPast(true)}
              className="px-6 py-4 bg-[#022142] text-white rounded-lg hover:bg-[#053f7c] transition"
            >
              View Past Receipts
            </button>
          </div>

          <InvoiceHeaderForm />
          <ItemsTable />
          <TotalsSection />
          <GenerateButton />
        </div>
      </div>

      {showPast && <PastReceiptsModal onClose={() => setShowPast(false)} />}
    </div>
  );
}

export default App;