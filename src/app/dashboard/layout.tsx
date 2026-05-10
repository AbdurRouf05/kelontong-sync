"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Store,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} />, owner: "Adam" },
    { name: "POS (Kasir)", href: "/dashboard/pos", icon: <ShoppingCart size={20} />, owner: "Rafi" },
    { name: "Inventaris", href: "/dashboard/inventory", icon: <Package size={20} />, owner: "Akmal" },
    { name: "Laporan", href: "/dashboard/reports", icon: <BarChart3 size={20} />, owner: "Adam" },
    { name: "Pengaturan", href: "/dashboard/settings", icon: <Settings size={20} />, owner: "Gombet" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-72" : "w-20"} bg-white border-r-[4px] border-black transition-all duration-300 flex flex-col hidden md:flex`}>
        <div className="p-6 border-b-[4px] border-black flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 border-[2px] border-black flex items-center justify-center">
                <Store size={18} />
              </div>
              <span className="font-black uppercase tracking-tighter text-xl">KSync</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 border-[2px] border-transparent hover:border-black transition-all">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 p-3 font-bold border-[3px] transition-all ${
                  isActive 
                    ? "bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "border-transparent hover:border-black hover:bg-slate-50"
                }`}
              >
                <div className={`${isActive ? "text-black" : "text-slate-500"}`}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">PIC: {item.owner}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-[4px] border-black">
          <button className="w-full flex items-center gap-4 p-3 font-bold text-red-500 hover:bg-red-50 border-[3px] border-transparent hover:border-black transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b-[4px] border-black flex items-center justify-between px-8">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-green-400 border-[3px] border-black px-4 py-1 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
              Toko Berkah Utama 🏪
            </div>
            <div className="w-12 h-12 bg-pink-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              👤
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
