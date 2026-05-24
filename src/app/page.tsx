"use client";

import { useState, useEffect } from "react";
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
  ArrowUpRight,
  HelpCircle,
  ChevronDown,
  Printer,
  Plus,
  Minus,
  Check,
  Sparkles,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- DATA STRUKTUR UNTUK FITUR ---
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

// --- DATA FAQ INTERAKTIF ---
const faqData = [
  {
    q: "Apakah saya bisa menggunakan KelontongSync di HP?",
    a: "Sangat bisa! Aplikasi ini dirancang sepenuhnya responsif, sehingga dapat diakses dengan nyaman melalui HP, Tablet, Laptop, maupun komputer kasir desktop tanpa perlu instalasi aplikasi tambahan."
  },
  {
    q: "Bagaimana cara kerja fitur Multi-Cabang?",
    a: "Fitur Multi-Cabang memungkinkan Anda mengelola stok produk global secara terpusat, lalu mendistribusikannya ke cabang mana pun. Anda dapat memantau stok, mempekerjakan kasir khusus di cabang tertentu, dan melihat statistik laba tiap cabang secara terpisah maupun gabungan."
  },
  {
    q: "Apakah data transaksi toko saya aman?",
    a: "Data Anda disimpan di cloud database terenkripsi berstandar tinggi yang didukung oleh Supabase. Kami menerapkan RLS (Row Level Security) yang sangat ketat sehingga data Anda dijamin tidak akan pernah tertukar atau diakses oleh pihak lain."
  },
  {
    q: "Apakah ada uji coba gratis sebelum berlangganan?",
    a: "Ya! Anda dapat langsung mendaftar secara gratis dan mencoba semua fitur unggulan KelontongSync selama 14 hari penuh tanpa perlu memasukkan kartu kredit."
  }
];

