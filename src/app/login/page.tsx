"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Store
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check Role for redirection
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, business_id")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Handle user without profile (New registration)
      if (!profile) {
        // Option 1: Redirect to onboarding
        router.push("/onboarding");
        return;
      }

      if (profile.role === "superadmin") {
        router.push("/admin");
      } else if (!profile.business_id) {
        // User has profile but no business yet
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 bg-yellow-400 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
            <Store size={28} />
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter">KelontongSync</span>
        </Link>

        {/* Login Card */}
        <div className="neo-card bg-white p-8">
          <h1 className="text-2xl font-black uppercase mb-2">Selamat Datang</h1>
          <p className="font-bold text-slate-500 text-sm mb-8">Masuk ke akun KelontongSync Anda</p>

          {error && (
            <div className="bg-red-100 border-[3px] border-black p-4 mb-6 flex items-center gap-3 animate-shake">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Email</label>
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
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full neo-btn-primary bg-yellow-400 py-4 font-black flex items-center justify-center gap-2 text-lg hover:bg-yellow-300"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>MASUK <ArrowRight size={24} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-[3px] border-black text-center">
            <p className="font-bold text-sm text-slate-500">
              Belum punya akun? {" "}
              <Link href="/register" className="text-black underline font-black decoration-2 hover:text-blue-600 transition-colors">
                Daftar Gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 font-bold text-slate-400 text-xs uppercase tracking-widest">
          &copy; 2026 KelontongSync SaaS Platform
        </p>
      </div>
    </div>
  );
}
