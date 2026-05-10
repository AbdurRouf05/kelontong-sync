"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StoreProfilePage() {
  const [storeData, setStoreData] = useState({ id: '', name: '', phone: '', address: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data dari Supabase saat halaman dimuat
  useEffect(() => {
    async function fetchStore() {
      try {
        // Untuk tahap awal ini, kita ambil 1 data toko pertama sebagai contoh
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setStoreData(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data toko:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStore();
  }, []);

  // Fungsi untuk menyimpan perubahan ke Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          phone: storeData.phone,
          address: storeData.address,
        })
        .eq('id', storeData.id);

      if (error) throw error;
      alert('Berhasil menyimpan perubahan profil toko!');
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-2xl font-black uppercase">Memuat data...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Profil Toko</h1>
        <p className="text-lg font-medium text-gray-700 border-l-4 border-black pl-3">
          Atur informasi dasar toko atau cabang yang sedang aktif.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="storeName" className="block text-xl font-bold uppercase">Nama Toko / Cabang</label>
          <input 
            type="text" 
            id="storeName"
            value={storeData.name}
            onChange={(e) => setStoreData({...storeData, name: e.target.value})}
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-xl font-bold uppercase">Nomor Telepon</label>
          <input 
            type="text" 
            id="phone"
            value={storeData.phone || ''}
            onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="block text-xl font-bold uppercase">Alamat Lengkap</label>
          <textarea 
            id="address"
            rows={4}
            value={storeData.address || ''}
            onChange={(e) => setStoreData({...storeData, address: e.target.value})}
            className="w-full p-4 text-lg border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#F4F4F4] resize-none"
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-[#FFE800] disabled:bg-gray-400 disabled:shadow-none text-black border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-black text-xl uppercase tracking-wider"
          >
            {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
