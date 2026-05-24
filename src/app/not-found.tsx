"use client";

import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Neobrutalist 404 Card */}
        <div className="neo-card bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-20 h-20 bg-rose-400 border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="text-black" size={40} />
          </div>

          <h1 className="text-6xl font-black uppercase tracking-tighter text-black mb-2">404</h1>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Halaman Tidak Ditemukan</h2>
          
          <p className="font-bold text-slate-500 text-sm mb-8 leading-relaxed uppercase">
            Maaf, halaman yang Anda cari tidak ada atau Anda tidak memiliki izin untuk mengaksesnya.
          </p>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="w-full neo-btn-primary bg-[#FFE800] py-4 font-black flex items-center justify-center gap-2 text-md hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:translate-x-0 border-[3px] border-black text-black"
            >
              <ArrowLeft size={20} /> KEMBALI KE LOGIN
            </Link>

            <Link 
              href="/" 
              className="w-full py-4 font-black flex items-center justify-center gap-2 text-md hover:bg-slate-100 border-[3px] border-black transition-all bg-white text-black"
            >
              <Home size={20} /> KE HALAMAN UTAMA
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 font-bold text-slate-400 text-xs uppercase tracking-widest">
          &copy; 2026 KelontongSync SaaS Platform
        </p>
      </div>
    </div>
  );
}
