import SalesReportChart from "@/components/dashboard/reports/SalesReportChart";
import CategoryPieChart from "@/components/dashboard/reports/CategoryPieChart";
import ReportTable from "@/components/dashboard/reports/ReportTable";
import ReportFilter from "@/components/dashboard/reports/ReportFilter";
import { 
  getDetailedSalesReport,
  getDailyProductSales, 
  getCategoryDistribution,
  getDashboardStats
} from "../actions";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "all" } = await searchParams;

  const [salesReport, productSales, categoryDistribution, stats] = await Promise.all([
    getDetailedSalesReport(period === "all" ? "daily" : (period as any)),
    getDailyProductSales(period),
    getCategoryDistribution(period),
    getDashboardStats(period)
  ]);

  return (
    <div className="space-y-8 print:p-0">
      {/* Header Section */}
      <div className="space-y-6 print:hidden">
        <div className="bg-pink-400 border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
          <h1 className="text-4xl font-black uppercase tracking-tight">Laporan & Analitik</h1>
          <p className="text-xl font-bold italic">Pantau performa tokomu secara detail, Gan!</p>
        </div>
        
        <div className="flex justify-start">
          <ReportFilter />
        </div>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="neo-card bg-blue-100">
          <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">
            Total Penjualan ({period === "all" ? "Semua" : period === "daily" ? "Hari Ini" : period === "weekly" ? "Minggu Ini" : period === "monthly" ? "Bulan Ini" : "Tahun Ini"})
          </p>
          <h3 className="text-3xl font-black tracking-tight">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalSales)}
          </h3>
        </div>
        <div className="neo-card bg-purple-100">
          <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">
            Total Laba ({period === "all" ? "Semua" : period === "daily" ? "Hari Ini" : period === "weekly" ? "Minggu Ini" : period === "monthly" ? "Bulan Ini" : "Tahun Ini"})
          </p>
          <h3 className="text-3xl font-black tracking-tight text-green-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalProfit)}
          </h3>
        </div>
        <div className="neo-card bg-green-100">
          <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">
            Total Transaksi
          </p>
          <h3 className="text-3xl font-black tracking-tight">{stats.todayTransactions} Transaksi</h3>
        </div>
        <div className="neo-card bg-yellow-100">
          <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">Produk Aktif</p>
          <h3 className="text-3xl font-black tracking-tight">{stats.totalProducts} Produk</h3>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 print:hidden">
        <SalesReportChart 
          data={salesReport} 
          period={period}
        />
        <CategoryPieChart data={categoryDistribution} />
      </div>

      {/* Summary Table */}
      <ReportTable data={productSales} />
    </div>
  );
}
