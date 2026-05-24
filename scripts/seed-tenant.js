const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

// Manual env parsing
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUSINESS_ID = "d55960e7-9b2e-43db-9fc1-6b31eda95298";
const STORE_ID = "88eed4ec-65b7-4740-b940-66ad578a5ac7";
const OWNER_ID = "f292b776-690e-4d28-836a-aa2bc12ddef0";

const productTemplates = [
  // Sembako
  { name: "Beras Pandan Wangi 5kg", category: "Sembako", price: 78000, cost: 68000 },
  { name: "Minyak Goreng Filma 2L", category: "Sembako", price: 38000, cost: 33000 },
  { name: "Gula Pasir Gulaku 1kg", category: "Sembako", price: 16500, cost: 14000 },
  { name: "Tepung Terigu Segitiga Biru 1kg", category: "Sembako", price: 13500, cost: 11000 },
  { name: "Telur Ayam Negeri 1kg", category: "Sembako", price: 28000, cost: 24000 },
  { name: "Kecap Manis Bango 520ml", category: "Sembako", price: 22000, cost: 18500 },
  { name: "Saus Sambal ABC 335ml", category: "Sembako", price: 15000, cost: 12500 },
  { name: "Garam Dapur Refina 250g", category: "Sembako", price: 3000, cost: 2000 },
  { name: "Blue Band Margarin 200g", category: "Sembako", price: 9500, cost: 7500 },
  { name: "Susu Kental Manis Frisian Flag 370g", category: "Sembako", price: 12500, cost: 10000 },

  // Minuman
  { name: "Aqua Air Mineral 600ml", category: "Minuman", price: 4000, cost: 2500 },
  { name: "Teh Botol Sosro 450ml", category: "Minuman", price: 6000, cost: 4200 },
  { name: "Coca-Cola 390ml", category: "Minuman", price: 5500, cost: 4000 },
  { name: "Pocari Sweat 500ml", category: "Minuman", price: 8500, cost: 6800 },
  { name: "Kopi Kapal Api Mantap 165g", category: "Minuman", price: 14500, cost: 12000 },
  { name: "Milo UHT 190ml", category: "Minuman", price: 6500, cost: 5000 },
  { name: "Teh Kotak Sosro 300ml", category: "Minuman", price: 4500, cost: 3200 },
  { name: "Kratingdaeng 150ml", category: "Minuman", price: 7500, cost: 6000 },
  { name: "Yakult isi 5 pcs", category: "Minuman", price: 10500, cost: 9000 },
  { name: "Floridina Orange 350ml", category: "Minuman", price: 3500, cost: 2200 },
  { name: "Indomilk Cokelat 190ml", category: "Minuman", price: 5500, cost: 4200 },
  { name: "Fanta Strawberry 390ml", category: "Minuman", price: 5500, cost: 4000 },
  { name: "Sprite 390ml", category: "Minuman", price: 5500, cost: 4000 },
  { name: "Pulpy Orange 350ml", category: "Minuman", price: 7000, cost: 5500 },
  { name: "Luwak White Koffie Pack isi 10", category: "Minuman", price: 13500, cost: 11000 },

  // Snack / Makanan Ringan
  { name: "Chitato Sapi Panggang 68g", category: "Snack", price: 12500, cost: 9800 },
  { name: "Taro Net Seaweed 36g", category: "Snack", price: 5500, cost: 4000 },
  { name: "Kusuka Keripik Singkong 180g", category: "Snack", price: 17500, cost: 14200 },
  { name: "Oreo Double Stuff 137g", category: "Snack", price: 9500, cost: 7600 },
  { name: "SilverQueen Almond 58g", category: "Snack", price: 16500, cost: 13000 },
  { name: "Beng-Beng Share It Pack isi 10", category: "Snack", price: 12000, cost: 9500 },
  { name: "Pringles Potato Crisps 107g", category: "Snack", price: 22000, cost: 18000 },
  { name: "Piattos Sapi Panggang 75g", category: "Snack", price: 10500, cost: 8200 },
  { name: "Roma Kelapa Biskuit 300g", category: "Snack", price: 11500, cost: 9000 },
  { name: "Khong Guan Biscuit Mini 650g", category: "Snack", price: 52000, cost: 44000 },
  { name: "Fitbar Chocolate 22g", category: "Snack", price: 6500, cost: 5000 },
  { name: "Roma Malkist Abon 135g", category: "Snack", price: 7500, cost: 5800 },
  { name: "Nextar Nastar 112g", category: "Snack", price: 8000, cost: 6200 },
  { name: "Lays Rumput Laut 55g", category: "Snack", price: 11500, cost: 9000 },

  // Makanan Instan & Lauk
  { name: "Indomie Goreng Spesial 85g", category: "Makanan", price: 3500, cost: 2800 },
  { name: "Indomie Kuah Kari Ayam 72g", category: "Makanan", price: 3300, cost: 2600 },
  { name: "Mie Sedaap Goreng 90g", category: "Makanan", price: 3400, cost: 2750 },
  { name: "Pop Mie Bakso 75g", category: "Makanan", price: 5500, cost: 4200 },
  { name: "Sarden ABC Tomat 155g", category: "Makanan", price: 11500, cost: 9200 },
  { name: "Kornet Sapi Pronas 190g", category: "Makanan", price: 24000, cost: 19800 },
  { name: "Bubur Instan Super Bubur 45g", category: "Makanan", price: 4500, cost: 3200 },
  { name: "Sarimi Isi 2 Baso Sapi 125g", category: "Makanan", price: 4800, cost: 3800 },
  { name: "Samyang Hot Chicken Ramen 140g", category: "Makanan", price: 21000, cost: 17500 },
  { name: "Abon Sapi Gloria 100g", category: "Makanan", price: 32000, cost: 27000 },
  { name: "Keju Kraft Cheddar 165g", category: "Makanan", price: 23500, cost: 19000 }
];

