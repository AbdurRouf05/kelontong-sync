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
  const { period = "daily" } = await searchParams;

  const [salesReport, productSales, categoryDistribution, stats] = await Promise.all([
    getDetailedSalesReport(period),
    getDailyProductSales(period),
    getCategoryDistribution(period),
    getDashboardStats(period)
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 print:p-0">
      {/* Header Section */}
      <div className="space-y-4 sm:space-y-6 print:hidden">
        <div className="bg-pink-400 border-[4px] border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Laporan & Analitik</h1>
          <p className="text-sm sm:text-xl font-bold italic">Pantau performa tokomu secara detail, Gan!</p>
        </div>
        
        <div className="flex justify-start">
          <ReportFilter />
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
    </div>
  );
}
