"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Store, Phone, MapPin, Save, Sparkles } from 'lucide-react';

export default function StoreProfilePage() {
  // --- STATE PENGELOLAAN DATA TOKO ---
  const [storeData, setStoreData] = useState({ id: '', name: '', phone: '', address: '' });
  const [userContext, setUserContext] = useState<{ business_id: string; current_store_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- STATE UNTUK NOTIFIKASI TOAST KUSTOM ---
  // Ditambahkan untuk menggantikan browser alert() bawaan agar senada dengan Neobrutalism UI
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Efek samping untuk menghilangkan notifikasi Toast secara otomatis setelah 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- MEMUAT DATA SECARA DINAMIS (SAAS ARCHITECTURE) ---
  // Mengambil data toko yang SEDANG AKTIF digunakan oleh user, bukan sekedar toko acak.
  useEffect(() => {
    async function init() {
      try {
        // 1. Dapatkan informasi sesi user yang sedang aktif
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // 2. Ambil profile untuk mengetahui current_store_id & business_id aktif
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('business_id, current_store_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // 3. Tarik profil cabang/toko yang sesuai dengan current_store_id
        if (profile) {
          setUserContext(profile);
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', profile.current_store_id)
            .single();

          if (error) throw error;
          if (data) {
            setStoreData(data);
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data toko:', error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // --- FUNGSI UNTUK MENYIMPAN PERUBAHAN KE SUPABASE ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData.id) return;
    
    setIsSaving(true);
    try {
      // Update data toko/cabang ke Supabase berdasarkan ID toko aktif
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          phone: storeData.phone,
          address: storeData.address,
        })
        .eq('id', storeData.id);

      if (error) throw error;
      
      // Menggunakan Toast kustom alih-alih alert() bawaan
      setToast({ message: 'Berhasil menyimpan perubahan profil toko!', type: 'success' });
    } catch (error: any) {
      console.error('Gagal menyimpan:', error);
      setToast({ message: 'Gagal menyimpan: ' + error.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERING LOADING STATE ---
  if (isLoading) {
    return (
      <div className="neo-card flex flex-col justify-center items-center py-20 bg-white">
        <Loader2 className="animate-spin text-black mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-slate-500 text-sm">Memuat data toko...</p>
      </div>
    );
  }

  // --- RENDERING FORM UTAMA ---
  // Dirombak menggunakan gaya Neobrutalism yang tebal, tegas, dan berikon indah
  return (
    <div className="neo-card bg-white p-8">
      {/* Bagian Header Form */}
      <div className="mb-8 border-b-[3px] border-dashed border-black pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
            <Store size={36} /> Profil Toko & Cabang
          </h1>
          <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
            Atur informasi dasar toko atau cabang yang sedang aktif digunakan.
          </p>
        </div>
        {/* Lencana Cabang Aktif */}
        <div className="bg-[#FFE800] px-4 py-2 border-[3px] border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs flex items-center gap-1">
          <Sparkles size={14} /> Cabang Aktif
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Input Nama Cabang */}
        <div className="space-y-2">
          <label htmlFor="storeName" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
            <Store size={14} className="text-black" /> Nama Toko / Cabang
          </label>
          <input 
            type="text" 
            id="storeName"
            required
            placeholder="Masukkan nama toko atau cabang..."
            value={storeData.name}
            onChange={(e) => setStoreData({...storeData, name: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4] font-bold focus:outline-none"
          />
        </div>

        {/* Input Telepon */}
        <div className="space-y-2">
          <label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
            <Phone size={14} className="text-black" /> Nomor Telepon
          </label>
          <input 
            type="text" 
            id="phone"
            placeholder="Masukkan nomor telepon cabang..."
            value={storeData.phone || ''}
            onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4] font-bold focus:outline-none"
          />
        </div>

        {/* Input Alamat Cabang */}
        <div className="space-y-2">
          <label htmlFor="address" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
            <MapPin size={14} className="text-black" /> Alamat Lengkap
          </label>
          <textarea 
            id="address"
            rows={4}
            placeholder="Masukkan alamat lengkap cabang..."
            value={storeData.address || ''}
            onChange={(e) => setStoreData({...storeData, address: e.target.value})}
            className="w-full p-4 text-lg neo-box bg-[#F4F4F4] font-bold focus:outline-none resize-none"
          ></textarea>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="neo-btn-primary bg-[#FF6B6B] hover:bg-[#ff5555] uppercase tracking-wider flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>MENYIMPAN...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>SIMPAN PERUBAHAN</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* --- RENDER NOTIFIKASI TOAST KUSTOM --- */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 border-[3px] border-black font-black uppercase tracking-wider animate-in slide-in-from-right-full duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${toast.type === 'success' ? 'bg-[#4ade80] text-black' : 'bg-[#FF6B6B] text-white'
          }`}>
          {toast.type === 'success' ? '✅ ' : '❌ '}
          {toast.message}
        </div>
      )}
    </div>
  );
}
