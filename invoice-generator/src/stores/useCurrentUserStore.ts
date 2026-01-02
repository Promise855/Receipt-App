import { create } from 'zustand';
import { db } from '../lib/db';

type CurrentUser = {
  id: number;
  name: string;
  role: 'cashier' | 'manager';
} | null;

export const useCurrentUserStore = create<{
  currentUser: CurrentUser;
  login: (staff: { id: number; name: string; role: 'cashier' | 'manager' }) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}>((set) => ({
  currentUser: null,

  login: (staff) => {
    set({ currentUser: staff });
    localStorage.setItem('currentUserId', String(staff.id));
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('currentUserId');
  },

  loadFromStorage: async () => {
    const savedId = localStorage.getItem('currentUserId');
    if (savedId) {
      const staff = await db.staff.get(Number(savedId));
      if (staff) {
        set({ currentUser: { id: staff.id!, name: staff.name, role: staff.role } });
      }
    }
  },
}));