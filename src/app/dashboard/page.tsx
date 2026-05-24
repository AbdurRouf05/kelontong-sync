"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SummaryMetrics from "@/components/dashboard/SummaryMetrics";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TopProducts from "@/components/dashboard/TopProducts";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalProfit: 0,
    todayTransactions: 0,
    totalItemsSold: 0,
    lowStockCount: 0,
    totalProducts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, role, business_id, current_store_id")
          .eq("id", user.id)
          .single();

        setProfile(profileData);

        if (!profileData || !profileData.current_store_id) {
          setLoading(false);
          return;
        }

        const storeId = profileData.current_store_id;

        // 2. Fetch Stats & Transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("total_amount, created_at")
          .eq("store_id", storeId);

        // Get daily transactions (today)
        const todayStr = new Date().toISOString().split("T")[0];
        const todayTransactionsList = transactions?.filter(t => t.created_at.startsWith(todayStr)) || [];
        const todaySales = todayTransactionsList.reduce((acc, curr) => acc + Number(curr.total_amount), 0);

        const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
        const totalProfit = totalSales * 0.15;

        // Get low stock count
        const { data: stocks } = await supabase
          .from("product_stocks")
          .select("stock, min_stock")
          .eq("store_id", storeId);

        const lowStockCount = stocks?.filter(s => s.stock <= (s.min_stock || 0)).length || 0;

        // Get transaction items (items sold)
        const { data: items } = await supabase
          .from("transaction_items")
          .select("quantity, transactions!inner(store_id)")
          .eq("transactions.store_id", storeId);

        const totalItemsSold = items?.reduce((acc, curr) => acc + Number(curr.quantity), 0) || 0;

        setStats({
          totalSales,
          totalProfit,
          todayTransactions: todayTransactionsList.length,
          totalItemsSold,
          lowStockCount,
          totalProducts: stocks?.length || 0
        });

        // 3. Fetch Recent Transactions
        const { data: recents } = await supabase
          .from("transactions")
          .select("id, created_at, total_amount")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recents) {
          setRecentTransactions(recents.map(t => ({
            id: t.id,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: `Transaksi Selesai`,
            amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(t.total_amount)),
            status: "BERHASIL",
            statusColor: "text-green-600"
          })));
        }

        // 4. Fetch Weekly Sales Chart Data
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const weeklySales = last7Days.map(date => {
          const daySales = transactions
            ?.filter(t => t.created_at.startsWith(date))
            .reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
          
          const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
          return { name: dayName, sales: daySales, profit: daySales * 0.15 };
        });

        setSalesData(weeklySales);

        // 5. Fetch Top Products
        const { data: topProdItems } = await supabase
          .from("transaction_items")
          .select("quantity, products (name), transactions!inner(store_id)")
          .eq("transactions.store_id", storeId);

        const prodAggregation: Record<string, number> = {};
        topProdItems?.forEach((item: any) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const name = product?.name || "Produk";
          prodAggregation[name] = (prodAggregation[name] || 0) + item.quantity;
        });

        const sortedProducts = Object.entries(prodAggregation)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, sales], i) => ({
            name,
            sales,
            color: ["bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400"][i % 4]
          }));

        setTopProducts(sortedProducts);
      } catch (err) {
        console.error("Error loading client dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin p-4 border-[4px] border-black bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 size={36} className="text-black" />
        </div>
        <p className="font-black uppercase tracking-wider text-sm animate-pulse">Memuat Data Dashboard...</p>
      </div>
    );
  }

  // Sapaan Dinamis Berdasarkan Waktu Lokal Indonesia (WIB - GMT+7)
  const date = new Date();
  const utcHour = date.getUTCHours();
  const wibHour = (utcHour + 7) % 24;

  let timeGreeting = "Selamat hari ini";
  if (wibHour >= 5 && wibHour < 11) {
    timeGreeting = "Selamat pagi";
  } else if (wibHour >= 11 && wibHour < 15) {
    timeGreeting = "Selamat siang";
  } else if (wibHour >= 15 && wibHour < 18) {
    timeGreeting = "Selamat sore";
  } else {
    timeGreeting = "Selamat malam";
  }

  // Tentukan sapaan role secara dinamis
  let roleTitle = "Pemilik Toko"; // Default
  if (profile?.role === "superadmin") {
    roleTitle = "Super Admin";
  } else if (profile?.role === "kasir") {
    roleTitle = "Staf Toko";
  }

  // Nama pengguna (abaikan jika namanya sama dengan roleTitle atau fallback default "Juragan")
  const nameDisplay = profile?.full_name && 
                      profile.full_name !== "Juragan" && 
                      profile.full_name.toLowerCase() !== roleTitle.toLowerCase()
    ? profile.full_name
    : "";

  // Sapaan akhir dinamis: e.g., "SELAMAT SORE, PEMILIK TOKO AKMAL!" atau "SELAMAT SORE, PEMILIK TOKO!"
  const fullGreeting = nameDisplay 
    ? `${timeGreeting.toUpperCase()}, ${roleTitle.toUpperCase()} ${nameDisplay.toUpperCase()}!`
    : `${timeGreeting.toUpperCase()}, ${roleTitle.toUpperCase()}!`;

  // Kondisi Toko Hari Ini Dinamis & Kontekstual
  let storeCondition = "";
  if (stats.todayTransactions === 0) {
    if (wibHour >= 5 && wibHour < 11) {
      storeCondition = "Toko siap melayani! Yuk, buka kasir dan catat transaksi pertama hari ini.";
    } else if (wibHour >= 11 && wibHour < 17) {
      storeCondition = "Belum ada penjualan siang ini. Tetap semangat, promokan tokomu agar makin ramai!";
    } else {
      storeCondition = "Hari ini belum ada transaksi masuk. Tetap bersyukur, esok hari rezeki pasti menyusul!";
    }
  } else {
    if (stats.totalSales >= 500000) {
      storeCondition = `Omzet mantap luar biasa! Total Rp ${stats.totalSales.toLocaleString("id-ID")} dari ${stats.todayTransactions} transaksi. Cuan makin kenceng!`;
    } else {
      storeCondition = `Performa stabil! Sudah ada ${stats.todayTransactions} transaksi dengan total Rp ${stats.totalSales.toLocaleString("id-ID")} tercatat hari ini.`;
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-purple-400 border-[4px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">{fullGreeting}</h1>
          <p className="text-sm sm:text-xl font-bold italic">{storeCondition}</p>
        </div>
        <Link href="/dashboard/reports" className="neo-btn-primary !bg-white whitespace-nowrap w-full md:w-auto text-center py-3 md:py-2.5 px-6 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
          Lihat Detail Hari Ini <ArrowRight size={20} />
        </Link>
      </div>

      {/* Stats Grid */}
      <SummaryMetrics data={stats} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sales Chart (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <SalesChart data={salesData} />
        </div>
        
        {/* Top Products (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>

      {/* Recent Transactions (Full width) */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
