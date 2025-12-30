import Dexie from 'dexie'; // ← Import default Dexie

export interface Receipt {
  id?: number;
  data: any;
  timestamp: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
}

export class ReceiptDatabase extends Dexie {
  receipts: Dexie.Table<Receipt, number>;

  constructor() {
    super('OctavianInvoiceDB');
    this.version(1).stores({
      receipts: '++id, timestamp, invoiceNumber, customerName, total',
    });
  }
}

export const db = new ReceiptDatabase();