"use server";

import { supabase } from "@/lib/supabase";

function getStartDate(period: string) {
  const now = new Date();
  const start = new Date();
  if (period === "daily") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    return null;
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

  // Calculate metrics
  const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  const todayTransactions = transactions?.length || 0;
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
      total_amount
    `)
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

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

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

  if (error) {
    console.error("Error fetching top products:", error);
    return [];
  }

  // Manual aggregation because Supabase join grouping is tricky with basic client
  const aggregation: Record<string, { name: string, sales: number }> = {};
  
  data?.forEach(item => {
    const products = item.products as any;
    const productName = Array.isArray(products) ? products[0]?.name : products?.name || "Produk Tak Dikenal";
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

export async function getDetailedSalesReport(period: "daily" | "weekly" | "monthly" = "daily") {
  const { data, error } = await supabase
    .from("transactions")
    .select("total_amount, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching detailed reports:", error);
    return [];
  }

  const grouped: Record<string, number> = {};
  
  data.forEach(t => {
    const dateObj = new Date(t.created_at);
    let key = "";

    if (period === "daily") {
      key = t.created_at.split('T')[0];
    } else if (period === "weekly") {
      // Get first day of week (Sunday)
      const day = dateObj.getDay();
      const diff = dateObj.getDate() - day;
      const startOfWeek = new Date(dateObj.setDate(diff));
      key = `Week ${startOfWeek.toISOString().split('T')[0]}`;
    } else if (period === "monthly") {
      key = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    }

    grouped[key] = (grouped[key] || 0) + Number(t.total_amount);
  });

  return Object.entries(grouped).map(([date, sales]) => ({
    date,
    sales,
    profit: sales * 0.2
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
      transactions (created_at),
      products (name, categories (name))
    `)
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching daily product sales:", error);
    return [];
  }

  return data.map(item => {
    const products = item.products as any;
    const product = Array.isArray(products) ? products[0] : products;
    const categories = product?.categories as any;
    const category = Array.isArray(categories) ? categories[0] : categories;

    const transactions = item.transactions as any;
    const transaction = Array.isArray(transactions) ? transactions[0] : transactions;
    const createdAt = item.created_at || transaction?.created_at || new Date().toISOString();

    return {
      date: new Date(createdAt).toLocaleDateString('id-ID'),
      productName: product?.name || "Produk Tak Dikenal",
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
      created_at,
      products (
        categories (name)
      )
    `);

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching category distribution:", error);
    return [];
  }

  const distribution: Record<string, number> = {};
  
  data?.forEach(item => {
    // Handle both object and array formats from Supabase join
    const products = item.products as any;
    const product = Array.isArray(products) ? products[0] : products;
    
    const categories = product?.categories as any;
    const category = Array.isArray(categories) ? categories[0] : categories;
    
    const categoryName = category?.name || "Tanpa Kategori";
    
    distribution[categoryName] = (distribution[categoryName] || 0) + item.quantity;
  });

  // Return formatted data for Recharts
  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

