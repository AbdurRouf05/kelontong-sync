"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SalesReportChart from "@/components/dashboard/reports/SalesReportChart";
import CategoryPieChart from "@/components/dashboard/reports/CategoryPieChart";
import ReportTable from "@/components/dashboard/reports/ReportTable";
import ReportFilter from "@/components/dashboard/reports/ReportFilter";
import { Loader2, Download, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "daily";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalProfit: 0,
    todayTransactions: 0,
    totalItemsSold: 0,
    totalProducts: 0
  });
  const [salesReport, setSalesReport] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (format: "csv" | "xlsx" | "json" | "pdf") => {
    if (productSales.length === 0 && stats.totalSales === 0) {
      showToast("Tidak ada data untuk diekspor!", "error");
      setIsExportMenuOpen(false);
      return;
    }

    try {
      const periodLabel = period === "all" ? "Semua Periode" 
                        : period === "daily" ? "Hari Ini" 
                        : period === "weekly" ? "Minggu Ini" 
                        : period === "monthly" ? "Bulan Ini" 
                        : "Tahun Ini";

      // 1. JSON Export
      if (format === "json") {
        const jsonExport = {
          laporan: "Laporan Penjualan & Analitik KelontongSync",
          periode: periodLabel,
          tanggal_cetak: new Date().toLocaleString("id-ID"),
          ringkasan: {
            total_penjualan: stats.totalSales,
            total_laba: stats.totalProfit,
            total_transaksi: stats.todayTransactions,
            barang_terjual: stats.totalItemsSold,
            produk_aktif: stats.totalProducts
          },
          rincian_produk_terjual: productSales
        };

        const blob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_${period}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Berhasil diekspor ke JSON!");
      }

      // 2. CSV Export
      else if (format === "csv") {
        const csvRows = [
          ["LAPORAN PENJUALAN & ANALITIK KELONTONGSYNC"],
          ["Periode", periodLabel],
          ["Tanggal Cetak", new Date().toLocaleString("id-ID")],
          [],
          ["RINGKASAN STATISTIK"],
          ["Total Penjualan", stats.totalSales],
          ["Total Laba", stats.totalProfit],
          ["Total Transaksi", stats.todayTransactions],
          ["Barang Terjual", stats.totalItemsSold],
          ["Produk Aktif SKU", stats.totalProducts],
          [],
          ["RINCIAN PENJUALAN PRODUK"],
          ["Tanggal", "Produk", "Kategori", "Jumlah Terjual", "Total Penjualan"]
        ];

        productSales.forEach(p => {
          csvRows.push([p.date, p.productName, p.category, p.quantity, p.total]);
        });

        const csvContent = csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Berhasil diekspor ke CSV!");
      }

      // 3. Excel (XLSX) Export
      else if (format === "xlsx") {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Ringkasan
        const summaryData = [
          ["Laporan Penjualan & Analitik KelontongSync"],
          ["Periode", periodLabel],
          ["Tanggal Cetak", new Date().toLocaleString("id-ID")],
          [],
          ["METRIK UTAMA", "NILAI"],
          ["Total Penjualan", stats.totalSales],
          ["Total Laba", stats.totalProfit],
          ["Total Transaksi", stats.todayTransactions],
          ["Barang Terjual", stats.totalItemsSold],
          ["Produk Aktif SKU", stats.totalProducts]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Laporan");

        // Sheet 2: Rincian Produk
        const rincianData = [
          ["Tanggal", "Nama Produk", "Kategori", "Jumlah Terjual", "Total Penjualan"]
        ];
        productSales.forEach(p => {
          rincianData.push([p.date, p.productName, p.category, p.quantity, p.total]);
        });
        const wsRincian = XLSX.utils.aoa_to_sheet(rincianData);
        XLSX.utils.book_append_sheet(wb, wsRincian, "Rincian Penjualan");

        XLSX.writeFile(wb, `laporan_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast("Berhasil diekspor ke XLSX!");
      }

      // 4. PDF Export
      else if (format === "pdf") {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("LAPORAN PENJUALAN & ANALITIK", 14, 20);
        doc.setFontSize(14);
        doc.text("KELONTONGSYNC SAAS PLATFORM", 14, 28);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Periode Laporan: ${periodLabel}`, 14, 38);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, 14, 44);

        // Prepend statistics box
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 50, 182, 35, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("RINGKASAN METRIK TOKO", 20, 57);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Total Penjualan: Rp ${stats.totalSales.toLocaleString("id-ID")}`, 20, 65);
        doc.text(`Total Laba: Rp ${stats.totalProfit.toLocaleString("id-ID")}`, 20, 72);
        doc.text(`Total Transaksi: ${stats.todayTransactions} Trx`, 20, 79);
        
        doc.text(`Barang Terjual: ${stats.totalItemsSold} Item`, 110, 65);
        doc.text(`Produk Aktif SKU: ${stats.totalProducts} Sku`, 110, 72);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("RINCIAN PENJUALAN PRODUK", 14, 98);

        autoTable(doc, {
          head: [["Tanggal", "Produk", "Kategori", "Jumlah", "Total"]],
          body: productSales.map(r => [
            r.date || "-", 
            r.productName || "-", 
            r.category || "-", 
            (r.quantity || 0).toString(),
            `Rp ${(r.total || 0).toLocaleString("id-ID")}`
          ]),
          startY: 104,
          theme: "grid",
          headStyles: { fillColor: [0, 0, 0] },
          styles: { fontStyle: "bold" }
        });

        doc.save(`laporan_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast("Berhasil diekspor ke PDF!");
      }
    } catch (err) {
      console.error("Gagal melakukan export:", err);
      showToast("Gagal melakukan export laporan!", "error");
    } finally {
      setIsExportMenuOpen(false);
    }
  };

  useEffect(() => {
    async function loadReportsData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile to get current_store_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id, current_store_id")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.current_store_id) {
          setLoading(false);
          return;
        }

        const storeId = profile.current_store_id;
        const startDateStr = getStartDate(period);
        const startDate = startDateStr ? new Date(startDateStr) : null;

        // 2. Fetch Transactions for Stats & Chart
        let transQuery = supabase
          .from("transactions")
          .select("total_amount, created_at")
          .eq("store_id", storeId);

        if (startDateStr) {
          transQuery = transQuery.gte("created_at", startDateStr);
        }

        const { data: transactions } = await transQuery.order("created_at", { ascending: true });

        // Calculate Stats
        const totalSales = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
        const totalProfit = totalSales * 0.15;
        const todayTransactions = transactions?.length || 0;

        // Get total active products count
        const { data: stocks } = await supabase
          .from("product_stocks")
          .select("id")
          .eq("store_id", storeId);

        const totalProducts = stocks?.length || 0;

        // 3. Fetch Transaction Items for items sold, table list, and categories
        let itemsQuery = supabase
          .from("transaction_items")
          .select(`
            quantity,
            subtotal,
            created_at,
            transactions!inner(store_id),
            products (name, categories (name, icon))
          `)
          .eq("transactions.store_id", storeId);

        if (startDateStr) {
          itemsQuery = itemsQuery.gte("created_at", startDateStr);
        }

        const { data: items } = await itemsQuery.order("created_at", { ascending: false });

        const totalItemsSold = items?.reduce((acc, curr) => acc + Number(curr.quantity), 0) || 0;

        setStats({
          totalSales,
          totalProfit,
          todayTransactions,
          totalItemsSold,
          totalProducts
        });

        // 4. Group Transactions by Period for Chart
        const groupedChart: Record<string, number> = {};
        transactions?.forEach(t => {
          const dateObj = new Date(t.created_at);
          let key = "";
          
          if (period === "monthly" && startDate) {
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

          groupedChart[key] = (groupedChart[key] || 0) + Number(t.total_amount);
        });

        const formattedChart = Object.entries(groupedChart).map(([date, sales]) => ({
          date,
          sales,
          profit: sales * 0.15 
        }));
        setSalesReport(formattedChart);

        // 5. Group Transaction Items by Category for Pie Chart
        const distMap: Record<string, number> = {};
        items?.forEach((item: any) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
          const categoryName = category?.name || "Umum";
          distMap[categoryName] = (distMap[categoryName] || 0) + item.quantity;
        });

        const formattedDist = Object.entries(distMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setCategoryDistribution(formattedDist);

        // 6. Map Transaction Items for Table List
        const formattedSalesList = items?.map((item: any) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
          return {
            date: new Date(item.created_at).toLocaleDateString('id-ID'),
            productName: product?.name || "Produk",
            category: category?.name || "Umum",
            quantity: item.quantity,
            total: item.subtotal
          };
        }) || [];

        setProductSales(formattedSalesList);
      } catch (err) {
        console.error("Error loading client reports data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReportsData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin p-4 border-[4px] border-black bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 size={36} className="text-black" />
        </div>
        <p className="font-black uppercase tracking-wider text-sm animate-pulse">Memuat Data Laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 print:p-0">
      {/* Header Section */}
      <div className="space-y-4 sm:space-y-6 print:hidden">
        <div className="bg-pink-400 border-[4px] border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Laporan & Analitik</h1>
          <p className="text-sm sm:text-xl font-bold italic">Pantau performa tokomu secara detail, Gan!</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <ReportFilter />
          
          <div className="relative w-full sm:w-auto shrink-0">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="w-full sm:w-auto bg-white border-[3px] border-black px-5 py-2.5 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0"
            >
              <Download size={16} /> EXPORT LAPORAN
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border-[3px] border-black z-[100] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => handleExport("csv")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-yellow-400 border-b-[2px] border-black transition-colors">CSV Format</button>
                <button onClick={() => handleExport("xlsx")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-green-400 border-b-[2px] border-black transition-colors">Excel (XLSX)</button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-red-400 border-b-[2px] border-black transition-colors">PDF Report</button>
                <button onClick={() => handleExport("json")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-blue-400 border-b-[2px] border-black transition-colors">JSON Data</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="neo-card p-4 sm:p-6 bg-blue-100 col-span-2 sm:col-span-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">
            Total Penjualan
          </p>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalSales)}
          </h3>
        </div>
        <div className="neo-card p-4 sm:p-6 bg-purple-100 col-span-2 sm:col-span-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">
            Total Laba
          </p>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-green-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalProfit)}
          </h3>
        </div>
        <div className="neo-card p-4 sm:p-6 bg-green-100 col-span-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">
            Total Transaksi
          </p>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{stats.todayTransactions} Trx</h3>
        </div>
        <div className="neo-card p-4 sm:p-6 bg-orange-100 col-span-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">
            Barang Terjual
          </p>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{stats.totalItemsSold} Item</h3>
        </div>
        <div className="neo-card p-4 sm:p-6 bg-yellow-100 col-span-2 sm:col-span-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">Produk Aktif</p>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{stats.totalProducts} Sku</h3>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 print:hidden">
        <SalesReportChart 
          data={salesReport} 
          period={period}
        />
        <CategoryPieChart data={categoryDistribution} />
      </div>

      {/* Summary Table */}
      <ReportTable data={productSales} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-300">
          <div className={`neo-card ${toast.type === "success" ? "bg-green-400" : "bg-red-400"} flex items-center gap-3 px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black`}>
            {toast.type === "success" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <p className="font-black uppercase tracking-tight text-sm text-black">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin p-4 border-[4px] border-black bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 size={36} className="text-black" />
        </div>
        <p className="font-black uppercase tracking-wider text-sm animate-pulse">Memuat Halaman Laporan...</p>
      </div>
    }>
      <ReportsPageContent />
    </Suspense>
  );
}
