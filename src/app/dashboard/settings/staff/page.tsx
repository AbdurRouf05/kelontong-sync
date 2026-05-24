"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit3, Trash2, X, Loader2, Shield, Store, User, UserCheck, Sparkles } from 'lucide-react';

// --- DATA TYPE UNTUK STAF / KARYAWAN ---
type Staff = {
  id: string;
  full_name: string;
  role: string;
  status: string;
  current_store_id: string;
  store_name?: string;
};

export default function StaffManagementPage() {
  // --- STATE MANAGEMENT ---
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [userContext, setUserContext] = useState<{ business_id: string; current_store_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // State notifikasi Toast Kustom Neobrutalism (menggantikan alert browser bawaan)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form input dengan default role "kasir"
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'kasir',
    current_store_id: '',
  });

  // Auto-hide Toast dalam 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- MEMUAT KONTEKS PENGGUNA MASUK (SaaS Context) ---
  const fetchUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Mengambil data bisnis dan cabang aktif yang sedang dipakai user aktif
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('business_id, current_store_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (profile) {
        setUserContext(profile);
        return profile;
      }
    } catch (error) {
      console.error('Gagal mendapatkan konteks user:', error);
    }
    return null;
  };

  // --- MEMUAT DAFTAR TOKO/CABANG (UNTUK DROP-DOWN PENUGASAN CABANG) ---
  const fetchStores = async (bizId: string) => {
    if (!bizId) return;
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('business_id', bizId)
        .order('name', { ascending: true });
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Gagal mengambil data cabang:', error);
    }
  };

  // --- MEMUAT DATA KARYAWAN (RELATIONAL JOIN DENGAN TOKO) ---
  const fetchStaff = async (bizId: string) => {
    if (!bizId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      // Melakukan join query untuk mendapatkan nama toko/cabang penugasan
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          role, 
          current_store_id,
          stores ( name )
        `)
        .eq('business_id', bizId)
        .order('full_name', { ascending: true });

      if (error) throw error;
      if (data) {
        setStaffList(data.map((item: any) => ({
          id: item.id,
          full_name: item.full_name || 'Karyawan Tanpa Nama',
          role: item.role || 'kasir',
          status: 'Aktif',
          current_store_id: item.current_store_id || '',
          store_name: item.stores?.name || 'Belum Ditugaskan',
        })));
      }
    } catch (error) {
      console.error('Gagal mengambil data karyawan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Inisialisasi awal halaman
  useEffect(() => {
    const init = async () => {
      const context = await fetchUserContext();
      if (context && context.business_id) {
        await fetchStores(context.business_id);
        await fetchStaff(context.business_id);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // --- MEMBUKA MODAL EDIT / TAMBAH ---
  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        role: staff.role,
        current_store_id: staff.current_store_id || (stores.length > 0 ? stores[0].id : ''),
      });
    } else {
      setEditingStaff(null);
      setFormData({ 
        full_name: '', 
        role: 'kasir', 
        current_store_id: stores.length > 0 ? stores[0].id : '' 
      });
    }
    setIsModalOpen(true);
  };

  // --- SUBMIT DATA KARYAWAN (INSERT / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userContext) {
      setToast({ message: 'Akses ditolak. Sesi tidak valid.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            current_store_id: formData.current_store_id,
          })
          .eq('id', editingStaff.id);
        
        if (error) throw error;
        setToast({ message: 'Karyawan berhasil diperbarui!', type: 'success' });
      } else {
        // --- LOGIKA INSERT (DENGAN SKEMA SAAS BARU) ---
        const { error } = await supabase
          .from('profiles')
          .insert([{ 
            id: crypto.randomUUID(),
            full_name: formData.full_name, 
            role: formData.role,
            business_id: userContext.business_id,
            current_store_id: formData.current_store_id || userContext.current_store_id
          }]);

        if (error) throw error;
        setToast({ message: 'Karyawan baru berhasil ditambahkan!', type: 'success' });
      }
      
      setIsModalOpen(false);
      fetchStaff(userContext.business_id);
    } catch (error: any) {
      setToast({ message: 'Gagal menyimpan: ' + error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MENGHAPUS DATA KARYAWAN ---
  const handleDelete = async (id: string) => {
    if (userContext && id === userContext.current_store_id) {
      setToast({ message: 'Anda tidak dapat menghapus akun Anda sendiri!', type: 'error' });
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setToast({ message: 'Karyawan berhasil dihapus.', type: 'success' });
      if (userContext) fetchStaff(userContext.business_id);
    } catch (error: any) {
      setToast({ message: 'Gagal menghapus: ' + error.message, type: 'error' });
    }
  };

  // --- BADGE GAYA PERAN ---
  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-[#FFE800] text-black border-black';
      case 'super_admin':
        return 'bg-[#FF90E8] text-black border-black';
      default:
        return 'bg-[#23A094] text-white border-black';
    }
  };

  // --- WARNA AVATAR ACAK UNTUK SETIAP KARTU ---
  const getRandomBgColor = (name: string) => {
    const colors = ['bg-[#FF90E8]', 'bg-[#FFE800]', 'bg-[#23A094]', 'bg-[#FF6B6B]', 'bg-[#4ade80]'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // --- RENDERING TAMPILAN UTAMA (PREMIUM CARD GRID NEOBRUTALISM) ---
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-2">👥 Manajemen Akun Karyawan</h1>
          <p className="font-bold text-slate-500 uppercase text-xs sm:text-sm tracking-wider sm:tracking-widest">
            Kelola hak akses karyawan, kasir, dan admin untuk bisnis Anda.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="neo-btn-primary flex items-center justify-center gap-2 bg-[#FFE800] w-full md:w-auto"
        >
          <Plus size={20} /> TAMBAH KARYAWAN
        </button>
      </div>

      {/* Konten Daftar Karyawan */}
      {isLoading ? (
        <div className="neo-card flex flex-col justify-center items-center py-20 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="animate-spin text-black mb-4" size={48} />
          <p className="font-black uppercase tracking-widest text-slate-500 text-sm">Memuat Karyawan...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="neo-card p-20 text-center text-slate-400 italic font-bold bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Belum ada karyawan terdaftar dalam sistem bisnis Anda.
        </div>
      ) : (
        /* Kartu Grid Neobrutalisme Baru */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div 
              key={staff.id} 
              className="neo-card bg-white p-4 sm:p-6 relative group flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
            >
              {/* Menu Tombol Aksi - Selalu Tampil di Mobile, Hover di Desktop */}
              <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => handleOpenModal(staff)} 
                  className="p-1.5 sm:p-2 bg-white text-black border-[2px] border-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all"
                >
                  <Edit3 size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(staff.id)} 
                  className="p-1.5 sm:p-2 bg-white text-red-600 border-[2px] border-black hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              <div>
                {/* Bagian Profil Utama */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 pr-16 sm:pr-0">
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-none border-[3px] border-black flex items-center justify-center font-black text-base sm:text-xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${getRandomBgColor(staff.full_name)} shrink-0`}>
                    {staff.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-black line-clamp-1">{staff.full_name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className={`px-1.5 py-0.5 border-[2px] text-[8px] sm:text-[10px] font-black uppercase ${getRoleBadgeStyle(staff.role)}`}>
                        {staff.role === 'owner' ? '👑 OWNER' : '💼 KASIR'}
                      </span>
                      <span className="px-1.5 py-0.5 border-[2px] border-black bg-[#4ade80] text-black text-[8px] sm:text-[10px] font-black uppercase">
                        ✅ {staff.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Penugasan Cabang / Lokasi Kerja */}
                <div className="border-t-[3px] border-dashed border-black pt-4 mt-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm uppercase">
                    <Store size={16} className="text-black" />
                    <span>Ditugaskan di:</span>
                  </div>
                  <p className="text-black font-black uppercase text-base mt-1 pl-6">
                    {staff.store_name}
                  </p>
                </div>
              </div>

              {/* Lencana Bagian Bawah */}
              <div className="w-full text-center py-2 bg-slate-100 border-[2px] border-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-1">
                <UserCheck size={14} /> INFORMASI HAK AKSES AKTIF
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FORM MODAL DIALOG (TAMBAH / EDIT KARYAWAN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-md p-0 overflow-hidden">
            {/* Header Modal */}
            <div className="p-6 border-b-[4px] border-black bg-[#23A094] text-white flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Sparkles size={24} /> {editingStaff ? 'Edit Karyawan' : 'Tambah Karyawan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 border-[2px] border-transparent transition-all">
                <X size={24} />
              </button>
            </div>
            
            {/* Form Konten */}
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {/* Input Nama Karyawan */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                <input 
                  type="text" required
                  placeholder="Masukkan nama lengkap karyawan..."
                  className="w-full p-3 neo-box font-bold focus:outline-none"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              {/* Pilihan Hak Akses */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Peran Hak Akses (Role)</label>
                <select 
                  className="w-full p-3 neo-box font-bold focus:outline-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="kasir">💼 KASIR (Akses Kasir POS)</option>
                  <option value="owner">👑 OWNER (Akses Penuh Bisnis)</option>
                </select>
              </div>

              {/* Pilihan Penugasan Cabang / Lokasi Kerja */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tugaskan di Cabang</label>
                <select 
                  className="w-full p-3 neo-box font-bold focus:outline-none cursor-pointer"
                  value={formData.current_store_id}
                  onChange={(e) => setFormData({...formData, current_store_id: e.target.value})}
                >
                  {stores.length === 0 ? (
                    <option value="">Belum ada cabang terdaftar</option>
                  ) : (
                    stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name.toUpperCase()}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Tombol Simpan/Batal */}
              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all text-sm"
                >
                  BATAL
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="neo-btn-primary flex-1 py-4 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NOTIFIKASI TOAST KUSTOM --- */}
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
