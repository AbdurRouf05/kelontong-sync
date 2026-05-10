"use server";

import { supabase } from "@/lib/supabase";

/**
 * Utility untuk mendapatkan tanggal mulai berdasarkan periode
 */
function getStartDate(period: string) {
  const now = new Date();
  const start = new Date();
  
  if (period === "daily") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  } else {
    return null; // Semua waktu
  }
  return start.toISOString();
}

export async function getDashboardStats(period: string = "all") {
  const startDate = getStartDate(period);
  let query = supabase.from("transactions").select("total_amount, created_at");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data: transactions, error: transError } = await query;

  if (transError) {
    console.error("Error fetching transactions:", transError);
    return { totalSales: 0, todayTransactions: 0, lowStockCount: 0, totalProducts: 0 };
  }

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("stock, min_stock");

  if (prodError) {
    console.error("Error fetching products:", prodError);
    return { totalSales: 0, todayTransactions: 0, lowStockCount: 0, totalProducts: 0 };
  }

  const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  const transactionCount = transactions?.length || 0;
  const lowStockCount = products?.filter(p => p.stock <= (p.min_stock || 0)).length || 0;

  return {
    totalSales,
    todayTransactions: transactionCount,
    lowStockCount,
    totalProducts: products?.length || 0
  };
}

export async function getRecentTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, created_at, total_amount")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }

  return data.map(t => ({
    id: t.id,
    time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: `Transaksi Selesai`,
    amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(t.total_amount)),
    status: "BERHASIL",
    statusColor: "text-green-600"
  }));
}

export async function getSalesData() {
  // Selalu ambil 7 hari terakhir untuk grafik dasbor
  const startDate = getStartDate("weekly");
  const { data, error } = await supabase
    .from("transactions")
    .select("total_amount, created_at")
    .gte("created_at", startDate!)
    .order("created_at", { ascending: true });

  if (error) return [];

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const daySales = data
      ?.filter(t => t.created_at.startsWith(date))
      .reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    
    const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
    return { name: dayName, sales: daySales };
  });
}

export async function getDetailedSalesReport(period: string = "all") {
  const startDate = getStartDate(period);
  let query = supabase.from("transactions").select("total_amount, created_at");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error || !data) return [];

  const grouped: Record<string, number> = {};
  data.forEach(t => {
    const date = t.created_at.split('T')[0];
    grouped[date] = (grouped[date] || 0) + Number(t.total_amount);
  });

  return Object.entries(grouped).map(([date, sales]) => ({
    date,
    sales,
    profit: sales * 0.15 
  }));
}

export async function getDailyProductSales(period: string = "all") {
  const startDate = getStartDate(period);
  let query = supabase
    .from("transaction_items")
    .select(`
      quantity,
      subtotal,
      created_at,
      transactions!inner (created_at),
      products (name, categories (name))
    `);

  if (startDate) {
    query = query.gte("transactions.created_at", startDate);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(item => {
    const product = (item.products as any);
    const category = product?.categories;
    const transaction = (item.transactions as any);
    const date = item.created_at || transaction?.created_at;

    return {
      date: new Date(date).toLocaleDateString('id-ID'),
      productName: product?.name || "Produk",
      category: category?.name || "Umum",
      quantity: item.quantity,
      total: item.subtotal
    };
  });
}

export async function getCategoryDistribution(period: string = "all") {
  const startDate = getStartDate(period);
  let query = supabase
    .from("transaction_items")
    .select(`
      quantity,
      transactions!inner (created_at),
      products (categories (name))
    `);

  if (startDate) {
    query = query.gte("transactions.created_at", startDate);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  const distribution: Record<string, number> = {};
  data.forEach(item => {
    const categoryName = (item.products as any)?.categories?.name || "Umum";
    distribution[categoryName] = (distribution[categoryName] || 0) + item.quantity;
  });

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getTopProducts() {
  const { data, error } = await supabase
    .from("transaction_items")
    .select("quantity, products (name)");

  if (error || !data) return [];

  const aggregation: Record<string, number> = {};
  data.forEach(item => {
    const name = (item.products as any)?.name || "Produk";
    aggregation[name] = (aggregation[name] || 0) + item.quantity;
  });

  return Object.entries(aggregation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, sales], i) => ({
      name,
      sales,
      color: ["bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400"][i % 4]
    }));
}
