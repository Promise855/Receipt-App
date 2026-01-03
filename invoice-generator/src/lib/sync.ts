// src/lib/sync.ts

import { supabase } from './supabase';
import { db } from './db';
import { useCompanyStore } from '../stores/useCompanyStore';

/**
 * Sync local data to Supabase cloud (upload)
 */
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
        items: r.data?.items || r.items || [],
        generated_by_staff_id: r.generatedByStaffId,
        generated_by_name: r.generatedByName,
        timestamp: r.timestamp,
      }));

      const { error } = await supabase
        .from('receipts')
        .upsert(receiptPayload, { onConflict: 'invoice_number' });

      if (error) {
        console.error('Receipts sync to cloud failed:', error);
      } else {
        console.log(`Synced ${localReceipts.length} receipts to cloud`);
      }
    }

    // Sync staff
    const localStaff = await db.staff.toArray();
    if (localStaff.length > 0) {
      const staffPayload = localStaff.map(s => ({
        name: s.name,
        pin_hash: s.pinHash,
        role: s.role,
        created_at: s.createdAt,
      }));

      const { error } = await supabase
        .from('staff')
        .upsert(staffPayload, { onConflict: 'name' });

      if (error) {
        console.error('Staff sync to cloud failed:', error);
      } else {
        console.log(`Synced ${localStaff.length} staff members to cloud`);
      }
    }

    // Sync company settings
    const companyState = useCompanyStore.getState();
    const { error: settingsError } = await supabase
      .from('company_settings')
      .upsert({
        name: companyState.name,
        address: companyState.address,
        phone: companyState.phone,
        email1: companyState.email1,
        email2: companyState.email2,
        logo: companyState.logo,
      }, { onConflict: 'id' });

    if (settingsError) {
      console.error('Company settings sync failed:', settingsError);
    } else {
      console.log('Company settings synced to cloud');
    }

  } catch (err) {
    console.error('Sync to cloud failed:', err);
  }
}

/**
 * Pull latest data from Supabase cloud to local DB
 */
export async function syncFromCloud() {
  try {
    console.log('Starting sync from cloud...');

    // Pull receipts
    const { data: cloudReceipts, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (receiptsError) {
      console.error('Error pulling receipts:', receiptsError);
    } else if (cloudReceipts && cloudReceipts.length > 0) {
      await db.receipts.bulkPut(cloudReceipts);
      console.log(`Pulled ${cloudReceipts.length} receipts from cloud`);
    }

    // Pull staff
    const { data: cloudStaff, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('Error pulling staff:', staffError);
    } else if (cloudStaff && cloudStaff.length > 0) {
      await db.staff.bulkPut(cloudStaff);
      console.log(`Pulled ${cloudStaff.length} staff members from cloud`);
    }

    // Pull company settings
    const { data: cloudSettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = no row
      console.error('Error pulling company settings:', settingsError);
    } else if (cloudSettings) {
      useCompanyStore.getState().setSettings({
        name: cloudSettings.name,
        address: cloudSettings.address || '',
        phone: cloudSettings.phone || '',
        email1: cloudSettings.email1 || '',
        email2: cloudSettings.email2 || '',
        logo: cloudSettings.logo || '',
      });
      console.log('Company settings pulled from cloud');
    }

  } catch (err) {
    console.error('Sync from cloud failed:', err);
  }
}

/**
 * Full bidirectional sync
 */
export async function fullSync() {
  await syncFromCloud(); // Pull latest from cloud first
  await syncToCloud();   // Then push local changes
}