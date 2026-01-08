// src/pages/StaffLogin.tsx

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import PinLoginModal from '../components/PinLoginModal';

export default function StaffLogin() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const all = await db.staff.orderBy('name').toArray();
    setStaffList(all);
  };

  const handlePinSuccess = () => {
    setSelectedStaff(null);
    // Redirect to main app
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-[#022142] to-blue-950 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-4xl w-full shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            Octavian Dynamics
          </h1>
          <p className="text-xl text-white/80">
            Select your name to begin shift
          </p>
        </div>

        {/* Staff Grid */}
        {staffList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {staffList.map((staff) => (
              <button
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="group bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-white/20"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">👤</div>
                <h3 className="text-xl font-bold text-white mb-1">{staff.name}</h3>
                <p className="text-sm text-white/70 capitalize">{staff.role}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-white/80">Loading staff...</p>
          </div>
        )}
      </div>

      {/* PIN Login Modal */}
      {selectedStaff && (
        <PinLoginModal
          staffId={selectedStaff.id!}
          staffName={selectedStaff.name}
          onSuccess={handlePinSuccess}
          onCancel={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
}