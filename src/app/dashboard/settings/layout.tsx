import Link from 'next/link';
import { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF4E0] p-4 md:p-8 text-black font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigasi */}
        <aside className="w-full md:w-72 flex-shrink-0 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden h-fit">
          <div className="p-5 bg-[#FFE800] border-b-4 border-black">
            <h2 className="text-2xl font-black uppercase tracking-tight">⚙️ Pengaturan</h2>
          </div>
          <nav className="flex flex-col p-5 gap-4">
            <Link 
              href="/dashboard/settings/store" 
              className="px-5 py-3 bg-[#FF90E8] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-bold flex items-center gap-3"
            >
              <span className="text-xl">🏠</span>
              Profil Toko
            </Link>
            <Link 
              href="/dashboard/settings/staff" 
              className="px-5 py-3 bg-[#23A094] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-bold flex items-center gap-3"
            >
              <span className="text-xl">👥</span>
              Manajemen Karyawan
            </Link>
            <Link 
              href="/dashboard/settings/branches" 
              className="px-5 py-3 bg-[#FF6B6B] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-bold flex items-center gap-3"
            >
              <span className="text-xl">🏪</span>
              Multi-Cabang
            </Link>
          </nav>
        </aside>

        {/* Area Konten Utama */}
        <main className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden min-h-[60vh]">
          {children}
        </main>
        
      </div>
    </div>
  );
}
