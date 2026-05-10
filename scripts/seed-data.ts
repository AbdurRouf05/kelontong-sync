import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { name: "Makanan", icon: "🍜" },
  { name: "Minuman", icon: "🥤" },
  { name: "Sembako", icon: "🍚" },
  { name: "Rokok", icon: "🚬" },
  { name: "Snack", icon: "🍿" },
  { name: "Alat Tulis", icon: "✏️" },
  { name: "Sabun & Shampoo", icon: "🧼" },
  { name: "Kebutuhan Rumah", icon: "🏠" }
];

async function seed() {
  try {
    console.log("🧹 Step 1: Membersihkan data lama...");
    await supabase.from("transaction_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("📂 Step 2: Membuat kategori baru...");
    const { data: createdCategories, error: catErr } = await supabase
      .from("categories")
      .insert(CATEGORIES)
      .select();

    if (catErr) throw catErr;

    console.log("📦 Step 3: Membuat 100 produk variatif...");
    const productsToInsert = [];
    const productTemplates = [
      { name: "Indomie Goreng", cat: "Makanan", buy: 2800, sell: 3500 },
      { name: "Teh Botol Sosro 450ml", cat: "Minuman", buy: 4500, sell: 6000 },
      { name: "Beras Maknyus 5kg", cat: "Sembako", buy: 65000, sell: 75000 },
      { name: "Sampoerna Mild 16", cat: "Rokok", buy: 32000, sell: 35000 },
      { name: "Chitato Sapi Panggang", cat: "Snack", buy: 9500, sell: 12000 },
      { name: "Lifebuoy Merah 80g", cat: "Sabun & Shampoo", buy: 4000, sell: 5500 },
      { name: "Buku Tulis Sinar Dunia", cat: "Alat Tulis", buy: 3500, sell: 5000 }
    ];

    for (let i = 1; i <= 100; i++) {
      const template = productTemplates[i % productTemplates.length];
      const category = createdCategories.find(c => c.name === template.cat);
      productsToInsert.push({
        name: `${template.name} #${i}`,
        barcode: `899${Date.now()}${i}`,
        category_id: category?.id,
        cost_price: template.buy,
        selling_price: template.sell,
        stock: 999,
        min_stock: 10
      });
    }

    const { data: createdProducts, error: prodErr } = await supabase.from("products").insert(productsToInsert).select();
    if (prodErr) throw prodErr;

    console.log("💰 Step 4: Membuat data transaksi...");
    const transactionsToInsert = [];
    const now = new Date();
    for (let i = 0; i < 300; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dailyCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < dailyCount; j++) {
        const transDate = new Date(date);
        transDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
        transactionsToInsert.push({
          total_amount: 0,
          created_at: transDate.toISOString()
        });
      }
    }

    const { data: createdTransactions, error: transErr } = await supabase.from("transactions").insert(transactionsToInsert).select();
    if (transErr) throw transErr;

    console.log("📝 Step 5: Menghubungkan item transaksi (dengan unit_price)...");
    const itemsToInsert = [];
    const transUpdates = [];

    for (const trans of createdTransactions) {
      let total = 0;
      const itemCount = Math.floor(Math.random() * 2) + 1;
      for (let k = 0; k < itemCount; k++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const qty = 1;
        const price = product.selling_price;
        const subtotal = price * qty;
        total += subtotal;
        itemsToInsert.push({
          transaction_id: trans.id,
          product_id: product.id,
          quantity: qty,
          unit_price: price, // TAMBAHKAN KOLOM INI AGAR TIDAK ERROR
          subtotal: subtotal,
          created_at: trans.created_at
        });
      }
      transUpdates.push({ id: trans.id, total_amount: total, created_at: trans.created_at });
    }

    console.log("🚀 Step 6: Finalizing database...");
    await supabase.from("transactions").upsert(transUpdates);
    
    // Chunk insert items
    for (let i = 0; i < itemsToInsert.length; i += 500) {
      const { error } = await supabase.from("transaction_items").insert(itemsToInsert.slice(i, i + 500));
      if (error) console.error("Chunk Insert Error:", error);
    }

    console.log("✅ Seeding SELESAI!");
    console.log(`- 100 Produk Aktif`);
    console.log(`- ${createdTransactions.length} Transaksi Berhasil Dimasukkan`);
    
  } catch (err) {
    console.error("❌ ERROR UTAMA SEEDING:", err);
  }
}

seed();
