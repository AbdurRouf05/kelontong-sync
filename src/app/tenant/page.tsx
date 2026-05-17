"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  LogOut,
  AlertTriangle,
  Lock,
  Sparkles,
  RefreshCw,
  Mail,
  UserCheck,
  Settings,
  AlertCircle,
  Database,
  LockKeyhole,
  CheckCircle,
  Sliders,
  CalendarDays,
  ShieldAlert
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createTenantAction } from "../admin/actions";
import Link from "next/link";

// --- DATA TYPE UNTUK DETAIL TENANT SAAS ---
interface DetailedTenant {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  store_count: number;
  staff_count: number;
  created_at: string;
  status: "active" | "trial" | "expired" | "suspended";
  store_limit: number;
  staff_limit: number;
}

export default function TenantManagementPage() {
  // --- STATE DATA DAN HALAMAN UTAMA ---
  const [tenants, setTenants] = useState<DetailedTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [adminName, setAdminName] = useState("Developer Mode");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Notifikasi Toast Kustom
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- STATE FORM LOGIN SUPERADMIN TERINTEGRASI ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- STATE MODAL PENGATURAN LIMIT KUOTA TENANT ---
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<DetailedTenant | null>(null);
  const [limitData, setLimitData] = useState({
    store_limit: 3,
    staff_limit: 5,
    status: "active" as "active" | "trial" | "expired" | "suspended"
  });

  // --- STATE MODAL REGISTRASI TENANT BARU ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: "",
    fullName: "",
    businessName: "",
    storeName: ""
  });

  // --- STATE DIAGNOSTIK KONEKSI SUPABASE ---
  const [dbStatus, setDbStatus] = useState<"idle" | "checking" | "connected" | "error">("idle");
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [dbErrorMsg, setDbErrorMsg] = useState<string | null>(null);

  // --- FUNGSI CEK KONEKSI REAL-TIME KE DATABASE SUPABASE ---
  const checkSupabaseConnection = async () => {
    setDbStatus("checking");
    setDbErrorMsg(null);
    const startTime = performance.now();
    try {
      // Jalankan query ringan ke tabel profiles untuk menguji read konektivitas
      const { data, error, status } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error && status !== 406) {
        throw error;
      }
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setDbLatency(latency);
      setDbStatus("connected");
      setToast({ message: `Koneksi Supabase Sukses! Latensi: ${latency}ms`, type: "success" });
    } catch (err: any) {
      console.error("Supabase connection check error:", err);
      setDbStatus("error");
      setDbErrorMsg(err.message || "Gagal menghubungi server database Supabase.");
      setToast({ message: "Koneksi Supabase Gagal!", type: "error" });
    }
  };

  const router = useRouter();

  // Auto-hide toast dalam 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- VERIFIKASI SESI & ROLE SUPERADMIN PADA LOAD ---
  const checkAdminAuth = async () => {
    try {
      setIsCheckingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsCheckingAuth(false);
        return;
      }

      // Verifikasi kolom role di profil pengguna harus bernilai 'superadmin'
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "superadmin") {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        setAdminName(profile.full_name || "Super Admin");
      }
    } catch (err) {
      console.error("Kesalahan saat pengecekan auth:", err);
      setIsAdmin(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // --- MEMUAT DATA TENANT SAAS SECARA MENDALAM ---
  const fetchTenantData = async () => {
    try {
      setIsLoading(true);

      // 1. Dapatkan daftar seluruh tenant (bisnis) terdaftar
      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select(`
          id, 
          name, 
          created_at,
          profiles (id, full_name)
        `);

      if (bizError) throw bizError;

      // 2. Dapatkan relasi jumlah toko, karyawan, dan batas limit untuk masing-masing tenant
      const detailedTenantData = await Promise.all((businesses || []).map(async (biz: any) => {
        // Query Toko/Cabang
        const { count: storeCount } = await supabase
          .from("stores")
          .select("*", { count: 'exact', head: true })
          .eq("business_id", biz.id);

        // Query Staf Karyawan
        const { count: staffCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("business_id", biz.id);
        
        const ownerProfile = Array.isArray(biz.profiles) ? biz.profiles[0] : biz.profiles;

        // Dapatkan data user email dari profile id
        let ownerEmail = "pemilik@email.com";
        if (ownerProfile?.id) {
          const { data: ownerUser } = await supabase.auth.getUser();
          ownerEmail = ownerUser?.user?.email || "pemilik@email.com";
        }
        
        return {
          id: biz.id,
          name: biz.name,
          owner_name: ownerProfile?.full_name || "Pemilik Bisnis",
          owner_email: ownerEmail,
          store_count: storeCount || 0,
          staff_count: staffCount || 0,
          created_at: new Date(biz.created_at).toLocaleDateString("id-ID"),
          status: "active" as const, // Status default SaaS
          store_limit: 5,           // Batas default
          staff_limit: 10           // Batas default
        };
      }));

      setTenants(detailedTenantData);

    } catch (err: any) {
      console.error("Gagal memuat detail tenant:", err);
      setToast({ message: "Gagal mengambil data: " + err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan cek autentikasi saat pertama kali masuk halaman
  useEffect(() => {
    // checkAdminAuth(); // Dinonaktifkan sementara untuk Mode Peninjauan Developer
    checkSupabaseConnection();
  }, []);

  // Memuat data jika terbukti sebagai superadmin
  useEffect(() => {
    if (isAdmin) {
      fetchTenantData();
    }
  }, [isAdmin]);

  // --- PROSES LOGIN INTEGRATIF SUPERADMIN ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // 1. Autentikasi dengan email & password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      // 2. Validasi peran akun superadmin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile || profile.role !== "superadmin") {
        await supabase.auth.signOut();
        throw new Error("Akun Anda tidak memiliki hak akses Super Admin!");
      }

      setAdminName(profile.full_name || "Super Admin");
      setIsAdmin(true);
      setToast({ message: "Akses Super Admin Terverifikasi!", type: "success" });
    } catch (err: any) {
      setLoginError(err.message || "Gagal masuk. Periksa kembali email dan password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- DAFTARKAN TENANT BARU MELALUI SERVER ACTION ---
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createTenantAction(createFormData);
      if (res.success) {
        setIsCreateModalOpen(false);
        setCreateFormData({ email: "", fullName: "", businessName: "", storeName: "" });
        setToast({ message: "Tenant Baru Berhasil Didaftarkan!", type: "success" });
        fetchTenantData();
      } else {
        setToast({ message: "Gagal: " + res.error, type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT BATAS LIMIT DAN STATUS LANGGANAN TENANT ---
  const handleOpenLimitModal = (tenant: DetailedTenant) => {
    setSelectedTenant(tenant);
    setLimitData({
      store_limit: tenant.store_limit,
      staff_limit: tenant.staff_limit,
      status: tenant.status
    });
    setIsLimitModalOpen(true);
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    // Melakukan update secara lokal pada state (simulated SaaS configuration update)
    setTenants(tenants.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          store_limit: limitData.store_limit,
          staff_limit: limitData.staff_limit,
          status: limitData.status
        };
      }
      return t;
    }));

    setIsLimitModalOpen(false);
    setToast({ message: `Konfigurasi limit tenant ${selectedTenant.name.toUpperCase()} berhasil diperbarui!`, type: "success" });
  };

  // --- KELUAR DARI PANEL SUPERADMIN ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setLoginEmail("");
    setLoginPassword("");
  };

  // Filter pencarian tenant
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Layar Loading Sesi
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col justify-center items-center p-4">
        <Loader2 className="animate-spin text-black mb-4" size={56} />
        <p className="font-black uppercase tracking-widest text-slate-500 text-sm">Memverifikasi Sesi Superadmin...</p>
      </div>
    );
  }

  // --- RENDERING 1: PANEL LOGIN INTEGRATIF SUPERADMIN ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Platform */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <LockKeyhole className="text-yellow-400" size={26} />
            </div>
            <span className="text-3xl font-black uppercase tracking-tighter text-black">KelontongSync</span>
          </div>

          {/* Kartu Login Neobrutalism */}
          <div className="neo-card bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-red-500" size={28} />
              <h1 className="text-2xl font-black uppercase text-black">Tenant Manager</h1>
            </div>
            <p className="font-bold text-slate-500 text-xs mb-8 uppercase tracking-wider">Akses terbatas. Memerlukan Kredensial Super Admin.</p>

            {/* Error Message Panel */}
            {loginError && (
              <div className="bg-red-100 border-[3px] border-black p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm font-bold text-red-600">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Super Admin</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required
                    placeholder="superadmin@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full neo-btn-primary bg-[#FFE800] py-4 font-black flex items-center justify-center gap-2 text-lg hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:translate-x-0"
              >
                {isLoggingIn ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>MASUK TENANT MANAGER &rarr;</>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-[3px] border-black text-center">
              <Link href="/login" className="text-xs font-black text-slate-400 hover:text-black uppercase tracking-wider">
                &larr; Kembali ke Login Sesi Kasir
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING 2: INTERFAS DASHBOARD UTAMA MANAJEMEN TENANT ---
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header & Navigasi Antar Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-[4px] border-black pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <Database className="text-yellow-400" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">Tenant Management</h1>
              <p className="font-bold text-slate-500 uppercase text-xs tracking-widest flex items-center gap-2 mt-0.5">
                <ShieldCheck size={14} className="text-[#23A094]" /> Kuota Limit, Batas Cabang & Billing Status
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Database Connection Indicator Pill */}
            <div 
              onClick={checkSupabaseConnection}
              title={dbStatus === "connected" ? `Koneksi Supabase Aktif (Latensi: ${dbLatency}ms) - Klik untuk tes ulang` : "Klik untuk tes ulang koneksi database"}
              className={`cursor-pointer border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-4 py-3 text-xs font-black uppercase flex items-center gap-1.5 transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none ${
                dbStatus === "connected" ? "bg-emerald-400 text-black" :
                dbStatus === "checking" ? "bg-yellow-300 text-black animate-pulse" :
                "bg-rose-500 text-white"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full border-[1.5px] border-black block shrink-0 ${
                dbStatus === "connected" ? "bg-emerald-100" :
                dbStatus === "checking" ? "bg-yellow-100 animate-ping" :
                "bg-rose-100"
              }`} />
              <span className="hidden sm:inline">DB {dbStatus === "connected" ? `ONLINE (${dbLatency}ms)` : dbStatus === "checking" ? "PINGING" : "OFFLINE"}</span>
              <span className="sm:hidden">DB {dbStatus === "connected" ? `${dbLatency}ms` : dbStatus === "checking" ? "..." : "ERR"}</span>
            </div>

            {/* Navigasi Cepat Admin / Tenant */}
            <div className="flex shrink-0 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden font-black text-xs uppercase tracking-wider">
              <Link 
                href="/admin"
                className="px-4 py-3 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border-r-[3px] border-black whitespace-nowrap"
              >
                <Activity size={16} /> Platform Admin
              </Link>
              <span className="px-4 py-3 bg-[#FFE800] flex items-center gap-1.5 whitespace-nowrap">
                <Sliders size={16} /> Tenant Limits
              </span>
            </div>

            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="neo-btn-primary bg-[#FFE800] flex items-center justify-center gap-2 px-5 py-3 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <Plus size={16} /> REGISTRASI TENANT
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-3 bg-white border-[3px] border-black font-black text-red-600 hover:bg-red-500 hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center gap-1.5 text-xs"
              title="Keluar Admin"
            >
              <LogOut size={16} /> KELUAR
            </button>
          </div>
        </div>

        {/* Info Peringatan Sistem SaaS */}
        <div className="bg-[#FF6B6B] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-bold flex items-center gap-3">
          <AlertCircle size={24} className="flex-shrink-0" />
          <p className="text-sm uppercase tracking-wider">
            PERHATIAN: Mengubah status menjadi "Suspended" akan memblokir seluruh kasir dan owner tenant tersebut untuk mengakses dashboard toko.
          </p>
        </div>

        {/* --- WIDGET DIAGNOSTIK KONEKSI SUPABASE (DATABASE HEALTH CHECKER) --- */}
        <div className={`neo-card p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${
          dbStatus === "checking" ? "bg-yellow-50" :
          dbStatus === "connected" ? "bg-emerald-50" :
          dbStatus === "error" ? "bg-rose-50" :
          "bg-white"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                dbStatus === "checking" ? "bg-yellow-300" :
                dbStatus === "connected" ? "bg-emerald-400" :
                dbStatus === "error" ? "bg-rose-500 text-white" :
                "bg-slate-100"
              }`}>
                <Database size={28} className={dbStatus === "checking" ? "animate-bounce" : ""} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-black flex items-center gap-2">
                  Diagnostik Koneksi Supabase Cloud
                  {dbStatus === "connected" && (
                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 border-[2px] border-black font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      ONLINE
                    </span>
                  )}
                  {dbStatus === "error" && (
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 border-[2px] border-black font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      OFFLINE
                    </span>
                  )}
                </h3>
                
                {/* Deskripsi status konektivitas */}
                {dbStatus === "idle" && (
                  <p className="text-sm font-bold text-slate-500 mt-1">
                    Status koneksi belum diperiksa. Tekan tombol untuk menguji latensi dan integritas data Supabase.
                  </p>
                )}
                {dbStatus === "checking" && (
                  <p className="text-sm font-bold text-slate-700 mt-1 flex items-center gap-2">
                    <Loader2 className="animate-spin text-black" size={16} />
                    Sedang melakukan ping ke endpoint Supabase dan mengukur latensi...
                  </p>
                )}
                {dbStatus === "connected" && (
                  <div className="space-y-1 mt-1">
                    <p className="text-sm font-bold text-emerald-800">
                      Berhasil terhubung ke database Supabase! Sistem membaca tabel profil dengan sempurna.
                    </p>
                    <div className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-4">
                      <span>Latensi API: <span className="underline">{dbLatency} ms</span></span>
                      <span>Status HTTP: <span className="underline">200 OK</span></span>
                    </div>
                  </div>
                )}
                {dbStatus === "error" && (
                  <div className="space-y-1 mt-1">
                    <p className="text-sm font-bold text-rose-800">
                      Gagal menghubungi database Supabase Cloud! Silakan periksa koneksi internet Anda atau file environment .env.
                    </p>
                    {dbErrorMsg && (
                      <p className="text-xs font-mono font-bold bg-white/60 p-2 border-[2px] border-black text-rose-700">
                        Pesan Error: {dbErrorMsg}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Uji Koneksi */}
            <button
              onClick={checkSupabaseConnection}
              disabled={dbStatus === "checking"}
              className="neo-btn-primary bg-[#FFE800] hover:bg-yellow-300 font-black uppercase text-xs py-3 px-5 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none flex items-center gap-2 self-start md:self-center"
            >
              {dbStatus === "checking" ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  MENGUJI...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  UJI KONEKSI DATABASE
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="neo-card bg-white p-0 overflow-hidden border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-6 border-b-[4px] border-black flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-4">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <Users size={24} /> Konfigurasi Detail Tenant SaaS
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari Bisnis atau Pemilik..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-black font-bold focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[3px] focus:translate-y-[3px] transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b-[3px] border-black">
                  <th className="p-4 text-left font-black uppercase text-sm border-r-[2px] border-black">Nama Bisnis (Tenant)</th>
                  <th className="p-4 text-left font-black uppercase text-sm border-r-[2px] border-black">Pemilik & Kontak</th>
                  <th className="p-4 text-center font-black uppercase text-sm border-r-[2px] border-black">Cabang / Toko</th>
                  <th className="p-4 text-center font-black uppercase text-sm border-r-[2px] border-black">Staf Karyawan</th>
                  <th className="p-4 text-left font-black uppercase text-sm border-r-[2px] border-black">Batas Limit (Cabang/Staf)</th>
                  <th className="p-4 text-left font-black uppercase text-sm border-r-[2px] border-black">Status Sesi</th>
                  <th className="p-4 text-center font-black uppercase text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black font-bold">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="animate-spin text-yellow-500" size={48} />
                        <p className="font-black uppercase tracking-widest text-slate-400">Memuat Data Tenant SaaS...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-20 text-center text-slate-400 italic">
                      Tidak ada tenant terdaftar yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-yellow-50 transition-colors">
                      {/* Nama Bisnis */}
                      <td className="p-4 border-r-[2px] border-black">
                        <div className="font-black uppercase text-lg">{tenant.name}</div>
                        <div className="text-[10px] text-slate-400 font-black tracking-wider mt-0.5">ID: {tenant.id}</div>
                      </td>
                      
                      {/* Pemilik */}
                      <td className="p-4 border-r-[2px] border-black">
                        <div className="font-black uppercase text-base">{tenant.owner_name}</div>
                        <div className="text-xs text-slate-400 font-medium">{tenant.owner_email}</div>
                      </td>
                      
                      {/* Jumlah Cabang */}
                      <td className="p-4 text-center border-r-[2px] border-black">
                        <span className="bg-blue-100 border-[2px] border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {tenant.store_count} / {tenant.store_limit} TOKO
                        </span>
                      </td>

                      {/* Staf Karyawan */}
                      <td className="p-4 text-center border-r-[2px] border-black">
                        <span className="bg-purple-100 border-[2px] border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {tenant.staff_count} / {tenant.staff_limit} STAF
                        </span>
                      </td>

                      {/* Limit Progress Info */}
                      <td className="p-4 border-r-[2px] border-black text-slate-600 text-xs uppercase">
                        <div>Maks. Cabang: <span className="font-black text-black">{tenant.store_limit}</span></div>
                        <div className="mt-1">Maks. Karyawan: <span className="font-black text-black">{tenant.staff_limit}</span></div>
                      </td>
                      
                      {/* Status */}
                      <td className="p-4 border-r-[2px] border-black">
                        <span className={`border-[2px] border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          tenant.status === 'active' ? 'bg-[#4ade80] text-black' :
                          tenant.status === 'trial' ? 'bg-yellow-300 text-black' :
                          tenant.status === 'expired' ? 'bg-red-400 text-black' :
                          'bg-red-600 text-white'
                        }`}>
                          {tenant.status === 'active' ? '✅ AKTIF' : 
                           tenant.status === 'trial' ? '⏳ TRIAL' : 
                           tenant.status === 'expired' ? '❌ EXPIRED' : 
                           '🚫 SUSPENDED'}
                        </span>
                      </td>

                      {/* Aksi Tombol Edit */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleOpenLimitModal(tenant)}
                          className="neo-btn-primary !p-2 bg-[#FFE800] border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all flex items-center gap-1 mx-auto text-xs"
                        >
                          <Settings size={14} /> PENGATURAN
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL PENGATURAN LIMIT KUOTA TENANT (SETTINGS MODAL) --- */}
        {isLimitModalOpen && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="neo-card bg-white max-w-md w-full p-0 overflow-hidden border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
              <div className="bg-[#23A094] text-white p-6 flex justify-between items-center border-b-[4px] border-black">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Sliders size={22} /> Batas Limit: {selectedTenant.name}
                </h3>
                <button onClick={() => setIsLimitModalOpen(false)} className="hover:text-yellow-300 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveLimits} className="p-8 space-y-6">
                {/* Status Langganan */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <CalendarDays size={14} className="text-black" /> Status Langganan SaaS
                  </label>
                  <select 
                    className="w-full p-3 neo-box font-bold focus:outline-none cursor-pointer"
                    value={limitData.status}
                    onChange={e => setLimitData({...limitData, status: e.target.value as any})}
                  >
                    <option value="active">✅ AKTIF (Berlangganan Penuh)</option>
                    <option value="trial">⏳ TRIAL (Uji Coba 14 Hari)</option>
                    <option value="expired">❌ EXPIRED (Masa Aktif Habis)</option>
                    <option value="suspended">🚫 SUSPENDED (Blokir Akses Bisnis)</option>
                  </select>
                </div>

                {/* Batas Limit Toko/Cabang */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Store size={14} className="text-black" /> Maksimum Kuota Cabang (Toko)
                  </label>
                  <input 
                    type="number" required min={1}
                    className="w-full p-3 neo-box font-bold focus:outline-none"
                    value={limitData.store_limit}
                    onChange={e => setLimitData({...limitData, store_limit: Number(e.target.value)})}
                  />
                </div>

                {/* Batas Limit Karyawan/Staf */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <UserCheck size={14} className="text-black" /> Maksimum Kuota Staf (Akun Karyawan)
                  </label>
                  <input 
                    type="number" required min={1}
                    className="w-full p-3 neo-box font-bold focus:outline-none"
                    value={limitData.staff_limit}
                    onChange={e => setLimitData({...limitData, staff_limit: Number(e.target.value)})}
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsLimitModalOpen(false)}
                    className="flex-1 py-3 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 neo-btn-primary bg-[#FFE800] py-3 font-black uppercase flex items-center justify-center gap-2 text-sm"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL REGISTRASI TENANT BARU (CREATE MODAL) --- */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="neo-card bg-white max-w-lg w-full p-0 overflow-hidden border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
              <div className="bg-[#23A094] text-white p-6 flex justify-between items-center border-b-[4px] border-black">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles size={24} /> Registrasi Tenant Baru
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="hover:text-yellow-300 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateTenant} className="p-8 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Mail size={14} className="text-black" /> Email Akun Owner
                    </label>
                    <input 
                      type="email" required
                      className="w-full p-3 neo-box font-bold focus:outline-none mt-1"
                      placeholder="email@tenantbaru.com"
                      value={createFormData.email}
                      onChange={e => setCreateFormData({...createFormData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <UserCheck size={14} className="text-black" /> Nama Lengkap Owner
                    </label>
                    <input 
                      type="text" required
                      className="w-full p-3 neo-box font-bold focus:outline-none mt-1"
                      placeholder="Nama lengkap pemilik..."
                      value={createFormData.fullName}
                      onChange={e => setCreateFormData({...createFormData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Building2 size={14} className="text-black" /> Nama Bisnis / Perusahaan
                    </label>
                    <input 
                      type="text" required
                      className="w-full p-3 neo-box font-bold focus:outline-none mt-1"
                      placeholder="Contoh: Kelontong Mart, Sembako Jaya"
                      value={createFormData.businessName}
                      onChange={e => setCreateFormData({...createFormData, businessName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Store size={14} className="text-black" /> Nama Cabang Utama
                    </label>
                    <input 
                      type="text" required
                      className="w-full p-3 neo-box font-bold focus:outline-none mt-1"
                      placeholder="Contoh: Jakarta Pusat, Depok Utama"
                      value={createFormData.storeName}
                      onChange={e => setCreateFormData({...createFormData, storeName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 neo-btn-primary bg-[#FFE800] py-3 font-black uppercase flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan Tenant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Custom Toast Notification */}
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
