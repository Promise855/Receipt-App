import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import PinLoginModal from '../components/PinLoginModal';
import { hashPin } from '../utils';

export default function StaffLogin() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isFirstRun, setIsFirstRun] = useState(false);

  useEffect(() => {
    checkFirstRunAndLoadStaff();
  }, []);

  const checkFirstRunAndLoadStaff = async () => {
    const count = await db.staff.count();
    if (count === 0) {
      // First time opening the app
      setIsFirstRun(true);
      setShowAdd(true); // Force add staff screen
    } else {
      loadStaff();
    }
  };

  const loadStaff = async () => {
    const all = await db.staff.orderBy('name').toArray();
    setStaffList(all);
  };

  const handleAddStaff = async () => {
    if (!newName.trim()) {
      alert('Please enter a staff name');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    const existing = await db.staff.where('name').equalsIgnoreCase(newName.trim()).first();
    if (existing) {
      alert('Staff name already exists');
      return;
    }

    await db.staff.add({
      name: newName.trim(),
      pinHash: hashPin(newPin),
      role: staffList.length === 0 ? 'manager' : 'cashier', // First staff = manager
      createdAt: new Date().toISOString(),
    });

    setNewName('');
    setNewPin('');
    setShowAdd(false);
    loadStaff();

    if (isFirstRun) {
      // Auto-select the new manager
      const newStaff = await db.staff.where('name').equalsIgnoreCase(newName.trim()).first();
      if (newStaff) {
        setSelectedStaff(newStaff);
      }
    }
  };

  const handlePinSuccess = () => {
    setSelectedStaff(null);
    // Navigate to main app (we'll set up routing next)
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
            {isFirstRun ? 'Welcome! Set up your first staff member' : 'Select staff to begin shift'}
          </p>
        </div>

        {/* Staff Grid */}
        {staffList.length > 0 && !showAdd && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
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
        )}

        {/* Add New Staff Form */}
        {showAdd && (
          <div className="max-w-md mx-auto bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              {isFirstRun ? 'Create Manager Account' : 'Add New Staff'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">Staff Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-6 py-4 bg-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">4-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-6 py-4 text-center text-3xl tracking-widest bg-white/20 text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50"
                />
                <p className="text-white/70 text-sm mt-2 text-center">
                  This PIN will be required to log in
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                {!isFirstRun && (
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setNewName('');
                      setNewPin('');
                    }}
                    className="flex-1 px-6 py-3 bg-white/30 text-white rounded-xl hover:bg-white/40 transition font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleAddStaff}
                  disabled={!newName.trim() || newPin.length !== 4}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg"
                >
                  {isFirstRun ? 'Create & Login' : 'Add Staff'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Add Button (when not in add mode or first run) */}
        {!showAdd && !isFirstRun && staffList.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAdd(true)}
              className="px-10 py-5 bg-white/20 text-white text-xl font-bold rounded-2xl hover:bg-white/30 transition shadow-xl transform hover:scale-105"
            >
              Add New Staff
            </button>
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