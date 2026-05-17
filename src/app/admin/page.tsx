"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Plus, 
  Search,
  MoreVertical,
  Activity,
  ShieldCheck,
  Globe,
  Store,
  X,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createTenantAction } from "./actions";

interface TenantStats {
  id: string;
  name: string;
  owner_name: string;
  store_count: number;
  created_at: string;
  status: "active" | "trial" | "expired";
}

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    businessName: "",
    storeName: ""
  });
  const [globalStats, setGlobalStats] = useState({
    totalTenants: 0,
    totalStores: 0,
    totalTransactions: 0
  });

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // 1. Get All Businesses (Tenants)
      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select(`
          id, 
          name, 
          created_at,
          profiles (full_name)
        `);

      if (bizError) throw bizError;

      // 2. Get Store Counts for each Business
      const tenantData = await Promise.all((businesses || []).map(async (biz: any) => {
        const { count } = await supabase
          .from("stores")
          .select("*", { count: 'exact', head: true })
          .eq("business_id", biz.id);
        
        return {
          id: biz.id,
          name: biz.name,
          owner_name: biz.profiles?.[0]?.full_name || "Pemilik",
          store_count: count || 0,
          created_at: new Date(biz.created_at).toLocaleDateString("id-ID"),
          status: "active" as const
        };
      }));

      setTenants(tenantData);

      // 3. Global Platform Stats
      const { count: storeCount } = await supabase.from("stores").select("*", { count: 'exact', head: true });
      const { count: transCount } = await supabase.from("transactions").select("*", { count: 'exact', head: true });

      setGlobalStats({
        totalTenants: businesses?.length || 0,
        totalStores: storeCount || 0,
        totalTransactions: transCount || 0
      });

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createTenantAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ email: "", fullName: "", businessName: "", storeName: "" });
        fetchAdminData();
      } else {
        alert("Gagal: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <ShieldCheck className="text-yellow-400" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">Platform Admin</h1>
              <p className="font-bold text-slate-500 uppercase text-sm tracking-widest flex items-center gap-2">
                <Globe size={14} /> KelontongSync SaaS Management
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="neo-btn-primary bg-yellow-400 flex items-center gap-2 px-6 py-4 font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={24} /> Registrasi Tenant Baru
          </button>
        </div>

        {/* Platform Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neo-card bg-white flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 border-[3px] border-black flex items-center justify-center">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Bisnis (Tenants)</p>
              <p className="text-3xl font-black">{globalStats.totalTenants}</p>
            </div>
          </div>
          <div className="neo-card bg-white flex items-center gap-6">
            <div className="w-16 h-16 bg-purple-100 border-[3px] border-black flex items-center justify-center">
              <Store className="text-purple-600" size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Cabang Aktif</p>
              <p className="text-3xl font-black">{globalStats.totalStores}</p>
            </div>
          </div>
          <div className="neo-card bg-white flex items-center gap-6">
            <div className="w-16 h-16 bg-green-100 border-[3px] border-black flex items-center justify-center">
              <Activity className="text-green-600" size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Transaksi Platform</p>
              <p className="text-3xl font-black">{globalStats.totalTransactions.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="neo-card bg-white p-0 overflow-hidden">
          <div className="p-6 border-b-[4px] border-black flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-4">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <Users size={24} /> Daftar Tenant Terdaftar
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari Bisnis atau Pemilik..."
                className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-black font-bold focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b-[4px] border-black">
                  <th className="p-4 text-left font-black uppercase text-sm">Nama Bisnis</th>
                  <th className="p-4 text-left font-black uppercase text-sm">Pemilik</th>
                  <th className="p-4 text-center font-black uppercase text-sm">Cabang</th>
                  <th className="p-4 text-left font-black uppercase text-sm">Tgl Daftar</th>
                  <th className="p-4 text-left font-black uppercase text-sm">Status</th>
                  <th className="p-4 text-center font-black uppercase text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <TrendingUp className="animate-pulse text-yellow-500" size={48} />
                        <p className="font-black uppercase">Memuat Data Tenant...</p>
                      </div>
                    </td>
                  </tr>
                ) : tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black uppercase">{tenant.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">ID: {tenant.id.substring(0,8)}...</div>
                    </td>
                    <td className="p-4 font-bold">{tenant.owner_name}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 border-[2px] border-black px-3 py-1 font-black">
                        {tenant.store_count}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-500">{tenant.created_at}</td>
                    <td className="p-4">
                      <span className="bg-green-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="p-2 hover:bg-black hover:text-white border-[2px] border-transparent hover:border-black transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Tenant Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="neo-card bg-white max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-black text-white p-6 flex justify-between items-center border-b-[4px] border-black">
                <h3 className="text-xl font-black uppercase tracking-tight">Daftarkan Tenant Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:text-yellow-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateTenant} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400">Email Pemilik (Owner)</label>
                    <input 
                      type="email" required
                      className="w-full p-3 border-[3px] border-black font-bold focus:shadow-none transition-all mt-1"
                      placeholder="email@tenant.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400">Nama Lengkap Owner</label>
                    <input 
                      type="text" required
                      className="w-full p-3 border-[3px] border-black font-bold focus:shadow-none transition-all mt-1"
                      placeholder="Contoh: Budi Setiadi"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400">Nama Bisnis / Perusahaan</label>
                    <input 
                      type="text" required
                      className="w-full p-3 border-[3px] border-black font-bold focus:shadow-none transition-all mt-1"
                      placeholder="Contoh: Berkah Group"
                      value={formData.businessName}
                      onChange={e => setFormData({...formData, businessName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400">Nama Cabang Pertama</label>
                    <input 
                      type="text" required
                      className="w-full p-3 border-[3px] border-black font-bold focus:shadow-none transition-all mt-1"
                      placeholder="Contoh: Cabang Jakarta"
                      value={formData.storeName}
                      onChange={e => setFormData({...formData, storeName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 neo-btn-primary bg-slate-200 py-3 font-black uppercase"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 neo-btn-primary bg-yellow-400 py-3 font-black uppercase flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Simpan Tenant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
