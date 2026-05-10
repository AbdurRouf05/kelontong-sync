export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="neo-card bg-pink-400">
        <h1 className="text-4xl font-black uppercase tracking-tight">Laporan & Analitik</h1>
        <p className="text-xl font-bold italic">PIC: Adam</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="neo-card min-h-[300px] flex items-center justify-center border-dashed border-slate-300">
          <p className="text-2xl font-black uppercase text-slate-400 text-center">Grafik Penjualan <br /> (Line Chart)</p>
        </div>
        <div className="neo-card min-h-[300px] flex items-center justify-center border-dashed border-slate-300">
          <p className="text-2xl font-black uppercase text-slate-400 text-center">Grafik Kategori Terlaris <br /> (Pie Chart)</p>
        </div>
      </div>

      <div className="bg-pink-100 border-[3px] border-black p-6 space-y-4">
        <h3 className="text-2xl font-black uppercase">Instruksi Adam:</h3>
        <ul className="list-disc list-inside font-bold space-y-2">
          <li>Visualisasikan data transaksi menggunakan library grafik (Chart.js/Recharts).</li>
          <li>Buat laporan laba kotor dan laba bersih per periode (Harian/Bulanan).</li>
          <li>Export data laporan ke PDF atau Excel.</li>
        </ul>
      </div>
    </div>
  );
}
