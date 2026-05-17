import Link from "next/link";

export default function RecentTransactions({ transactions = [] }: { transactions?: any[] }) {
  return (
    <div className="neo-card p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Aktivitas Terakhir</h3>
        <span className="bg-yellow-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase shrink-0">Modul: Laporan</span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border-[3px] border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white text-sm uppercase font-black">
              <tr>
                <th className="p-4 border-r-[2px] border-white">Waktu</th>
                <th className="p-4 border-r-[2px] border-white">Transaksi</th>
                <th className="p-4 border-r-[2px] border-white">Nominal</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {transactions.map((t, i) => (
                <tr key={t.id} className={`border-t-[3px] border-black ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                  <td className="p-4 border-r-[3px] border-black">{t.time}</td>
                  <td className="p-4 border-r-[3px] border-black">{t.description}</td>
                  <td className="p-4 border-r-[3px] border-black">{t.amount}</td>
                  <td className={`p-4 ${t.statusColor}`}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bento List View */}
      <div className="block md:hidden space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="border-[2px] border-black p-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 font-bold">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.time}</span>
              <span className={`text-[10px] px-2 py-0.5 border border-black font-black uppercase ${t.status === 'Berhasil' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {t.status}
              </span>
            </div>
            <div className="flex justify-between items-end gap-3">
              <p className="text-xs font-black uppercase truncate">{t.description}</p>
              <p className="text-xs font-black text-slate-900 shrink-0">{t.amount}</p>
            </div>
          </div>
        ))}
      </div>

      <Link href="/dashboard/reports" className="block w-full py-3 border-[3px] border-black font-black uppercase hover:bg-black hover:text-white transition-colors text-center text-sm">
        Lihat Semua Laporan 📋
      </Link>
    </div>
  );
}
