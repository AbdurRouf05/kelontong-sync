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
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name: string, role: string, store_name: string } | null>(null);

  // --- STATE KONEKSI DATABASE GLOBALLY DI HEADER ---
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const startTime = performance.now();
      try {
        const { error, status } = await supabase.from("profiles").select("id").limit(1);
        if (error && status !== 406) throw error;
        const endTime = performance.now();
        setDbLatency(Math.round(endTime - startTime));
        setDbStatus("connected");
      } catch (err) {
        console.error("Global header DB check error:", err);
        setDbStatus("error");
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, stores(name)")
        .eq("id", user.id)
        .single();

      if (data) {
        setUserProfile({
          full_name: data.full_name || "User",
          role: data.role || "staff",
          store_name: (data.stores as any)?.name || "Cabang Utama"
        });
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} />, role: "all" },
    { name: "POS (Kasir)", href: "/dashboard/pos", icon: <ShoppingCart size={20} />, role: "all" },
    { name: "Inventaris", href: "/dashboard/inventory", icon: <Package size={20} />, role: "all" },
    { name: "Laporan", href: "/dashboard/reports", icon: <BarChart3 size={20} />, role: "all" },
    { name: "Kelola Cabang", href: "/dashboard/management", icon: <Store size={20} />, role: "owner" },
    { name: "Pengaturan", href: "/dashboard/settings", icon: <Settings size={20} />, role: "all" },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.role === "all" || item.role === userProfile?.role
  );

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex relative">
      {/* Sidebar - Desktop */}
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
          {visibleMenuItems.map((item) => {
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

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-[4px] border-black transition-transform duration-300 md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b-[4px] border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 border-[2px] border-black flex items-center justify-center">
              <Store size={18} />
            </div>
            <span className="font-black uppercase tracking-tighter text-xl">KSync</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          {visibleMenuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 p-3 font-bold border-[3px] transition-all ${
                pathname === item.href
                  ? "bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  : "border-transparent hover:border-black hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b-[4px] border-black flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2 bg-yellow-400 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight truncate max-w-[150px] md:max-w-none">
              {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Database Connection Indicator Pill */}
            <div 
              onClick={async () => {
                setDbStatus("checking");
                const startTime = performance.now();
                try {
                  const { error, status } = await supabase.from("profiles").select("id").limit(1);
                  if (error && status !== 406) throw error;
                  setDbLatency(Math.round(performance.now() - startTime));
                  setDbStatus("connected");
                } catch {
                  setDbStatus("error");
                }
              }}
              title={dbStatus === "connected" ? `Koneksi Supabase Aktif (Latensi: ${dbLatency}ms) - Klik untuk tes ulang` : "Klik untuk tes ulang koneksi database"}
              className={`cursor-pointer border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-3 py-1 text-xs font-black uppercase flex items-center gap-1.5 transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none ${
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

            <div className="hidden sm:block bg-green-400 border-[3px] border-black px-4 py-1 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase text-sm">
              {userProfile?.store_name || "Memuat..."} 🏪
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-sm md:text-base font-black">
              {userProfile?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

