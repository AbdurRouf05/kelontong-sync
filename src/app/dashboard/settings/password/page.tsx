"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State untuk Notifikasi Toast Kustom
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast dalam 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validasi input
    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru harus minimal 6 karakter!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setIsSaving(true);
    try {
      // Panggil API Supabase Auth untuk memperbarui password user yang sedang login aktif
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setToast({ message: "Kata sandi Anda berhasil diperbarui!", type: "success" });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error("Gagal memperbarui sandi:", err);
      setToast({ message: "Gagal memperbarui sandi: " + err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="neo-card bg-white p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header Form */}
      <div className="mb-6 sm:mb-8 border-b-[3px] border-dashed border-black pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
          <Lock className="w-6 h-6 sm:w-9 sm:h-9 shrink-0 text-black" /> Keamanan & Kata Sandi
        </h1>
        <p className="font-bold text-slate-500 uppercase text-xs sm:text-sm tracking-wider sm:tracking-widest">
          Perbarui kata sandi akun KelontongSync Anda secara aman.
        </p>
      </div>

      {/* Form Input */}
      <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
        {errorMsg && (
          <div className="bg-red-100 border-[3px] border-black p-4 font-bold text-red-600 text-sm flex items-center gap-2 animate-shake">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Input Kata Sandi Baru */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
            <Lock size={12} className="text-black" /> Kata Sandi Baru
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              placeholder="Minimal 6 karakter..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 sm:p-4 pr-12 text-sm sm:text-lg neo-box bg-[#F4F4F4] font-bold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
            <Lock size={12} className="text-black" /> Konfirmasi Kata Sandi
          </label>
          <input 
            type={showPassword ? "text" : "password"} 
            required
            placeholder="Ketik ulang kata sandi baru..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 sm:p-4 text-sm sm:text-lg neo-box bg-[#F4F4F4] font-bold focus:outline-none"
          />
        </div>

        {/* Tombol Simpan */}
        <div className="pt-2">
          <button 
            type="submit"
            disabled={isSaving}
            className="neo-btn-primary bg-[#FFE800] hover:bg-yellow-300 uppercase tracking-wider flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>PERBARUI KATA SANDI</span>
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
