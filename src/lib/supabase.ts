import { createClient } from '@supabase/supabase-js';

// Mengambil variabel lingkungan dari .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Inisialisasi Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
