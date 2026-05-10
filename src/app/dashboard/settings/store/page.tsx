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
    <div className="neo-card">
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Profil Toko</h1>
        <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
          Atur informasi dasar toko atau cabang yang sedang aktif.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="storeName" className="block text-xs font-black uppercase tracking-widest text-slate-400">Nama Toko / Cabang</label>
          <input 
            type="text" 
            id="storeName"
            value={storeData.name}
            onChange={(e) => setStoreData({...storeData, name: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-400">Nomor Telepon</label>
          <input 
            type="text" 
            id="phone"
            value={storeData.phone || ''}
            onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="block text-xs font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</label>
          <textarea 
            id="address"
            rows={4}
            value={storeData.address || ''}
            onChange={(e) => setStoreData({...storeData, address: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4] resize-none"
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="neo-btn-primary uppercase tracking-wider"
          >
            {isSaving ? 'MENYIMPAN...' : '💾 SIMPAN PERUBAHAN'}
          </button>
        </div>
      </form>
    </div>
  );
}
