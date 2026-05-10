"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard/settings/store', label: '🏠 Profil Toko', bg: 'bg-[#FF90E8]' },
    { href: '/dashboard/settings/staff', label: '👥 Karyawan', bg: 'bg-[#23A094]' },
    { href: '/dashboard/settings/branches', label: '🏪 Cabang', bg: 'bg-[#FF6B6B]' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Horizontal */}
      <div className="flex flex-wrap gap-4 border-b-[4px] border-black pb-4">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.href}
              href={tab.href} 
              className={`px-6 py-3 border-[3px] border-black font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? `${tab.bg} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1` 
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              {tab.label}
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
