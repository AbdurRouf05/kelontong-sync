"use server";

import { supabase } from "@/lib/supabase";

export async function getDashboardStats() {
  const { data: transactions, error: transError } = await supabase
    .from("transactions")
    .select("total_amount, created_at");

  if (transError) throw transError;

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("stock, min_stock");

  if (prodError) throw prodError;

  // Calculate metrics
  const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions?.filter(t => t.created_at.startsWith(today)).length || 0;
  
  const lowStockCount = products?.filter(p => p.stock <= p.min_stock).length || 0;

  return {
    totalSales,
    todayTransactions,
    lowStockCount,
    totalProducts: products?.length || 0
  };
}

export async function getRecentTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      created_at,
      total_amount,
      profiles (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  return data.map(t => ({
    id: t.id,
    time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: `Transaksi oleh ${t.profiles?.[0]?.full_name || 'Kasir'}`,
    amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(t.total_amount)),
    status: "BERHASIL",
    statusColor: "text-green-600"
  }));
}

export async function getSalesData() {
  const { data, error } = await supabase
    .from("transactions")
    .select("total_amount, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group by day for the last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const grouped = last7Days.map(date => {
    const daySales = data
      ?.filter(t => t.created_at.startsWith(date))
      .reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    
    const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
    return { name: dayName, sales: daySales };
  });

  return grouped;
}

export async function getTopProducts() {
  const { data, error } = await supabase
    .from("transaction_items")
    .select(`
      quantity,
      products (name, category_id)
    `);

  if (error) throw error;

  // Manual aggregation because Supabase join grouping is tricky with basic client
  const aggregation: Record<string, { name: string, sales: number }> = {};
  
  data?.forEach(item => {
    const productName = item.products?.[0]?.name || "Produk Tak Dikenal";
    if (!aggregation[productName]) {
      aggregation[productName] = { name: productName, sales: 0 };
    }
    aggregation[productName].sales += item.quantity;
  });

  return Object.values(aggregation)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)
    .map((p, i) => ({
      ...p,
      category: "Umum", // Could join category if needed
      stock: 0, // Placeholder
      color: ["bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400"][i % 4]
    }));
}
