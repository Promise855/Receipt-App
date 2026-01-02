import Dexie from 'dexie';

export interface Staff {
  id?: number;
  name: string;
  pinHash: string; // Hashed 4-digit PIN (required)
  role: 'cashier' | 'manager';
  createdAt: string;
}

export interface Receipt {
  id?: number;
  data: any; // Full invoice state
  timestamp: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  generatedByStaffId?: number; // Who generated it
  generatedByName?: string;
}

export class ReceiptDatabase extends Dexie {
  receipts!: Dexie.Table<Receipt>;
  staff!: Dexie.Table<Staff>;

  constructor() {
    super('OctavianInvoiceDB');

    this.version(2).stores({
      receipts: '++id, timestamp, invoiceNumber, customerName, total, generatedByStaffId',
      staff: '++id, name, role',
    });

    // Migration for existing receipts (add generatedByStaffId)
    this.version(2).upgrade(async (tx) => {
      await tx
        .table('receipts')
        .toCollection()
        .modify((receipt: any) => {
          if (!('generatedByStaffId' in receipt)) {
            receipt.generatedByStaffId = null;
            receipt.generatedByName = null;
          }
        });
    });
  }
}

export const db = new ReceiptDatabase();