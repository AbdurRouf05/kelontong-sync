export default function RecentTransactions({ transactions = [] }: { transactions?: any[] }) {

  return (
    <div className="neo-card space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tight">Aktivitas Terakhir</h3>
        <span className="bg-yellow-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">Modul: Laporan</span>
      </div>

      <div className="border-[3px] border-black overflow-hidden">
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

      <button className="w-full py-3 border-[3px] border-black font-black uppercase hover:bg-black hover:text-white transition-colors">
        Lihat Semua Laporan 📋
      </button>
    </div>
  );
}
