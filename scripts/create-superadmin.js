const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const EMAIL = 'superadmin@kelontongsync.com';
  const PASSWORD = 'SuperAdmin123!';

  console.log('🔍 Memverifikasi tabel database...');

  // Verify tables exist
  const tables = ['businesses', 'stores', 'profiles', 'categories', 'products', 'product_stocks', 'transactions', 'transaction_items', 'stock_logs', 'store_settings'];
  for (const table of tables) {
    const { count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ Tabel ${table}: GAGAL (${error.message})`);
      return;
    }
    console.log(`  ✅ ${table}: OK (${count} baris)`);
  }

  console.log('\n👤 Membuat akun Super Admin...');
  console.log(`  Email: ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);

  // 1. Create auth user
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true
  });

  if (authError) {
    console.error('❌ Gagal membuat auth user:', authError.message);
    return;
  }

  console.log(`  ✅ Auth user berhasil dibuat (ID: ${authUser.user.id})`);

  // 2. Create profile with role 'superadmin' (no business_id, no store)
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authUser.user.id,
    business_id: null,
    current_store_id: null,
    full_name: 'Super Admin',
    role: 'superadmin'
  });

  if (profileError) {
    console.error('❌ Gagal membuat profil superadmin:', profileError.message);
    return;
  }

  console.log('  ✅ Profil superadmin berhasil dibuat di tabel profiles');

  console.log('\n' + '='.repeat(50));
  console.log('🎉 AKUN SUPER ADMIN BERHASIL DIBUAT!');
  console.log('='.repeat(50));
  console.log(`  📧 Email    : ${EMAIL}`);
  console.log(`  🔑 Password : ${PASSWORD}`);
  console.log(`  🌐 Login di : /admin`);
  console.log('='.repeat(50));
}

main();
