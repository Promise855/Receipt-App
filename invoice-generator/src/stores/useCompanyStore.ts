import { create } from 'zustand';

type CompanySettings = {
  logo: string; // base64 or URL
  address: string;
  phone: string;
  email1: string;
  email2: string;
};

const defaultSettings: CompanySettings = {
  logo: '/img/Octa-logo.png', // fallback to your public logo
  address: '17 Chief Benjamin Wopara Plaza, Ogbum Nagbali, Eastern Bypass, Port Harcourt, Rivers State.',
  phone: '+234 915 574 3615',
  email1: 'octaviandynamics@gmail.com',
  email2: 'contact@Octaviandynamics.com',
};

export const useCompanyStore = create<CompanySettings & {
  setSettings: (settings: Partial<CompanySettings>) => void;
  loadFromStorage: () => void;
}>((set) => ({
  ...defaultSettings,

  loadFromStorage: () => {
    const saved = localStorage.getItem('companySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set(parsed);
      } catch (e) {
        console.error('Failed to load company settings');
      }
    }
  },

  setSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state, ...newSettings };
      localStorage.setItem('companySettings', JSON.stringify(updated));
      return updated;
    });
  },
}));