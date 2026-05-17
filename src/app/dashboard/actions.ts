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
  } else if (period === "yearly") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    return null;
  }
  return start.toISOString();
}

/**
 * Mendapatkan identitas bisnis dan cabang user yang aktif
 */
async function getUserContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, current_store_id")
    .eq("id", user.id)
    .single();
    
  return profile;
}

export async function getDashboardStats(period: string = "all") {
  const context = await getUserContext();
  if (!context) return { totalSales: 0, totalProfit: 0, todayTransactions: 0, totalItemsSold: 0, lowStockCount: 0, totalProducts: 0 };

  const startDate = getStartDate(period);
  
  // Ambil transaksi berdasarkan bisnis dan cabang
  let transQuery = supabase
    .from("transactions")
    .select("total_amount, created_at")
    .eq("store_id", context.current_store_id);

  if (startDate) {
    transQuery = transQuery.gte("created_at", startDate);
  }
  const { data: transactions, error: transError } = await transQuery;

  if (transError) {
    console.error("Error fetching transactions:", transError);
    return { totalSales: 0, totalProfit: 0, todayTransactions: 0, totalItemsSold: 0, lowStockCount: 0, totalProducts: 0 };
  }

  // Ambil total barang terjual
  let itemsQuery = supabase
    .from("transaction_items")
    .select("quantity, created_at, transactions!inner(store_id)")
    .eq("transactions.store_id", context.current_store_id);

  if (startDate) {
    itemsQuery = itemsQuery.gte("created_at", startDate);
  }
  const { data: items, error: itemsError } = await itemsQuery;

  // Ambil info stok per cabang (fitur multi-cabang)
  const { data: stocks, error: stockError } = await supabase
    .from("product_stocks")
    .select("stock, min_stock")
    .eq("store_id", context.current_store_id);

  if (stockError) {
    console.error("Error fetching stocks:", stockError);
  }

  const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  const totalProfit = totalSales * 0.15;
  const transactionCount = transactions?.length || 0;
  const totalItemsSold = items?.reduce((acc, curr) => acc + Number(curr.quantity), 0) || 0;
  const lowStockCount = stocks?.filter(s => s.stock <= (s.min_stock || 0)).length || 0;

  return {
    totalSales,
    totalProfit,
    todayTransactions: transactionCount,
    totalItemsSold,
    lowStockCount,
    totalProducts: stocks?.length || 0
  };
}

export async function getRecentTransactions() {
  const context = await getUserContext();
  if (!context) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("id, created_at, total_amount")
    .eq("store_id", context.current_store_id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];

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
  const context = await getUserContext();
  if (!context) return [];

  const startDate = getStartDate("weekly");
  const { data, error } = await supabase
    .from("transactions")
    .select("total_amount, created_at")
    .eq("store_id", context.current_store_id)
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
    return { name: dayName, sales: daySales, profit: daySales * 0.15 };
  });
}

export async function getDetailedSalesReport(period: string = "all") {
  const context = await getUserContext();
  if (!context) return [];

  const startDateStr = getStartDate(period);
  const startDate = startDateStr ? new Date(startDateStr) : null;
  let query = supabase
    .from("transactions")
    .select("total_amount, created_at")
    .eq("store_id", context.current_store_id);

  if (startDateStr) {
    query = query.gte("created_at", startDateStr);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error || !data) return [];

  const grouped: Record<string, number> = {};
  
  data.forEach(t => {
    const dateObj = new Date(t.created_at);
    let key = "";
    
    if (period === "monthly" && startDate) {
      // Group by Week + Date Range
      const diffTime = Math.abs(dateObj.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(diffDays / 7) + 1;
      
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (weekNum - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const format = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
      key = `Mgg ${weekNum} (${format(weekStart)}-${format(weekEnd)})`;
    } else if (period === "yearly") {
      key = dateObj.toLocaleDateString('id-ID', { month: 'short' });
    } else if (period === "all") {
      key = dateObj.getFullYear().toString();
    } else {
      key = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    }

    grouped[key] = (grouped[key] || 0) + Number(t.total_amount);
  });

  return Object.entries(grouped).map(([date, sales]) => ({
    date,
    sales,
    profit: sales * 0.15 
  }));
}

export async function getDailyProductSales(period: string = "all") {
  const context = await getUserContext();
  if (!context) return [];

  const startDate = getStartDate(period);
  let query = supabase
    .from("transaction_items")
    .select(`
      quantity,
      subtotal,
      created_at,
      transactions!inner(store_id),
      products (name, categories (name, icon))
    `)
    .eq("transactions.store_id", context.current_store_id);

  // Gunakan created_at langsung dari tabel transaction_items
  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
    const date = item.created_at;

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
  const context = await getUserContext();
  if (!context) return [];

  const startDate = getStartDate(period);
  let query = supabase
    .from("transaction_items")
    .select(`
      quantity,
      created_at,
      transactions!inner(store_id),
      products (categories (name, icon))
    `)
    .eq("transactions.store_id", context.current_store_id);

  // Gunakan created_at langsung dari tabel transaction_items
  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  const distribution: Record<string, number> = {};
  data.forEach((item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
    const categoryName = category?.name || "Umum";
    distribution[categoryName] = (distribution[categoryName] || 0) + item.quantity;
  });

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getTopProducts() {
  const context = await getUserContext();
  if (!context) return [];

  const { data, error } = await supabase
    .from("transaction_items")
    .select("quantity, products (name), transactions!inner(store_id)")
    .eq("transactions.store_id", context.current_store_id);

  if (error || !data) return [];

  const aggregation: Record<string, number> = {};
  data.forEach((item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const name = product?.name || "Produk";
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
