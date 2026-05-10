import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { name: "Total Penjualan", value: "Rp 12.500.000", icon: <TrendingUp className="text-blue-500" />, trend: "+15%", positive: true, color: "bg-blue-100" },
    { name: "Transaksi Hari Ini", value: "128", icon: <ShoppingBag className="text-green-500" />, trend: "+8%", positive: true, color: "bg-green-100" },
    { name: "Pelanggan Baru", value: "24", icon: <Users className="text-pink-500" />, trend: "-2%", positive: false, color: "bg-pink-100" },
    { name: "Barang Hampir Habis", value: "5", icon: <AlertTriangle className="text-yellow-600" />, trend: "Perlu Cek", positive: false, color: "bg-yellow-100" },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="neo-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${s.color}`}>
                {s.icon}
              </div>
              <div className={`flex items-center text-sm font-black px-2 py-1 border-[2px] border-black ${s.positive ? "bg-green-400" : "bg-red-400"}`}>
                {s.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {s.trend}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">{s.name}</p>
              <h3 className="text-3xl font-black tracking-tight">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Sections for Members */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Placeholder Table */}
        <div className="neo-card space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase tracking-tight">Aktivitas Terakhir</h3>
            <span className="bg-yellow-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">Modul: Adam</span>
          </div>
          <div className="border-[3px] border-black overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black text-white text-sm uppercase font-black">
                <tr>
                  <th className="p-4 border-r-[2px] border-white">Waktu</th>
                  <th className="p-4 border-r-[2px] border-white">Transaksi</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr className="border-t-[3px] border-black">
                  <td className="p-4 border-r-[3px] border-black">12:45</td>
                  <td className="p-4 border-r-[3px] border-black">Penjualan 3x Mie Instan</td>
                  <td className="p-4 text-green-600">BERHASIL</td>
                </tr>
                <tr className="border-t-[3px] border-black bg-slate-50">
                  <td className="p-4 border-r-[3px] border-black">12:30</td>
                  <td className="p-4 border-r-[3px] border-black">Tambah Stok Beras 50kg</td>
                  <td className="p-4 text-blue-600">RESTOK</td>
                </tr>
                <tr className="border-t-[3px] border-black">
                  <td className="p-4 border-r-[3px] border-black">12:15</td>
                  <td className="p-4 border-r-[3px] border-black">Penjualan Minyak Goreng</td>
                  <td className="p-4 text-green-600">BERHASIL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Instructions Box */}
        <div className="bg-white border-[4px] border-black p-8 shadow-[10px_10px_0px_0px_rgba(74,222,128,1)] space-y-6">
          <h3 className="text-3xl font-black uppercase italic underline decoration-yellow-400">Papan Pengumuman Tim</h3>
          <ul className="space-y-4 font-bold text-lg">
            <li className="flex gap-3">
              <span className="bg-black text-white px-2 h-fit">1</span>
              <span><strong>Rafi:</strong> Silakan kerjakan modul POS di folder <code>/dashboard/pos</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-black text-white px-2 h-fit">2</span>
              <span><strong>Akmal:</strong> Modul Inventaris ada di folder <code>/dashboard/inventory</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-black text-white px-2 h-fit">3</span>
              <span><strong>Adam:</strong> Laporan & Dashboard Utama lanjut di folder ini.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-black text-white px-2 h-fit">4</span>
              <span><strong>Gombet:</strong> Pengaturan Multi-Cabang di <code>/dashboard/settings</code>.</span>
            </li>
          </ul>
          <div className="p-4 bg-orange-100 border-[3px] border-black font-black uppercase text-sm">
            💡 Gunakan class <code>neo-card</code>, <code>neo-btn-primary</code>, dll yang sudah ada di <code>globals.css</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
