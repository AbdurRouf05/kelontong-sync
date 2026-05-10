"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Store, 
  ArrowRight,
  Zap,
  Coffee,
  Dog,
  ShoppingBag,
  Ticket,
  Star,
  Users,
  Cat,
  Cookie,
  Milk,
  Rabbit,
  MousePointer2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black pb-20 selection:bg-yellow-200 cursor-default">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b-[4px] border-black h-20 flex items-center px-6 md:px-12">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Store size={28} />
            </div>
            <span className="text-3xl font-black italic tracking-tighter uppercase">Kelontong<span className="text-green-500 underline decoration-black">Sync</span></span>
          </div>
          
          <div className="hidden lg:flex gap-8 font-bold text-lg">
            <Link href="#features" className="hover:bg-pink-400 px-2 border-black hover:border-b-2">Fitur</Link>
            <Link href="#solution" className="hover:bg-green-400 px-2 border-black hover:border-b-2">Solusi</Link>
            <Link href="#pricing" className="hover:bg-yellow-400 px-2 border-black hover:border-b-2">Harga</Link>
          </div>

          <div className="flex gap-4">
            <Link href="/login" className="neo-box px-6 py-2 font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
              <Users size={18} /> Masuk
            </Link>
            <Link href="/register" className="neo-btn-primary !py-2 flex items-center gap-2">
              <Zap size={18} className="fill-black" /> Daftar
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 mt-32">
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-12 items-center py-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-pink-400 border-[3px] border-black px-4 py-1 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]">
              <Cat size={20} /> <span>Warung Sembako Era Digital</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
              Kelola Toko <br />
              <span className="bg-yellow-400 border-[4px] border-black px-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Anti Pusing!</span>
            </h1>
            <p className="text-2xl font-bold max-w-xl leading-snug">
              Beralih ke sistem kasir modern dengan gaya <span className="bg-green-400 px-1 border-b-2 border-black">Neo-Brutalism</span>. Gak cuma keren, tapi bikin jualan makin sat-set!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link href="/register" className="neo-btn-primary text-2xl flex items-center gap-3 group">
                Mulai Sekarang! <ArrowRight strokeWidth={4} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-1 transition-transform">
                <div className="w-12 h-12 bg-purple-400 border-[2px] border-black flex items-center justify-center rounded-full">
                  <Rabbit size={24} />
                </div>
                <span className="font-bold text-lg leading-tight italic">Telah dipercaya <br /> 500+ Warung</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-black rotate-2 rounded-none"></div>
            <div className="relative bg-white border-[4px] border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-all">
              <div className="bg-yellow-100 border-[2px] border-black mb-4 p-2 font-black uppercase text-sm flex justify-between items-center">
                <span>🔴 Preview_Dashboard.exe</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 border-2 border-black bg-white"></div>
                  <div className="w-3 h-3 border-2 border-black bg-black"></div>
                </div>
              </div>
              <Image 
                src="/hero.png" 
                alt="Neobrutalism Dashboard" 
                width={800} 
                height={600}
                className="w-full h-auto grayscale contrast-125 border-[3px] border-black"
              />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-400 border-[3px] border-black flex items-center justify-center rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform">
                <Star size={44} className="fill-black" />
              </div>
              <div className="absolute bottom-4 right-4 bg-white border-[2px] border-black px-4 py-2 font-black animate-bounce">
                KLIK DISINI! 👆
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24">
          <div className="flex flex-col items-center mb-20">
            <h2 className="bg-black text-white text-4xl md:text-7xl font-black px-8 py-3 uppercase rotate-[-2deg] shadow-[10px_10px_0px_0px_rgba(74,222,128,1)]">
              KERJAAN JADI GAMPANG!
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                color: "bg-green-400", 
                icon: <ShoppingBag size={40} />, 
                title: "KASIR KILAT", 
                desc: "Transaksi sat-set tinggal klik. Gak perlu pake kalkulator lagi ampe puyeng!" 
              },
              { 
                color: "bg-blue-400", 
                icon: <Milk size={40} />, 
                title: "STOK AMAN", 
                desc: "Susu atau beras abis? Tenang, sistem bakal teriak ngasih tau sebelum barang kosong." 
              },
              { 
                color: "bg-pink-400", 
                icon: <BarChart3 size={40} />, 
                title: "CEK CUAN", 
                desc: "Mau tau untung berapa hari ini? Cek grafik laba-rugi yang gampang dibaca siapa aja." 
              },
              { 
                color: "bg-yellow-400", 
                icon: <Cookie size={40} />, 
                title: "JUALAN MANIS", 
                desc: "Atur harga diskon atau bundling dengan gampang biar pelanggan makin seneng belanja." 
              },
              { 
                color: "bg-purple-400", 
                icon: <Users size={40} />, 
                title: "MULTI CABANG", 
                desc: "Punya banyak warung? Semua dipantau dalam satu layar. Juragan tinggal ngopi aja!" 
              },
              { 
                color: "bg-orange-400", 
                icon: <Coffee size={40} />, 
                title: "TIM JAGA", 
                desc: "Ada masalah? Tim kami standby 24 jam buat bantuin kamu. Gak bakal ditinggal sendiri!" 
              }
            ].map((f, i) => (
              <div key={i} className={`neo-card ${f.color} hover:translate-x-[-8px] hover:translate-y-[-8px] transition-all cursor-pointer group`}>
                <div className="bg-white border-[3px] border-black p-4 w-fit mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-4xl font-black mb-4 uppercase leading-none">{f.title}</h3>
                <p className="text-xl font-bold leading-tight italic">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mascot / Fun Section */}
        <section className="py-20 text-center">
          <div className="inline-block bg-white border-[4px] border-black p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-32 bg-yellow-400 border-[3px] border-black flex items-center justify-center rounded-full shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Dog size={60} />
              </div>
              <div className="text-left space-y-4">
                <h3 className="text-4xl font-black uppercase">"Gak Pake Ribet, Gak Pake Mahal!"</h3>
                <p className="text-xl font-bold italic">
                  - Si Guguk, Maskot KelontongSync yang paling ngerti urusan warung.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-white p-12 md:p-20 mt-20 border-[6px] border-yellow-400 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.8]">
                MAU JADI <br /> <span className="text-yellow-400">JURAGAN <br /> SUKSES?</span>
              </h2>
              <p className="text-2xl font-bold text-slate-400 uppercase italic">
                Daftar sekarang atau nanti keburu disalip tetangga!
              </p>
            </div>
            <Link href="/register" className="bg-green-500 text-black px-12 py-8 text-4xl font-black uppercase border-[4px] border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[10px] hover:translate-y-[10px] transition-all">
              GASS DAFTAR! 🚀
            </Link>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-6 mt-40 grid md:grid-cols-2 gap-20 border-t-[6px] border-black pt-16">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pink-400 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Zap size={28} />
            </div>
            <span className="text-4xl font-black tracking-tighter uppercase italic">KelontongSync</span>
          </div>
          <p className="text-2xl font-bold leading-tight">
            UMKM Indonesia Naik Kelas! <br />
            Digitalisasi Warung Tanpa Pusing.
          </p>
          <div className="flex gap-4">
            {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 border-[2px] border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>)}
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-12">
          <div className="grid grid-cols-2 gap-12 text-2xl font-black uppercase">
            <div className="flex flex-col gap-4">
              <Link href="#" className="hover:bg-yellow-400 w-fit">GitHub</Link>
              <Link href="#" className="hover:bg-green-400 w-fit">Insta</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="#" className="hover:bg-pink-400 w-fit">Docs</Link>
              <Link href="#" className="hover:bg-blue-400 w-fit">Contact</Link>
            </div>
          </div>
          <div className="bg-black text-white px-4 py-1 text-lg font-black uppercase rotate-[-1deg]">
            © 2026 Kelompok 5 PPL
          </div>
        </div>
      </footer>
    </div>
  );
}
