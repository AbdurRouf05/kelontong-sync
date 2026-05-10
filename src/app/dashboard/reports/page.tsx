import SalesReportChart from "@/components/dashboard/reports/SalesReportChart";
import CategoryPieChart from "@/components/dashboard/reports/CategoryPieChart";
import { getDetailedSalesReport, getCategoryDistribution } from "../actions";

export default async function ReportsPage() {
  const [salesReport, categoryDistribution] = await Promise.all([
    getDetailedSalesReport(),
    getCategoryDistribution()
  ]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-pink-400 border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black uppercase tracking-tight">Laporan & Analitik</h1>
        <p className="text-xl font-bold italic">Pantau performa tokomu secara detail, Gan!</p>
      </div>
      
      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <SalesReportChart data={salesReport} />
        <CategoryPieChart data={categoryDistribution} />
      </div>

      {/* Summary Table */}
      <div className="neo-card space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase tracking-tight">Rincian Performa Harian</h3>
          <button className="bg-white border-[3px] border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
            Export PDF 📄
          </button>
        </div>

        <div className="border-[3px] border-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black text-white text-sm uppercase font-black">
                <tr>
                  <th className="p-4 border-r-[2px] border-white">Tanggal</th>
                  <th className="p-4 border-r-[2px] border-white">Total Penjualan</th>
                  <th className="p-4">Estimasi Laba (20%)</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {salesReport.length > 0 ? (
                  [...salesReport].reverse().map((r, i) => (
                    <tr key={r.date} className={`border-t-[3px] border-black ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                      <td className="p-4 border-r-[3px] border-black">{r.date}</td>
                      <td className="p-4 border-r-[3px] border-black">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.sales)}
                      </td>
                      <td className="p-4 text-green-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.profit)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 italic">Belum ada data transaksi untuk ditampilkan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

