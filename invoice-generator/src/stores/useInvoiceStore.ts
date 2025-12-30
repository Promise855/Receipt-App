import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { numberToWords } from '../utils';

const initialState: Invoice = {
  customerName: '',
  phoneNumber: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  paymentMode: 'Cash',

  items: [],
  itemQty: 0,
  subTotal: 0,
  total: 0,
  amountInWords: '',
};

export const useInvoiceStore = create<InvoiceStore>()(
  devtools((set, get) => ({
    ...initialState,

    setCustomerDetails: (data) =>
      set({ customerName: data.customerName, phoneNumber: data.phoneNumber }),

    setInvoiceMeta: (data) =>
      set({
        invoiceNumber: data.invoiceNumber,
        date: data.date,
        paymentMode: data.paymentMode,
      }),

    addItem: () => {
      const state = get();
      const newSn = state.items.length + 1;
      const newItem: Item = {
        id: crypto.randomUUID(),
        sn: newSn,
        name: '',
        description: '',
        details: {},
        qty: 1,
        unitPrice: 0,
        discount: 0,
        amount: 0,
      };
      set({ items: [...state.items, newItem] });
      get().recalculateTotals();
    },

    updateItem: (id, updates) =>
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),

    removeItem: (id) =>
      set((state) => ({
        items: state.items
          .filter((item) => item.id !== id)
          .map((item, index) => ({ ...item, sn: index + 1 })),
      })),

    recalculateTotals: () => {
      const state = get();
      const items = state.items;

      const itemQty = items.reduce((sum, item) => sum + item.qty, 0);
      const subTotal = items.reduce((sum, item) => {
        const lineAmount = item.qty * item.unitPrice * (1 - item.discount / 100);
        return sum + lineAmount;
      }, 0);

      const total = subTotal;
      const words = numberToWords(total);

      set({
        itemQty,
        subTotal: Number(subTotal.toFixed(2)),
        total: Number(total.toFixed(2)),
        amountInWords: words,
      });
    },

    setAmountInWords: (words) => set({ amountInWords: words }),

    resetInvoice: () => set(initialState),
  }))
);