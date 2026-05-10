"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit3, Trash2, X, Loader2, Store } from 'lucide-react';

type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive?: boolean;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        // Mock active status (the first one is active for demo purposes)
        setBranches(data.map((item, index) => ({ ...item, isActive: index === 0 })));
      }
    } catch (error) {
      console.error('Gagal mengambil data cabang:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        const { error } = await supabase
          .from('stores')
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
          })
          .eq('id', editingBranch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stores')
          .insert([{
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
          }]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchBranches();
    } catch (error: any) {
      alert('Gagal menyimpan cabang: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus cabang ini secara permanen? Semua data stok akan hilang!')) return;
    try {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw error;
      fetchBranches();
    } catch (error: any) {
      alert('Gagal menghapus cabang: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">🏪 Multi-Cabang</h1>
          <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
            Kelola dan pindah antar cabang toko yang Anda miliki.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="neo-btn-primary flex items-center gap-2 bg-[#FFE800]"
        >
          <Store size={20} /> BUKA CABANG BARU
        </button>
      </div>

      {isLoading ? (
        <div className="neo-card flex justify-center py-20">
          <Loader2 className="animate-spin text-black" size={48} />
        </div>
      ) : branches.length === 0 ? (
        <div className="neo-card p-20 text-center text-slate-400 italic font-bold">
          Belum ada cabang toko terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div 
              key={branch.id} 
              className={`neo-card transition-all relative group ${
                branch.isActive 
                  ? 'bg-[#23A094] text-white' 
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              {branch.isActive && (
                <div className="absolute -top-4 -right-4 bg-[#FF6B6B] text-white px-4 py-1 border-[3px] border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-12 z-10">
                  Aktif
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(branch)} className="p-2 bg-white text-black border-[2px] border-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all">
                  <Edit3 size={16} />
                </button>
                {!branch.isActive && (
                  <button onClick={() => handleDelete(branch.id)} className="p-2 bg-white text-red-600 border-[2px] border-black hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-black uppercase mb-2 pr-20">{branch.name}</h2>
              <p className={`font-bold mb-6 text-sm ${branch.isActive ? 'text-green-100' : 'text-slate-500'}`}>
                📍 {branch.address || 'Belum ada alamat'} <br/>
                📞 {branch.phone || 'Belum ada nomor telepon'}
              </p>
              
              <div className="flex gap-3">
                {!branch.isActive && (
                  <button className="flex-1 py-3 bg-[#FF90E8] text-black border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all font-black uppercase text-sm">
                    🔄 PINDAH KE SINI
                  </button>
                )}
                {branch.isActive && (
                  <div className="w-full text-center py-3 bg-white/20 border-[3px] border-transparent font-black uppercase text-sm">
                    SEDEANG DIGUNAKAN
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-lg p-0 overflow-hidden">
            <div className="p-6 border-b-[4px] border-black bg-[#FFE800] flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight">
                {editingBranch ? 'Edit Cabang' : 'Buka Cabang Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-black/10 border-[2px] border-transparent transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Cabang</label>
                <input 
                  type="text" required
                  className="w-full p-3 neo-box font-bold focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nomor Telepon</label>
                <input 
                  type="text"
                  className="w-full p-3 neo-box font-bold focus:outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 neo-box font-bold focus:outline-none resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
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
