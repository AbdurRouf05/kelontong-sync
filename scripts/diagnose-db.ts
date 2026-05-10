import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("🔍 Memulai Diagnosa Database...");

  // 1. Cek Transaction Items
  const { data: items, error: err1 } = await supabase
    .from("transaction_items")
    .select("*, products(*, categories(*))")
    .limit(1);

  if (err1) {
    console.error("❌ Error query items:", err1);
  } else {
    console.log("✅ Sample Item Data:", JSON.stringify(items, null, 2));
  }

  // 2. Cek Counts
  const { count: prodCount } = await supabase.from("products").select("*", { count: 'exact', head: true });
  const { count: transCount } = await supabase.from("transactions").select("*", { count: 'exact', head: true });
  const { count: itemCount } = await supabase.from("transaction_items").select("*", { count: 'exact', head: true });

  console.log(`📊 Statistik Database:`);
  console.log(`- Produk: ${prodCount}`);
  console.log(`- Transaksi: ${transCount}`);
  console.log(`- Item Transaksi: ${itemCount}`);
}

diagnose();
