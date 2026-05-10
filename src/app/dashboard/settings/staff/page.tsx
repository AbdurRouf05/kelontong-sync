"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit3, Trash2, X, Loader2 } from 'lucide-react';

type Staff = {
  id: string;
  full_name: string;
  role: string;
  status: string;
};

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'kasir',
  });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true });

      if (error) throw error;
      if (data) {
        setStaffList(data.map(item => ({ ...item, status: 'Aktif' })));
      }
    } catch (error) {
      console.error('Gagal mengambil data karyawan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Ambil ID toko pertama untuk dihubungkan ke karyawan baru (Mock)
      const { data: storeData } = await supabase.from('stores').select('id').limit(1).single();
      
      if (!storeData) {
        throw new Error('Tidak ada toko terdaftar. Silakan buat cabang toko dulu!');
      }

      const { error } = await supabase
        .from('profiles')
        .insert([{ 
          id: crypto.randomUUID(), // Buat ID di sini agar Supabase tidak protes 'null'
          full_name: formData.full_name, 
          role: formData.role,
          store_id: storeData.id
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ full_name: '', role: 'kasir' });
      fetchStaff();
    } catch (error: any) {
      alert('Gagal menambah karyawan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchStaff();
    } catch (error: any) {
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">👥 Karyawan</h1>
          <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
            Kelola akses karyawan untuk cabang ini.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neo-btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> TAMBAH KARYAWAN
        </button>
      </div>

      <div className="neo-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#23A094] text-white border-b-[4px] border-black uppercase text-lg font-black">
              <th className="p-4 border-r-[3px] border-black">Nama Lengkap</th>
              <th className="p-4 border-r-[3px] border-black">Peran</th>
              <th className="p-4 border-r-[3px] border-black">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-black">
                  <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                  <p className="font-black uppercase tracking-widest">Memuat Karyawan...</p>
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-400 italic font-bold">
                  Belum ada karyawan terdaftar.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b-[3px] border-black last:border-b-0 hover:bg-slate-50 transition-colors font-bold text-lg">
                  <td className="p-4 border-r-[3px] border-black">{staff.full_name}</td>
                  <td className="p-4 border-r-[3px] border-black">
                    <span className="bg-[#FFE800] px-3 py-1 border-[2px] border-black text-xs font-black uppercase text-black">
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 border-r-[3px] border-black">
                    <span className={`px-3 py-1 border-[2px] border-black text-xs font-black uppercase text-white ${staff.status === 'Aktif' ? 'bg-[#FF6B6B]' : 'bg-gray-500'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 bg-white border-[2px] border-black hover:bg-yellow-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(staff.id)} className="p-2 bg-white border-[2px] border-black hover:bg-red-500 hover:text-white text-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-md p-0 overflow-hidden">
            <div className="p-6 border-b-[4px] border-black bg-[#23A094] text-white flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight">Tambah Karyawan</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 border-[2px] border-transparent transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                <input 
                  type="text" required
                  className="w-full p-3 neo-box font-bold focus:outline-none"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Peran (Role)</label>
                <select 
                  className="w-full p-3 neo-box font-bold focus:outline-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="kasir">KASIR</option>
                  <option value="owner">OWNER</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all">
                  BATAL
                </button>
                <button type="submit" disabled={isSubmitting} className="neo-btn-primary flex-1 py-4 disabled:opacity-50">
                  {isSubmitting ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
