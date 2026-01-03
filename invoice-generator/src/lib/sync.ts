// src/lib/sync.ts

import { supabase } from './supabase';
import { db } from './db';
import { useCompanyStore } from '../stores/useCompanyStore';

export async function syncToCloud() {
  try {
    // Sync receipts
    const localReceipts = await db.receipts.toArray();
    for (const receipt of localReceipts) {
      const { id, ...data } = receipt; // Remove local ID
      const { error } = await supabase
        .from('receipts')
        .upsert({
          ...data,
          items: data.data?.items || data.items, // Handle structure
          total: data.total,
        }, { onConflict: 'invoice_number' });

      if (error) console.error('Receipt sync error:', error);
    }

    // Sync staff
    const localStaff = await db.staff.toArray();
    for (const staff of localStaff) {
      const { id, ...data } = staff;
      const { error } = await supabase
        .from('staff')
        .upsert(data, { onConflict: 'name' });

      if (error) console.error('Staff sync error:', error);
    }

    // Sync company settings
    const company = useCompanyStore.getState();
    const { error } = await supabase
      .from('company_settings')
      .upsert({
        name: company.name,
        address: company.address,
        phone: company.phone,
        email1: company.email1,
        email2: company.email2,
        logo: company.logo,
      }, { onConflict: 'id' });

    if (error) console.error('Company settings sync error:', error);

    console.log('Sync to cloud complete');
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

export async function syncFromCloud() {
  try {
    // Pull receipts
    const { data: cloudReceipts } = await supabase
      .from('receipts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (cloudReceipts) {
      await db.receipts.bulkPut(cloudReceipts);
    }

    // Pull staff
    const { data: cloudStaff } = await supabase.from('staff').select('*');
    if (cloudStaff) {
      await db.staff.bulkPut(cloudStaff);
    }

    // Pull company settings
    const { data: cloudSettings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (cloudSettings) {
      useCompanyStore.getState().setSettings(cloudSettings);
    }

    console.log('Sync from cloud complete');
  } catch (err) {
    console.error('Pull from cloud failed:', err);
  }
}

export async function fullSync() {
  await syncFromCloud();
  await syncToCloud();
}