export default function LandingPage() {
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
        console.error("Global landing DB check error:", err);
        setDbStatus("error");
      }
    };
    checkConnection();
  }, []);

  // --- STATE INTERAKTIF SIMULASI KASIR POS DI HERO ---
  // Didesain khusus agar pengguna langsung bisa merasakan visualisasi POS KelontongSync
  const [items, setItems] = useState([
    { id: 1, name: "Susu Kotak Ultra", qty: 2, price: 6000 },
    { id: 2, name: "Mie Instan Goreng", qty: 5, price: 3000 },
    { id: 3, name: "Minyak Goreng 1L", qty: 1, price: 15000 }
  ]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // --- STATE FAQ ACCORDION ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Menghitung subtotal secara reaktif
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);

  // Handler mengubah kuantitas barang simulasi
  const updateQty = (id: number, delta: number) => {
    setCheckoutSuccess(false);
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  // Handler bayar simulasi
  const handleSimulatedPay = () => {
    if (subtotal === 0) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-yellow-400">
      
      {/* --- NAVBAR PREMIUM NEOBRUTALISM --- */}
      <nav className="sticky top-0 z-50 bg-white border-b-[4px] border-black px-6 py-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FFE800] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="font-black text-2xl uppercase tracking-tighter italic">
              KELONTONG<span className="text-[#23A094]">SYNC</span>
            </span>
          </div>

          {/* Menu Navigasi */}
          <div className="hidden md:flex items-center gap-8 font-black uppercase text-sm tracking-widest">
            <a href="#fitur" className="hover:text-[#23A094] transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[3px] after:bg-[#FFE800] after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Fitur</a>
            <a href="#simulasi" className="hover:text-[#23A094] transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[3px] after:bg-[#FFE800] after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Uji Coba POS</a>
            <a href="#harga" className="hover:text-[#23A094] transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[3px] after:bg-[#FFE800] after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Harga</a>
            <a href="#faq" className="hover:text-[#23A094] transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[3px] after:bg-[#FFE800] after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Tanya Jawab</a>
          </div>

          {/* CTA Akses Halaman */}
          <div className="flex items-center gap-4">
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

            <Link href="/login" className="font-black uppercase text-sm border-b-[3px] border-black hover:bg-slate-100 px-3 py-1 transition-all">
              Masuk
            </Link>
            <Link href="/register" className="neo-btn-primary !px-6 !py-3 !text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Kolom Informasi Utama */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FF90E8] border-[3px] border-black px-4 py-1.5 font-black uppercase tracking-widest text-xs rotate-[-1.5deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles size={14} className="text-black" /> WARUNG SEMBAKO ERA DIGITAL
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              KELOLA TOKO <br />
              <span className="inline-block bg-[#FFE800] px-4 py-1 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-2 rotate-[1deg]">
                ANTI PUSING!
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold text-gray-800 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Beralih ke sistem kasir & multi-cabang modern dengan gaya <span className="underline decoration-[#23A094] decoration-8 underline-offset-4 font-black">Neobrutalism</span>. Gak cuma keren, tapi bikin jualan warung makin sat-set!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <Link href="/register" className="neo-btn-primary !text-2xl !py-5 !px-10 flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
                MULAI DAFTAR <ArrowRight size={28} strokeWidth={3} />
              </Link>
              
              <div className="flex items-center justify-center gap-3 bg-white border-[3px] border-black px-5 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={16} strokeWidth={2.5} />
                  ))}
                </div>
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  4.9/5 Rating Kepuasan
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Visualisasi POS Kasir Interaktif (Glow-up UI) */}
          <div className="lg:col-span-5 relative" id="simulasi">
            <div className="absolute inset-0 bg-[#23A094] border-[4px] border-black translate-x-4 translate-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
            
            <div className="relative bg-white border-[4px] border-black p-5 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:rotate-0 transition-all duration-500">
              
              {/* Header Box Simulasi */}
              <div className="bg-black text-white px-4 py-2 font-black text-xs uppercase mb-4 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block animate-ping"></span>
                  LIVE_POS_SIMULATOR.EXE
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
                </div>
              </div>

              {/* Tampilan POS Simulator */}
              <div className="border-[3px] border-black p-4 bg-[#F4F4F0] space-y-4">
                <h4 className="font-black uppercase text-sm tracking-wide flex items-center gap-2 border-b-[2px] border-black pb-2">
                  <ShoppingCart size={18} /> Keranjang Kasir POS
                </h4>

                {/* Daftar Item dalam Keranjang */}
                {items.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-6 font-bold">Keranjang kosong. Tambah barang!</p>
                ) : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white border-[2px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div>
                          <p className="font-black text-xs uppercase">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 border-[2px] border-black flex items-center justify-center hover:bg-red-200 active:translate-y-0 transition-colors"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="font-black text-xs">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 border-[2px] border-black flex items-center justify-center hover:bg-green-200 active:translate-y-0 transition-colors"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotal */}
                <div className="border-t-[3px] border-black pt-3 flex justify-between items-center font-black">
                  <span className="text-xs uppercase">Total Pembayaran</span>
                  <span className="text-lg text-[#23A094]">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>

                {/* Tombol Bayar Simulasi */}
                <button 
                  onClick={handleSimulatedPay}
                  disabled={subtotal === 0 || isPrinting}
                  className="w-full py-3 bg-[#FFE800] border-[3px] border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>SEDANG MENCETAK STRUK...</span>
                    </>
                  ) : (
                    <>
                      <Printer size={16} />
                      <span>BAYAR & CETAK STRUK</span>
                    </>
                  )}
                </button>

                {/* Status Transaksi Sukses */}
                {checkoutSuccess && (
                  <div className="bg-[#4ade80] border-[2px] border-black p-2.5 text-center font-black text-xs uppercase animate-bounce flex items-center justify-center gap-1">
                    <Check size={16} strokeWidth={3} /> TRANSAKSI BERHASIL DICETAK!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOLUSI FITUR GRID --- */}
      <section id="fitur" className="py-24 px-6 bg-white border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Solusi Sempurna UMKM</h2>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Semua fitur hebat yang Anda butuhkan untuk naik kelas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="neo-card flex flex-col gap-6 group hover:translate-y-[-8px] transition-all bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className={`${f.color} w-16 h-16 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black uppercase leading-tight">{f.title}</h3>
                <p className="font-bold text-gray-600 leading-snug">{f.desc}</p>
                <Link href="/register" className="mt-auto flex items-center gap-2 font-black uppercase text-sm hover:translate-x-2 transition-transform text-[#23A094]">
                  Coba Sekarang <ChevronRight size={18} strokeWidth={3} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="harga" className="py-24 px-6 border-b-[4px] border-black">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Satu Harga, <br /> Selamanya.</h2>
          
          <div className="bg-white border-[4px] border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-8 right-[-50px] bg-[#FFE800] border-y-[4px] border-black px-20 py-2 font-black uppercase rotate-[35deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs tracking-wider">
              Diskon Juragan!
            </div>
            
            <p className="text-2xl font-bold uppercase tracking-widest text-[#23A094] mb-4">Paket Unlimited SaaS</p>
            
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-4xl font-black text-gray-400 line-through">Rp 250rb</span>
              <h3 className="text-7xl font-black tracking-tight">Rp 99rb<span className="text-xl">/bln</span></h3>
            </div>
            
            <ul className="grid sm:grid-cols-2 gap-4 text-left font-black uppercase text-sm mb-12 border-y-[3px] border-black py-8">
              {[
                "Unlimited Transaksi", 
                "Manajemen Multi-Cabang", 
                "Laporan Keuangan Real-time", 
                "Akses Kasir / Kasir POS", 
                "Integrasi QRIS Dinamis", 
                "Export Laporan Excel/PDF"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#23A094]" size={20} strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
            
            <Link href="/register" className="block neo-btn-primary w-full !text-2xl !py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center">
              MULAI COBA GRATIS 14 HARI!
            </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION INTERAKTIF ACCORDION --- */}
      {/* Ditambahkan baru untuk menaikkan nilai estetika dan informasi produk */}
      <section id="faq" className="py-24 px-6 bg-white border-b-[4px] border-black">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Pertanyaan Umum</h2>
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">Semua jawaban atas kebingungan Anda</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div 
                key={idx}
                className="border-[3px] border-black bg-[#F4F4F0] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Header FAQ */}
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center font-black uppercase text-base hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-[#23A094]" />
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={22} 
                    className={`transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`}
                    strokeWidth={3}
                  />
                </button>

                {/* Konten FAQ dengan transisi tinggi */}
                {openFaqIndex === idx && (
                  <div className="p-6 bg-white border-t-[3px] border-black font-bold text-slate-700 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SLIDER --- */}
      <section id="testimoni" className="py-24 px-6 bg-[#FFE800] border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-5xl font-black uppercase leading-[0.9]">Dengarkan Kata <br /> <span className="text-[#23A094]">Juragan</span> Lain</h2>
            <p className="text-xl font-bold">Kenapa mereka beralih dari pencatatan manual ke sistem modern KelontongSync.</p>
            <div className="flex gap-4">
              <div className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-4xl">
                4.9/5
              </div>
              <div className="font-bold">
                <div className="flex text-yellow-600">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
                </div>
                Rata-rata rating dari <br /> 2,000+ pemilik toko
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            <div className="bg-[#FF90E8] border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 rotate-[-1deg] hover:rotate-0 transition-transform">
              <p className="text-lg font-black italic">"Dulu stok sering ilang, gak tau kemana. Sekarang semua tercatat rapi. Kasir juga gak ribet ngitung kembalian lagi!"</p>
              <div className="flex items-center gap-4 border-t-[3px] border-black pt-4">
                <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center font-black">HT</div>
                <div>
                  <h4 className="font-black uppercase">H. Thohir</h4>
                  <p className="text-xs font-bold uppercase opacity-60">Pemilik Warung Berkah</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#23A094] border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 text-white rotate-[1deg] hover:rotate-0 transition-transform">
              <p className="text-lg font-black italic">"Fitur Multi-cabangnya gokil! Saya bisa pantau 3 cabang di pasar cuma dari HP sambil ngopi."</p>
              <div className="flex items-center gap-4 border-t-[3px] border-black pt-4">
                <div className="w-12 h-12 bg-white text-black border-[2px] border-black flex items-center justify-center font-black">AM</div>
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
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black uppercase text-xl text-[#FFE800]">Produk</h4>
              <ul className="space-y-4 font-bold text-gray-400 uppercase text-sm tracking-widest">
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur POS</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Inventaris</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Laporan</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Multi-Cabang</a></li>
              </ul>
            </div>
 
            <div className="space-y-6">
              <h4 className="font-black uppercase text-xl text-[#FF90E8]">Portal Khusus</h4>
              <ul className="space-y-4 font-bold text-gray-400 uppercase text-sm tracking-widest">
                <li><Link href="/admin" className="hover:text-white transition-colors">Superadmin Portal</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Kasir & Owner Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Registrasi Tenant</Link></li>
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
    </div>
  );
}
