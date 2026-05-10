"use client";

import Link from "next/link";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight,
  Store,
  CheckCircle2,
  ChevronRight,
  Star,
  Users,
  Globe,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      title: "Kasir Cepat (POS)",
      desc: "Transaksi sat-set tanpa buffering. Dukungan scan barcode dan cetak struk instan.",
      icon: <ShoppingCart size={32} />,
      color: "bg-[#FF90E8]"
    },
    {
      title: "Manajemen Stok",
      desc: "Pantau ketersediaan barang secara real-time. Notifikasi otomatis saat stok menipis.",
      icon: <Package size={32} />,
      color: "bg-[#23A094]"
    },
    {
      title: "Laporan Pintar",
      desc: "Analisis laba rugi otomatis harian, mingguan, hingga bulanan dalam genggaman.",
      icon: <BarChart3 size={32} />,
      color: "bg-[#FFE800]"
    },
    {
      title: "Multi-Cabang",
      desc: "Kelola banyak toko dari satu akun. Pantau performa tiap cabang di mana saja.",
      icon: <Store size={32} />,
      color: "bg-[#FF6B6B]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-yellow-400">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b-[4px] border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FFE800] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="font-black text-2xl uppercase tracking-tighter italic">
              KELONTONG<span className="text-[#23A094]">SYNC</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-black uppercase text-sm tracking-widest">
            <a href="#fitur" className="hover:text-[#23A094] transition-colors">Fitur</a>
            <a href="#solusi" className="hover:text-[#23A094] transition-colors">Solusi</a>
            <a href="#harga" className="hover:text-[#23A094] transition-colors">Harga</a>
            <a href="#testimoni" className="hover:text-[#23A094] transition-colors">Testimoni</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block font-black uppercase text-sm border-b-2 border-transparent hover:border-black transition-all">
              Masuk
            </Link>
            <Link href="/register" className="neo-btn-primary !px-6 !py-2 !text-sm">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <div className="inline-block bg-[#FF90E8] border-[3px] border-black px-4 py-1 font-black uppercase tracking-widest text-xs rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🚀 Warung Sembako Era Digital
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              KELOLA TOKO <br />
              <span className="bg-[#FFE800] px-4 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                ANTI PUSING!
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-800 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Beralih ke sistem kasir modern dengan gaya <span className="underline decoration-[#23A094] decoration-8 underline-offset-4">Neobrutalism</span>. Gak cuma keren, tapi bikin jualan makin sat-set!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <button className="neo-btn-primary !text-2xl !py-6 !px-10 flex items-center justify-center gap-3">
                MULAI SEKARANG <ArrowRight size={28} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-4 bg-white border-[3px] border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-sm">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-[2px] border-black bg-pink-300 flex items-center justify-center text-xs">👤</div>
                  ))}
                </div>
                Telah dipercaya 500+ Warung
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#23A094] border-[4px] border-black translate-x-4 translate-y-4"></div>
            <div className="relative bg-white border-[4px] border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-[2deg] hover:rotate-0 transition-all duration-500">
              <div className="bg-black text-white px-4 py-1 font-black text-xs uppercase mb-4 flex justify-between">
                <span>PREVIEW_DASHBOARD.EXE</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000" 
                alt="Dashboard Preview" 
                className="w-full border-[3px] border-black grayscale contrast-125"
              />
              <div className="mt-4 p-4 border-t-[3px] border-black flex justify-between items-center bg-[#F4F4F0]">
                <span className="font-black italic">KLIK DISINI! 👉</span>
                <div className="w-10 h-10 bg-[#FF6B6B] border-[2px] border-black flex items-center justify-center rotate-12">
                  <Star fill="white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="fitur" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Solusi Sempurna UMKM</h2>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Semua yang Anda butuhkan untuk naik kelas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="neo-card flex flex-col gap-6 group hover:translate-y-[-8px] transition-all">
                <div className={`${f.color} w-16 h-16 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black uppercase leading-tight">{f.title}</h3>
                <p className="font-bold text-gray-600 leading-snug">{f.desc}</p>
                <button className="mt-auto flex items-center gap-2 font-black uppercase text-sm hover:translate-x-2 transition-transform">
                  Selengkapnya <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF / STATS --- */}
      <section className="py-16 border-y-[4px] border-black bg-[#23A094] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-12 mx-12 text-white font-black text-4xl uppercase italic">
              <span>Efisiensi Tinggi</span>
              <Zap size={40} fill="white" />
              <span>Manajemen Cerdas</span>
              <ShieldCheck size={40} fill="white" />
              <span>Akses Kapan Saja</span>
              <Smartphone size={40} fill="white" />
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="harga" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Satu Harga, <br /> Selamanya.</h2>
          <div className="bg-white border-[4px] border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-8 right-[-50px] bg-[#FFE800] border-y-[4px] border-black px-20 py-2 font-black uppercase rotate-[35deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Best Deal!
            </div>
            <p className="text-2xl font-bold uppercase tracking-widest text-gray-400 mb-4">Paket Juragan</p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-4xl font-black text-gray-400 line-through">Rp 250rb</span>
              <h3 className="text-7xl font-black tracking-tight">Rp 99rb<span className="text-xl">/bln</span></h3>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4 text-left font-black uppercase text-sm mb-12">
              {[
                "Unlimited Transaksi", "Manajemen 5 Cabang", "Laporan Keuangan Real-time", 
                "Support 24/7", "Integrasi QRIS", "Export Data Excel/PDF"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#23A094]" size={20} strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
            <button className="neo-btn-primary w-full !text-2xl !py-6">
              COBA GRATIS 14 HARI!
            </button>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="testimoni" className="py-24 px-6 bg-white border-t-[4px] border-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-5xl font-black uppercase leading-[0.9]">Dengarkan Kata <br /> <span className="text-[#23A094]">Juragan</span> Lain</h2>
            <p className="text-xl font-bold">Kenapa mereka beralih dari buku tulis ke KelontongSync.</p>
            <div className="flex gap-4">
              <div className="p-4 border-[3px] border-black bg-[#FFE800] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-4xl">
                4.9/5
              </div>
              <div className="font-bold">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={20} />)}
                </div>
                Rata-rata rating dari <br /> 2,000+ pengguna
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            <div className="bg-[#FF90E8] border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 rotate-[-1deg]">
              <p className="text-lg font-black italic">"Dulu stok sering ilang, gak tau kemana. Sekarang semua tercatat rapi. Kasir juga gak ribet ngitung kembalian lagi!"</p>
              <div className="flex items-center gap-4 border-t-[3px] border-black pt-4">
                <div className="w-12 h-12 bg-white border-[2px] border-black rounded-full flex items-center justify-center font-black">HT</div>
                <div>
                  <h4 className="font-black uppercase">H. Thohir</h4>
                  <p className="text-xs font-bold uppercase opacity-60">Pemilik Warung Berkah</p>
                </div>
              </div>
            </div>
            <div className="bg-[#23A094] border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 text-white rotate-[1deg]">
              <p className="text-lg font-black italic">"Fitur Multi-cabangnya gokil! Saya bisa pantau 3 cabang di pasar cuma dari HP sambil ngopi."</p>
              <div className="flex items-center gap-4 border-t-[3px] border-black pt-4">
                <div className="w-12 h-12 bg-white text-black border-[2px] border-black rounded-full flex items-center justify-center font-black">AM</div>
                <div>
                  <h4 className="font-black uppercase">Andi Mahesa</h4>
                  <p className="text-xs font-bold uppercase opacity-60 text-green-100">Owner Toko Kelontong Modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#FFE800] border-[2px] border-white flex items-center justify-center">
                  <Zap size={24} fill="black" className="text-black" />
                </div>
                <span className="font-black text-3xl uppercase italic tracking-tighter">KELONTONGSYNC</span>
              </div>
              <p className="text-xl text-gray-400 font-bold max-w-sm">
                Memberdayakan UMKM Indonesia dengan teknologi kasir tercanggih dan termudah.
              </p>
              <div className="flex gap-4">
                {["Twitter", "Instagram", "LinkedIn", "YouTube"].map(s => (
                  <button key={s} className="w-12 h-12 border-[2px] border-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <ArrowUpRight size={24} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black uppercase text-xl text-[#FFE800]">Produk</h4>
              <ul className="space-y-4 font-bold text-gray-400 uppercase text-sm tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors">Fitur POS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Inventaris</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laporan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Multi-Cabang</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black uppercase text-xl text-[#FF90E8]">Dukungan</h4>
              <ul className="space-y-4 font-bold text-gray-400 uppercase text-sm tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t-[1px] border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 font-bold uppercase text-[10px] tracking-[0.2em] text-gray-500">
            <p>© 2026 KELONTONGSYNC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
