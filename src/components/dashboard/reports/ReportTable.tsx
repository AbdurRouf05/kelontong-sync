"use client";

export default function ReportTable({ data = [] }: { data?: any[] }) {
  return (
    <div className="neo-card space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tight">Rincian Penjualan Produk</h3>
        <button 
          onClick={() => window.print()}
          className="bg-white border-[3px] border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          Export PDF 📄
        </button>
      </div>

      <div className="border-[3px] border-black overflow-hidden print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white text-sm uppercase font-black">
              <tr>
                <th className="p-4 border-r-[2px] border-white">Tanggal</th>
                <th className="p-4 border-r-[2px] border-white">Produk</th>
                <th className="p-4 border-r-[2px] border-white text-center">Jumlah</th>
                <th className="p-4">Total Penjualan</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {data.length > 0 ? (
                data.map((r, i) => (
                  <tr key={i} className={`border-t-[3px] border-black ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                    <td className="p-4 border-r-[3px] border-black whitespace-nowrap">{r.date}</td>
                    <td className="p-4 border-r-[3px] border-black">
                      <div className="flex flex-col">
                        <span>{r.productName}</span>
                        <span className="text-[10px] uppercase text-slate-400">{r.category}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[3px] border-black text-center">{r.quantity}</td>
                    <td className="p-4">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada data transaksi untuk ditampilkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      <p className="text-xs text-slate-400 italic md:hidden">
        * Gunakan tampilan Desktop untuk hasil print PDF yang lebih baik.
      </p>
    </div>
  );
}
