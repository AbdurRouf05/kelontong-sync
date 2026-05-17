"use server";

import { createClient } from "@supabase/supabase-js";

// Buat Admin Client untuk bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Script Seeding v2 (Multi-Branch & SaaS)
 * Mengisi 1 Bisnis dengan 3 Cabang, Katalog Produk Global, 
 * dan Stok yang berbeda di setiap cabang.
 */
export async function seedDatabase() {
  console.log("🚀 Memulai proses seeding SaaS Multi-Branch...");

  try {
    // 1. Dapatkan User ID dari argumen terminal atau auth
    let adminId = process.argv.find(arg => arg.startsWith('--user-id='))?.split('=')[1];
    
    if (!adminId) {
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      adminId = user?.id;
    }

    if (!adminId) {
      throw new Error("Anda harus memberikan User ID (UID Supabase) melalui --user-id=XYZ atau login terlebih dahulu.");
    }
    
    console.log(`👤 Menggunakan Admin ID: ${adminId}`);

    // 2. Bersihkan data lama (Urutan penting!)
    console.log("🧹 Membersihkan data lama...");
    const tables = ['transaction_items', 'transactions', 'product_stocks', 'products', 'categories', 'profiles', 'stores', 'businesses'];
    for (const table of tables) {
      await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // 3. Buat Bisnis Utama
    console.log("🏢 Membuat entitas Bisnis...");
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .insert({ name: "Kelontong Berkah Group", owner_id: adminId })
      .select()
      .single();
    if (bizError) throw bizError;

    // 4. Buat 3 Cabang (Stores)
    console.log("🏪 Membuat 3 cabang...");
    const branches = [
      { business_id: business.id, name: "Cabang Jakarta Pusat", address: "Jl. Sudirman No. 1" },
      { business_id: business.id, name: "Cabang Depok", address: "Jl. Margonda Raya No. 10" },
      { business_id: business.id, name: "Cabang Bekasi", address: "Jl. Ahmad Yani No. 5" }
    ];
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert(branches)
      .select();
    if (storeError) throw storeError;

    // 5. Update Profil Admin (Owner)
    console.log("👤 Mengatur profil Owner...");
    await supabaseAdmin.from('profiles').insert({
      id: adminId,
      business_id: business.id,
      current_store_id: storeData[0].id,
      full_name: "Juragan Kelontong",
      role: "owner"
    });

    // 6. Buat Kategori Global
    console.log("🗂️ Membuat kategori global...");
    const categoryMocks = [
      { name: "Makanan", icon: "🍕", business_id: business.id },
      { name: "Minuman", icon: "🥤", business_id: business.id },
      { name: "Snack", icon: "🍙", business_id: business.id },
      { name: "Sembako", icon: "🍚", business_id: business.id }
    ];
    const { data: catData, error: catError } = await supabaseAdmin.from('categories').insert(categoryMocks).select();
    if (catError) throw catError;

    // 7. Buat 50 Produk Katalog (Global)
    console.log("📦 Membuat katalog produk global...");
    const productTemplates = [
      { name: "Indomie Goreng", category: "Makanan", price: 3500, cost: 2800 },
      { name: "Aqua 600ml", category: "Minuman", price: 4000, cost: 3000 },
      { name: "Chitato", category: "Snack", price: 12000, cost: 9500 },
      { name: "Beras 5kg", category: "Sembako", price: 75000, cost: 68000 }
    ];

    const productInserts = [];
    for (let i = 1; i <= 50; i++) {
      const temp = productTemplates[i % productTemplates.length];
      const cat = catData.find(c => c.name === temp.category);
      productInserts.push({
        business_id: business.id,
        category_id: cat?.id,
        name: `${temp.name} #${i}`,
        barcode: `899${Math.floor(100000000 + Math.random() * 900000000)}`,
        cost_price: temp.cost,
        selling_price: temp.price
      });
    }
    const { data: products, error: prodError } = await supabaseAdmin.from('products').insert(productInserts).select();
    if (prodError) throw prodError;

    // 8. Buat Stok Berbeda di Setiap Cabang
    console.log("📈 Mendistribusikan stok ke setiap cabang...");
    const stockInserts = [];
    for (const store of storeData) {
      for (const product of products) {
        stockInserts.push({
          product_id: product.id,
          store_id: store.id,
          stock: Math.floor(Math.random() * 50) + 5,
          min_stock: 5
        });
      }
    }
    await supabaseAdmin.from('product_stocks').insert(stockInserts);

    // 9. Buat Transaksi di 3 Cabang
    console.log("💰 Membuat riwayat transaksi di semua cabang...");
    const transInserts = [];
    const itemInserts = [];

    for (const store of storeData) {
      // 30 transaksi per cabang
      for (let k = 0; k < 30; k++) {
        const transId = crypto.randomUUID();
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        let total = 0;
        const numItems = Math.floor(Math.random() * 3) + 1;
        for (let m = 0; m < numItems; m++) {
          const prod = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          const sub = prod.selling_price * qty;
          total += sub;
          itemInserts.push({
            transaction_id: transId,
            product_id: prod.id,
            quantity: qty,
            unit_price: prod.selling_price,
            subtotal: sub,
            created_at: date.toISOString()
          });
        }

        transInserts.push({
          id: transId,
          business_id: business.id,
          store_id: store.id,
          cashier_id: adminId,
          total_amount: total,
          payment_amount: total,
          payment_method: "CASH",
          created_at: date.toISOString()
        });
      }
    }

    await supabaseAdmin.from('transactions').insert(transInserts);
    await supabaseAdmin.from('transaction_items').insert(itemInserts);

    console.log("✅ Seeding Berhasil! 1 Bisnis, 3 Cabang, dan 50 Produk telah siap.");
    return { success: true };

  } catch (err: any) {
    console.error("❌ Seeding Gagal:", err.message);
    return { success: false, error: err.message };
  }
}
