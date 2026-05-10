export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div className="neo-card bg-blue-400">
        <h1 className="text-4xl font-black uppercase tracking-tight">Modul Inventaris & Stok</h1>
        <p className="text-xl font-bold italic">PIC: Akmal</p>
      </div>
      
      <div className="neo-card min-h-[500px] bg-white flex flex-col items-center justify-center border-dashed border-slate-300">
        <p className="text-3xl font-black uppercase text-slate-400">Area Tabel Manajemen Barang</p>
        <button className="mt-6 neo-btn-primary">+ Tambah Barang Baru</button>
      </div>

      <div className="bg-blue-100 border-[3px] border-black p-6 space-y-4">
        <h3 className="text-2xl font-black uppercase">Instruksi Akmal:</h3>
        <ul className="list-disc list-inside font-bold space-y-2">
          <li>Buat tabel CRUD untuk produk (Nama, Barcode, Harga Beli, Harga Jual, Stok).</li>
          <li>Implementasi fitur kategori barang.</li>
          <li>Tambahkan filter pencarian dan alert untuk stok yang hampir habis.</li>
        </ul>
      </div>
    </div>
  );
}
