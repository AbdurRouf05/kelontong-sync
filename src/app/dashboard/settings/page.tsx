export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="neo-card bg-purple-400">
        <h1 className="text-4xl font-black uppercase tracking-tight">Pengaturan & Multi-Cabang</h1>
        <p className="text-xl font-bold italic">PIC: Gombet</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="neo-card space-y-6">
          <h3 className="text-2xl font-black uppercase">Profil Toko</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="font-black uppercase">Nama Toko</label>
              <input type="text" className="neo-box p-3 font-bold" defaultValue="Toko Berkah Utama" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-black uppercase">Alamat</label>
              <textarea className="neo-box p-3 font-bold">Jl. Merdeka No. 123, Kota Digital</textarea>
            </div>
          </div>
        </div>

        <div className="neo-card space-y-6">
          <h3 className="text-2xl font-black uppercase">Daftar Cabang</h3>
          <div className="bg-slate-100 border-[3px] border-black p-4 font-bold flex justify-between items-center">
            <span>🏠 Cabang Pusat (Main)</span>
            <span className="bg-black text-white px-2 text-xs">AKTIF</span>
          </div>
          <div className="bg-white border-[3px] border-black p-4 font-bold flex justify-between items-center opacity-50">
            <span>🏪 Cabang Sudirman</span>
            <button className="text-xs underline">Pindah Ke Sini</button>
          </div>
          <button className="w-full neo-btn-secondary">+ Tambah Cabang Baru</button>
        </div>
      </div>

      <div className="bg-purple-100 border-[3px] border-black p-6 space-y-4">
        <h3 className="text-2xl font-black uppercase">Instruksi Gombet:</h3>
        <ul className="list-disc list-inside font-bold space-y-2">
          <li>Buat antarmuka manajemen profil toko dan cabang.</li>
          <li>Implementasi fitur perpindahan cabang (update store_id di context/session).</li>
          <li>Manajemen akun karyawan/kasir per cabang.</li>
        </ul>
      </div>
    </div>
  );
}
