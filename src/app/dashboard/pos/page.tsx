export default function POSPage() {
  return (
    <div className="space-y-8">
      <div className="neo-card bg-green-400">
        <h1 className="text-4xl font-black uppercase tracking-tight">Modul POS (Point of Sales)</h1>
        <p className="text-xl font-bold italic">PIC: Rafi</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 neo-card min-h-[400px] flex flex-col items-center justify-center border-dashed border-slate-300">
          <p className="text-2xl font-black uppercase text-slate-400">Area Daftar Barang & Kasir</p>
        </div>
        <div className="neo-card min-h-[400px] bg-white flex flex-col items-center justify-center border-dashed border-slate-300">
          <p className="text-2xl font-black uppercase text-slate-400">Area Keranjang</p>
        </div>
      </div>

      <div className="bg-yellow-100 border-[3px] border-black p-6 space-y-4">
        <h3 className="text-2xl font-black uppercase">Instruksi Rafi:</h3>
        <ul className="list-disc list-inside font-bold space-y-2">
          <li>Buat antarmuka scan barcode atau pilih barang manual.</li>
          <li>Hitung subtotal, pajak, dan kembalian.</li>
          <li>Integrasikan dengan tombol "Bayar" untuk simpan ke database.</li>
        </ul>
      </div>
    </div>
  );
}
