// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvmwftoccsbbsodjpusu.supabase.co';
const supabaseAnonKey = 'sb_publishable_vNXGHLWY4b8T0v9Av5K7TQ_HgBm0eHI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);