async function seed() {
  console.log("🚀 Starting seed process for toko goonmal...");

  try {
    // 1. Delete existing details associated with this business (cascaded by RLS bypass)
    console.log("🧹 Clearing old products and categories data...");
    
    // Clear transaction items
    const { data: oldTransactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('store_id', STORE_ID);

    if (oldTransactions && oldTransactions.length > 0) {
      const oldTrxIds = oldTransactions.map(t => t.id);
      await supabase.from('transaction_items').delete().in('transaction_id', oldTrxIds);
      await supabase.from('transactions').delete().in('id', oldTrxIds);
    }

    // Clear stocks
    await supabase.from('product_stocks').delete().eq('store_id', STORE_ID);

    // Clear products
    await supabase.from('products').delete().eq('business_id', BUSINESS_ID);

    // Clear categories
    await supabase.from('categories').delete().eq('business_id', BUSINESS_ID);

    console.log("✨ Cleaned successfully!");

    // 2. Insert Categories
    console.log("🗂️ Creating categories...");
    const categoriesToInsert = [
      { name: "Makanan", icon: "🍕", business_id: BUSINESS_ID },
      { name: "Minuman", icon: "🥤", business_id: BUSINESS_ID },
      { name: "Snack", icon: "🍙", business_id: BUSINESS_ID },
      { name: "Sembako", icon: "🍚", business_id: BUSINESS_ID }
    ];

    const { data: insertedCategories, error: catErr } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (catErr) throw catErr;
    console.log(`✅ Created ${insertedCategories.length} categories.`);

    // Map category name to ID
    const catMap = {};
    insertedCategories.forEach(c => {
      catMap[c.name] = c.id;
    });

    // 3. Insert 50 Products
    console.log("📦 Creating 50 kelontong products...");
    const productsToInsert = productTemplates.map((p, i) => {
      const catId = catMap[p.category] || insertedCategories[0].id;
      return {
        business_id: BUSINESS_ID,
        category_id: catId,
        name: p.name,
        barcode: `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        cost_price: p.cost,
        selling_price: p.price,
        image_url: null
      };
    });

    const { data: insertedProducts, error: prodErr } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();

    if (prodErr) throw prodErr;
    console.log(`✅ Created ${insertedProducts.length} products.`);

    // 4. Create Product Stocks
    console.log("📈 Seeding generous branch stock...");
    const stocksToInsert = insertedProducts.map(p => {
      return {
        product_id: p.id,
        store_id: STORE_ID,
        stock: Math.floor(Math.random() * 150) + 50, // 50 to 200 items
        min_stock: 10
      };
    });

    const { error: stockErr } = await supabase
      .from('product_stocks')
      .insert(stocksToInsert);

    if (stockErr) throw stockErr;
    console.log("✅ Created product stocks successfully.");

    // 5. Create Realistic Transactions & Transaction Items
    console.log("💰 Seeding 30-day realistic transactions history...");
    const transInserts = [];
    const itemInserts = [];

    // Let's generate 60 transactions spread over 30 days
    for (let k = 0; k < 60; k++) {
      const transId = crypto.randomUUID();
      
      // Distribute dates nicely over the last 30 days
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - Math.floor(k / 2));
      dateObj.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0); // Open between 08:00 and 20:00

      let total = 0;
      const numItems = Math.floor(Math.random() * 4) + 1; // 1 to 4 items per transaction
      
      // Shuffle products to get unique items per transaction
      const shuffledProds = [...insertedProducts].sort(() => 0.5 - Math.random());
      
      for (let m = 0; m < numItems; m++) {
        const prod = shuffledProds[m];
        const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
        const sub = prod.selling_price * qty;
        total += sub;

        itemInserts.push({
          transaction_id: transId,
          product_id: prod.id,
          quantity: qty,
          unit_price: prod.selling_price,
          subtotal: sub,
          created_at: dateObj.toISOString()
        });
      }

      transInserts.push({
        id: transId,
        business_id: BUSINESS_ID,
        store_id: STORE_ID,
        cashier_id: OWNER_ID,
        total_amount: total,
        payment_amount: total + (Math.random() > 0.5 ? 5000 : 0), // exact cash or slight overpay
        payment_method: Math.random() > 0.3 ? "CASH" : "QRIS",
        created_at: dateObj.toISOString()
      });
    }

    // Insert transactions in chunks if necessary, but 60 is perfectly small
    const { error: trxErr } = await supabase.from('transactions').insert(transInserts);
    if (trxErr) throw trxErr;

    const { error: itemErr } = await supabase.from('transaction_items').insert(itemInserts);
    if (itemErr) throw itemErr;

    console.log(`✅ Seeded ${transInserts.length} transactions and ${itemInserts.length} transaction items.`);
    console.log("🎉 Seeding completed successfully for Akmal's business (toko goonmal)!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}

seed();
