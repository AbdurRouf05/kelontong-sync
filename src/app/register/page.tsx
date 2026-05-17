"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Store,
  CheckCircle,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  // --- STATE UNTUK LANGKAH PENDAFTARAN (STEPPER FORM) ---
  const [step, setStep] = useState(1);
  
  // --- STATE STRUKTUR DATA REGISTRASI SAAS ---
  // Ditata rapi mencakup Pemilik, Entitas Bisnis, dan Cabang Utama pertama
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [businessName, setBusinessName] = useState("");
  
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // --- LOGIKA TRANSISI ANTAR LANGKAH ---
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!fullName || !email || !password) {
        setError("Harap isi semua kolom informasi pemilik!");
        return;
      }
      if (password.length < 6) {
        setError("Kata sandi harus minimal 6 karakter!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!businessName) {
        setError("Harap masukkan nama usaha Anda!");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  // --- LOGIKA UTAMA SUBMIT PENDAFTARAN INTEGRATIF ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. DAFTARKAN PENGGUNA DI SUPABASE AUTH
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) throw signUpError;
      const user = authData.user;
      if (!user) throw new Error("Gagal membuat akun.");

      // 2. DAFTARKAN ENTITAS BISNIS UTAMA (TENANT)
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .insert([{
          name: businessName,
          owner_id: user.id
        }])
        .select()
        .single();

      if (bizError) throw bizError;

      // 3. DAFTARKAN CABANG UTAMA PERTAMA (FIRST STORE)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert([{
          business_id: bizData.id,
          name: branchName || "Cabang Utama",
          address: address || "Belum ada alamat",
          phone: phone || "Belum ada telepon"
        }])
        .select()
        .single();

      if (storeError) throw storeError;

      // 4. BUAT PROFIL PEMILIK (OWNER PROFILE)
      // Mengaitkan User ID, ID Bisnis, dan ID Cabang Aktif saat ini secara utuh
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          business_id: bizData.id,
          current_store_id: storeData.id,
          full_name: fullName,
          role: 'owner'
        }]);

      if (profileError) throw profileError;

      // 5. INISIALISASI PENGATURAN STRUKTURAL TOKO AWAL
      await supabase.from('store_settings').insert([{
        store_id: storeData.id,
        receipt_footer: "Terima kasih atas kunjungan Anda!",
        low_stock_threshold: 5
      }]);

      // Mengubah state menjadi sukses pendaftaran
      setIsSuccess(true);
      
      // Auto redirect ke halaman login setelah 3 detik
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat pendaftaran. Harap coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo KelontongSync */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 bg-yellow-400 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
            <Store size={28} />
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter text-black">KelontongSync</span>
        </Link>

        {isSuccess ? (
          /* --- TAMPILAN LAYAR SUKSES --- */
          <div className="neo-card bg-white p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-[#4ade80] border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle size={44} className="text-black" />
            </div>
            <h1 className="text-3xl font-black uppercase">Pendaftaran Berhasil!</h1>
            <p className="font-bold text-slate-500">
              Akun, usaha, dan cabang utama Anda telah sukses didaftarkan. Mengalihkan Anda ke halaman masuk...
            </p>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-black" size={32} />
            </div>
          </div>
        ) : (
          /* --- FORM UTAMA STEPS PENDAFTARAN --- */
          <div className="neo-card bg-white p-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black uppercase">Daftar Akun Gratis</h1>
              {/* Lencana Langkah Aktif */}
              <span className="bg-[#FF90E8] px-3 py-1 border-[2px] border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Langkah {step} dari 3
              </span>
            </div>
            <p className="font-bold text-slate-500 text-sm mb-6">Mulai kelola bisnis kelontong Anda secara modern</p>

            {/* Stepper Indikator Bar */}
            <div className="flex gap-2 mb-8">
              <div className={`h-3 flex-1 border-[2px] border-black transition-all duration-300 ${step >= 1 ? "bg-yellow-400" : "bg-white"}`} />
              <div className={`h-3 flex-1 border-[2px] border-black transition-all duration-300 ${step >= 2 ? "bg-yellow-400" : "bg-white"}`} />
              <div className={`h-3 flex-1 border-[2px] border-black transition-all duration-300 ${step >= 3 ? "bg-yellow-400" : "bg-white"}`} />
            </div>

            {/* Tampilan Error jika validasi gagal */}
            {error && (
              <div className="bg-red-100 border-[3px] border-black p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            {/* LANGKAH 1: Informasi Detail Pemilik */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nama Pemilik</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      required
                      placeholder="Nama lengkap Anda..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="anda@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      placeholder="Minimal 6 karakter..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full neo-btn-primary bg-yellow-400 py-4 font-black flex items-center justify-center gap-2 text-lg hover:bg-yellow-300"
                >
                  LANJUT <ArrowRight size={24} />
                </button>
              </form>
            )}

            {/* LANGKAH 2: Informasi Detail Usaha */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nama Usaha / Toko</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Toko Sembako Berkah, Kelontong Jaya"
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 font-black border-[3px] border-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    <ArrowLeft size={18} /> KEMBALI
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 neo-btn-primary bg-yellow-400 py-4 font-black flex items-center justify-center gap-2 text-sm hover:bg-yellow-300"
                  >
                    LANJUT <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* LANGKAH 3: Cabang Pertama & Detail Lokasi */}
            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nama Cabang Pertama</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Contoh: Cabang Utama, Toko Pusat (Opsional)"
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Lokasi / Alamat Usaha</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Alamat lengkap lokasi usaha Anda..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nomor Telepon Usaha</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Contoh: 08123456789"
                      className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    disabled={isLoading}
                    onClick={handlePrevStep}
                    className="flex-1 py-4 font-black border-[3px] border-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50"
                  >
                    <ArrowLeft size={18} /> KEMBALI
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 neo-btn-primary bg-yellow-400 py-4 font-black flex items-center justify-center gap-2 text-sm hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>DAFTAR SEKARANG <Sparkles size={18} /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t-[3px] border-black text-center">
              <p className="font-bold text-sm text-slate-500">
                Sudah memiliki akun? {" "}
                <Link href="/login" className="text-black underline font-black decoration-2 hover:text-blue-600 transition-colors">
                  Masuk Sekarang
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Footer Hak Cipta */}
        <p className="text-center mt-8 font-bold text-slate-400 text-xs uppercase tracking-widest">
          &copy; 2026 KelontongSync SaaS Platform
        </p>
      </div>
    </div>
  );
}
