import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("🧪 Mencoba Insert Single Item...");

  // Ambil 1 transaksi dan 1 produk yang baru saja dibuat
  const { data: trans } = await supabase.from("transactions").select("id").limit(1).single();
  const { data: prod } = await supabase.from("products").select("id").limit(1).single();

  if (!trans || !prod) {
    console.log("❌ Tidak ada transaksi atau produk untuk dites.");
    return;
  }

  console.log(`- Pakai TransID: ${trans.id}`);
  console.log(`- Pakai ProdID: ${prod.id}`);

  const testItem = {
    transaction_id: trans.id,
    product_id: prod.id,
    quantity: 1,
    subtotal: 5000
  };

  const { error } = await supabase.from("transaction_items").insert(testItem);

  if (error) {
    console.error("❌ ERROR INSERT ITEM:", error);
  } else {
    console.log("✅ Berhasil Insert Item! Nama kolom sudah benar.");
  }
}

testInsert();
