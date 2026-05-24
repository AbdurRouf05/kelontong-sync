"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Store, Users, GitBranch, Lock } from 'lucide-react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard/settings/store', label: 'Profil Toko', bg: 'bg-[#FF90E8]', icon: <Store size={18} /> },
    { href: '/dashboard/settings/staff', label: 'Karyawan', bg: 'bg-[#23A094]', icon: <Users size={18} /> },
    { href: '/dashboard/settings/branches', label: 'Cabang', bg: 'bg-[#FF6B6B]', icon: <GitBranch size={18} /> },
    { href: '/dashboard/settings/password', label: 'Ubah Password', bg: 'bg-[#FFE800]', icon: <Lock size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Horizontal */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 border-b-[4px] border-black pb-4">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.href}
              href={tab.href} 
              className={`px-3 sm:px-6 py-2 sm:py-3 border-[3px] border-black font-black uppercase text-xs sm:text-sm tracking-wider sm:tracking-widest transition-all flex-1 text-center whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive 
                  ? `${tab.bg} text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 -translate-x-0.5 sm:-translate-y-1 sm:-translate-x-1` 
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Area Konten Utama */}
      <div>
        {children}
      </div>
    </div>
  );
}
