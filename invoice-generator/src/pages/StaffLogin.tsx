// src/pages/StaffLogin.tsx

import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import PinLoginModal from '../components/PinLoginModal';

type Props = {
  onLoginSuccess: () => void;
};

export default function StaffLogin({ onLoginSuccess }: Props) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const allStaff = await db.staff.toArray();
      setStaffList(allStaff);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  if (loading) return null; // Let App.tsx handle initial loading

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl">
          <img src="/img/Octa-logo.png" alt="Logo" className="h-16 w-16 object-contain" />
        </div>
        <h1 className="text-4xl font-black text-black tracking-tighter">
          OCTAVIAN <span className="text-red-600">DYNAMICS</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-3">Receipt Management System</p>
      </div>

      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffList.map((staff) => (
            <button
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className="group bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] text-center transition-all hover:border-red-600 hover:shadow-xl active:scale-95"
            >
              <div className="w-20 h-20 bg-black group-hover:bg-red-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black transition-colors">
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-black font-black text-xl truncate">{staff.name}</h3>
              <div className="inline-block px-4 py-1 bg-gray-50 rounded-full mt-2">
                <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">{staff.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedStaff && (
        <PinLoginModal 
          staff={selectedStaff} 
          onClose={() => setSelectedStaff(null)}
          onSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
}