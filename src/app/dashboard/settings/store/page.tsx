import React from 'react';

export default function StoreProfilePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Profil Toko</h1>
        <p className="text-lg font-medium text-gray-700 border-l-4 border-black pl-3">
          Atur informasi dasar toko atau cabang yang sedang aktif.
        </p>
      </div>

      <form className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="storeName" className="block text-xl font-bold uppercase">Nama Toko / Cabang</label>
          <input 
            type="text" 
            id="storeName"
            defaultValue="Kelontong Berkah (Pusat)"
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-xl font-bold uppercase">Nomor Telepon</label>
          <input 
            type="text" 
            id="phone"
            defaultValue="081234567890"
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="block text-xl font-bold uppercase">Alamat Lengkap</label>
          <textarea 
            id="address"
            rows={4}
            defaultValue="Jl. Sudirman No. 123, Jakarta Selatan"
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4] resize-none"
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="button" 
            className="px-8 py-4 bg-[#FFE800] text-black border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-black text-xl uppercase tracking-wider"
          >
            💾 Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
