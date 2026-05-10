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
  console.log("🧹 Membersihkan data lama...");
  await supabase.from("transaction_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("📂 Membuat kategori baru...");
  const { data: createdCategories } = await supabase
    .from("categories")
    .insert(CATEGORIES)
    .select();

  if (!createdCategories) return;

  console.log("📦 Membuat 100 produk variatif...");
  const productsToInsert = [];
  const productTemplates = [
    { name: "Indomie Goreng", cat: "Makanan", buy: 2800, sell: 3500 },
    { name: "Indomie Ayam Bawang", cat: "Makanan", buy: 2700, sell: 3300 },
    { name: "Sedaap Goreng", cat: "Makanan", buy: 2700, sell: 3300 },
    { name: "Teh Botol Sosro 450ml", cat: "Minuman", buy: 4500, sell: 6000 },
    { name: "Aqua 600ml", cat: "Minuman", buy: 2500, sell: 4000 },
    { name: "Pocari Sweat 500ml", cat: "Minuman", buy: 6500, sell: 8500 },
    { name: "Beras Maknyus 5kg", cat: "Sembako", buy: 65000, sell: 75000 },
    { name: "Minyak Goreng Bimoli 2L", cat: "Sembako", buy: 32000, sell: 38000 },
    { name: "Gula Gulaku 1kg", cat: "Sembako", buy: 15000, sell: 18000 },
    { name: "Sampoerna Mild 16", cat: "Rokok", buy: 32000, sell: 35000 },
    { name: "Gudang Garam Filter 12", cat: "Rokok", buy: 22000, sell: 25000 },
    { name: "Chitato Sapi Panggang", cat: "Snack", buy: 9500, sell: 12000 },
    { name: "Qtela Singkong", cat: "Snack", buy: 4500, sell: 6000 },
    { name: "Lifebuoy Merah 80g", cat: "Sabun & Shampoo", buy: 4000, sell: 5500 },
    { name: "Lifebuoy Shampoo 170ml", cat: "Sabun & Shampoo", buy: 18000, sell: 22000 },
    { name: "Pepsodent 190g", cat: "Sabun & Shampoo", buy: 12000, sell: 15000 },
    { name: "Buku Tulis Sinar Dunia", cat: "Alat Tulis", buy: 3500, sell: 5000 },
    { name: "Sapu Ijuk", cat: "Kebutuhan Rumah", buy: 15000, sell: 20000 }
  ];

  for (let i = 1; i <= 100; i++) {
    const template = productTemplates[i % productTemplates.length];
    const category = createdCategories.find(c => c.name === template.cat);
    
    productsToInsert.push({
      name: `${template.name} #${i}`,
      barcode: `899${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
      category_id: category?.id,
      buy_price: template.buy,
      sell_price: template.sell,
      stock: 100 + Math.floor(Math.random() * 500),
      min_stock: 10,
      store_id: null // Assume global for now or pick a store if exists
    });
  }

  const { data: createdProducts } = await supabase.from("products").insert(productsToInsert).select();
  if (!createdProducts) return;

  console.log("💰 Menghasilkan ribuan transaksi (Tahun ini, Bulan ini, Minggu ini, Hari ini)...");
  
  const transactionsToInsert = [];
  const now = new Date();
  
  // Seed dates: Last 300 days
  for (let i = 0; i < 300; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Number of transactions per day (random 1-5)
    const dailyCount = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < dailyCount; j++) {
      const hour = Math.floor(Math.random() * 12) + 8; // 08:00 to 20:00
      date.setHours(hour, Math.floor(Math.random() * 60));
      
      transactionsToInsert.push({
        total_amount: 0, // Will update after items
        created_at: date.toISOString(),
        store_id: null
      });
    }
  }

  const { data: createdTransactions } = await supabase.from("transactions").insert(transactionsToInsert).select();
  if (!createdTransactions) return;

  console.log("📝 Menghubungkan item transaksi...");
  const itemsToInsert = [];
  
  for (const trans of createdTransactions) {
    let total = 0;
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    for (let k = 0; k < itemCount; k++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const subtotal = product.sell_price * qty;
      total += subtotal;
      
      itemsToInsert.push({
        transaction_id: trans.id,
        product_id: product.id,
        quantity: qty,
        subtotal: subtotal,
        created_at: trans.created_at
      });
    }
    
    // Update total_amount in transactions
    await supabase.from("transactions").update({ total_amount: total }).eq("id", trans.id);
  }

  // Chunk items insert if too many
  const chunkSize = 500;
  for (let i = 0; i < itemsToInsert.length; i += chunkSize) {
    await supabase.from("transaction_items").insert(itemsToInsert.slice(i, i + chunkSize));
  }

  console.log("✅ Seeding SELESAI!");
  console.log(`- 100 Produk Berhasil Dibuat`);
  console.log(`- ${createdTransactions.length} Transaksi Berhasil Dibuat`);
}

seed();
