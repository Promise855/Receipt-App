// src/components/StaffManagementModal.tsx

import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { hashPin } from '../utils';

type Props = {
  onClose: () => void;
};

export default function StaffManagementModal({ onClose }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPin, setEditPin] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null); // For custom delete confirm

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const all = await db.staff.orderBy('name').toArray();
    setStaffList(all);
  };

  const handleAdd = async () => {
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

    try {
      await db.staff.add({
        name: newName.trim(),
        pinHash: hashPin(newPin),
        role: 'cashier',
        createdAt: new Date().toISOString(),
      });

      setNewName('');
      setNewPin('');
      setShowAdd(false);
      loadStaff();
    } catch (error) {
      console.error('Add staff failed:', error);
      alert('Failed to add staff');
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingId(staff.id!);
    setEditName(staff.name);
    setEditPin('');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('Name required');
      return;
    }
    if (editPin && (editPin.length !== 4 || !/^\d{4}$/.test(editPin))) {
      alert('PIN must be 4 digits');
      return;
    }

    try {
      const updateData: Partial<Staff> = {
        name: editName.trim(),
      };
      if (editPin) {
        updateData.pinHash = hashPin(editPin);
      }

      await db.staff.update(editingId!, updateData);
      setEditingId(null);
      setEditPin('');
      loadStaff();
    } catch (error) {
      console.error('Edit failed:', error);
      alert('Failed to update');
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await db.staff.delete(deleteId);
      loadStaff();
      setDeleteId(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete staff');
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <div className="glass-backdrop">
      <div className="glass-modal max-w-3xl max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-bold text-[#022142] mb-8 text-center flex-shrink-0">
          Manage Staff
        </h2>

        {/* Add Button */}
        <div className="text-center mb-8 flex-shrink-0">
          <button
            onClick={() => setShowAdd(true)}
            className="px-10 py-4 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 transition shadow-lg"
          >
            Add New Staff
          </button>
        </div>

        {/* Scrollable Staff List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-6">
            {staffList.length === 0 ? (
              <p className="text-center text-gray-800 text-lg py-12">No staff added yet</p>
            ) : (
              staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-xl"
                >
                  {editingId === staff.id ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xl font-bold text-[#022142] mb-3">
                          Staff Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-6 py-4 text-xl bg-white rounded-xl border-2 border-gray-400 focus:border-[#022142] focus:outline-none text-gray-900"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xl font-bold text-[#022142] mb-3">
                          New 4-Digit PIN (optional)
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value.slice(0, 4))}
                          className="w-full px-6 py-4 text-4xl text-center tracking-widest bg-white rounded-xl border-2 border-gray-400 focus:border-[#022142] focus:outline-none text-gray-900"
                          placeholder="••••"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-6 py-3 bg-[#022142] text-white text-xl font-bold rounded-xl hover:bg-[#053f7c] transition shadow-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditPin('');
                          }}
                          className="flex-1 px-6 py-3 bg-gray-600 text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                        <h4 className="text-2xl font-bold text-[#022142]">{staff.name}</h4>
                        <p className="text-lg text-gray-800 capitalize mt-2">{staff.role}</p>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="flex-1 sm:flex-initial px-6 py-2 bg-[#022142] text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition shadow-md"
                        >
                          Edit
                        </button>
                        {staff.role !== 'manager' && (
                          <button
                            onClick={() => openDeleteConfirm(staff.id!)}
                            className="flex-1 sm:flex-initial px-6 py-2 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 transition shadow-md"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Staff Form */}
        {showAdd && (
          <div className="fixed inset-0 glass-backdrop z-60 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-white/50">
              <h3 className="text-3xl font-bold text-[#022142] mb-10 text-center">
                Add New Staff
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-xl font-bold text-[#022142] mb-3">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-6 py-5 text-xl bg-gray-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#022142]/30 text-gray-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-[#022142] mb-3">
                    4-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-6 py-5 text-4xl text-center tracking-widest bg-gray-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#022142]/30 text-gray-900"
                  />
                  <p className="text-center text-gray-700 mt-3">
                    This PIN will be required to log in
                  </p>
                </div>
              </div>

              <div className="flex gap-6 mt-12">
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setNewName('');
                    setNewPin('');
                  }}
                  className="flex-1 px-6 py-4 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || newPin.length !== 4}
                  className="flex-1 px-6 py-4 bg-[#022142] text-white text-xl font-bold rounded-xl hover:bg-[#053f7c] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 glass-backdrop z-60 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🗑️</div>
                <h3 className="text-2xl font-bold text-[#022142]">Delete Staff?</h3>
                <p className="text-gray-700 mt-4">
                  This action <strong>cannot be undone</strong>. The staff member will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-10 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-[#022142] text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}