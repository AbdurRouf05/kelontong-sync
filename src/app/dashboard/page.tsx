import SummaryMetrics from "@/components/dashboard/SummaryMetrics";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TopProducts from "@/components/dashboard/TopProducts";
import { 
  getDashboardStats, 
  getRecentTransactions, 
  getSalesData, 
  getTopProducts 
} from "./actions";

export default async function DashboardPage() {
  const [stats, recentTransactions, salesData, topProducts] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(),
    getSalesData(),
    getTopProducts()
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-purple-400 border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">Halo, Juragan Rouf! 👋</h1>
          <p className="text-xl font-bold italic">Tokomu hari ini rame banget, lho. Cuan makin kenceng!</p>
        </div>
        <button className="neo-btn-primary !bg-white whitespace-nowrap">
          Lihat Detail Hari Ini 🚀
        </button>
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




