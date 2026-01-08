// src/lib/sync.ts

import { supabase } from './supabase';
import { db } from './db';
import { useCompanyStore } from '../stores/useCompanyStore';

export async function syncToCloud() {
  try {
    console.log('Starting sync to cloud...');

    // Sync receipts
    const localReceipts = await db.receipts.toArray();
    if (localReceipts.length > 0) {
      const receiptPayload = localReceipts.map(r => ({
        invoice_number: r.invoiceNumber,
        customer_name: r.customerName,
        phone_number: r.phoneNumber || null,
        date: r.date || new Date().toISOString().split('T')[0],
        payment_mode: r.paymentMode || 'Cash',
        total: r.total,
        sub_total: r.subTotal || 0,
        item_qty: r.itemQty || 0,
        amount_in_words: r.amountInWords || '',
        items: r.items || [],
        data: r.data, // full backup
        generated_by_staff_id: r.generatedByStaffId,
        generated_by_name: r.generatedByName,
        timestamp: r.timestamp,
      }));

      const { error } = await supabase
        .from('receipts')
        .upsert(receiptPayload, { onConflict: 'invoice_number' });

      if (error) console.error('Receipts sync error:', error);
      else console.log(`Synced ${localReceipts.length} receipts to cloud`);
    }

    // Push company settings (only one row, id=1)
    const company = useCompanyStore.getState();
    const { error: settingsError } = await supabase
      .from('company_settings')
      .upsert({
        id: 1,
        name: company.name || 'Octavian Dynamics',
        address: company.address,
        phone: company.phone,
        email1: company.email1,
        email2: company.email2,
        logo: company.logo,
      });

    if (settingsError) console.error('Company settings sync error:', settingsError);

  } catch (err) {
    console.error('Sync to cloud failed:', err);
  }
}

export async function syncFromCloud() {
  try {
    console.log('Pulling data from cloud...');

    // Pull receipts
    const { data: cloudReceipts, error: receiptsError } = await supabase
      .from('receipts')
      .select('*');

    if (receiptsError) console.error('Receipts pull error:', receiptsError);
    else if (cloudReceipts && cloudReceipts.length > 0) {
      await db.receipts.bulkPut(cloudReceipts);
      console.log(`Pulled ${cloudReceipts.length} receipts from cloud`);
    }

    // Pull staff
    const { data: cloudStaff, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) console.error('Staff pull error:', staffError);
    else if (cloudStaff && cloudStaff.length > 0) {
      await db.staff.bulkPut(cloudStaff);
      console.log(`Pulled ${cloudStaff.length} staff from cloud`);
    }

    // Pull company settings
    const { data: cloudSettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Company settings pull error:', settingsError);
    } else if (cloudSettings) {
      useCompanyStore.getState().setSettings({
        name: cloudSettings.name || '',
        address: cloudSettings.address || '',
        phone: cloudSettings.phone || '',
        email1: cloudSettings.email1 || '',
        email2: cloudSettings.email2 || '',
        logo: cloudSettings.logo || '',
      });
      console.log('Company settings synced from cloud');
    }

  } catch (err) {
    console.error('Sync from cloud failed:', err);
  }
}

export async function fullSync() {
  await syncFromCloud(); // Pull first (cloud wins conflicts)
  await syncToCloud();   // Then push local changes
}