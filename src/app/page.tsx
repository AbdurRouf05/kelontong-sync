"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Store, 
  ChevronRight, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Store size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">Kelontong<span className="text-indigo-600">Sync</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Fitur</Link>
            <Link href="#solution" className="hover:text-indigo-600 transition-colors">Solusi</Link>
            <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Harga</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-6 py-2 rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 hero-gradient">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
                <Zap size={14} />
                <span>Modern SaaS POS System</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Kelola Warung Jadi <br />
                <span className="gradient-text">Lebih Modern & Praktis</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                KelontongSync membantu Anda mengelola inventaris, penjualan, hingga multi-cabang dalam satu aplikasi cerdas. Pantau bisnis dari mana saja, kapan saja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-xl shadow-indigo-200 dark:shadow-none">
                  Mulai Sekarang <ArrowRight size={20} />
                </Link>
                <Link href="#demo" className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Lihat Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-slate-500 text-sm">
                <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Tanpa Kartu Kredit</div>
                <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Gratis Selamanya (Basic)</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative animate-float"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-900/10">
                <Image 
                  src="/hero.png" 
                  alt="KelontongSync Dashboard" 
                  width={800} 
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Fitur Unggulan</h2>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white">Semua yang Anda Butuhkan untuk <br /> Ekspansi Bisnis</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: <ShoppingCart className="text-indigo-600" />, 
                  title: "Sistem Kasir (POS)", 
                  desc: "Transaksi cepat, scan barcode, dan cetak struk otomatis dalam hitungan detik." 
                },
                { 
                  icon: <Package className="text-purple-600" />, 
                  title: "Manajemen Stok", 
                  desc: "Pantau stok secara realtime dan dapatkan peringatan otomatis saat barang menipis." 
                },
                { 
                  icon: <BarChart3 className="text-pink-600" />, 
                  title: "Laporan Pintar", 
                  desc: "Analisis laba rugi dan tren penjualan harian hingga tahunan dengan grafik visual." 
                },
                { 
                  icon: <Globe className="text-blue-600" />, 
                  title: "Multi Cabang", 
                  desc: "Kelola banyak toko atau cabang hanya dari satu akun terpusat secara efisien." 
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust/Social Proof */}
        <section className="py-20 border-y border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-around gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <span className="text-3xl font-bold">Trusted by 500+ Local Stores</span>
            <div className="flex gap-12 flex-wrap justify-center">
              <span className="text-xl font-medium">Warung Berkah</span>
              <span className="text-xl font-medium">Toko Makmur</span>
              <span className="text-xl font-medium">RetailerID</span>
              <span className="text-xl font-medium">Kedai Digital</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto">
            <div className="relative rounded-[3rem] bg-indigo-600 p-12 lg:p-20 overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl text-center lg:text-left space-y-6">
                  <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Siap Mengubah Bisnis Kelontong Anda Hari Ini?
                  </h2>
                  <p className="text-indigo-100 text-xl">
                    Gabung dengan ratusan pemilik warung lainnya yang telah bermigrasi ke KelontongSync. Gratis pendaftaran!
                  </p>
                </div>
                <div className="flex shrink-0">
                  <Link href="/register" className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-all transform hover:scale-105 shadow-2xl">
                    Mulai Gratis Sekarang
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Store size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight">KelontongSync</span>
            </div>
            <p className="text-slate-500 max-w-sm">
              Solusi manajemen warung dan retail modern terbaik di Indonesia. Membantu UMKM naik kelas dengan teknologi digital terjangkau.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-6">Produk</h5>
            <ul className="space-y-4 text-slate-500">
              <li><Link href="#" className="hover:text-indigo-600">POS System</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Inventory Management</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Dashboard Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6">Perusahaan</h5>
            <ul className="space-y-4 text-slate-500">
              <li><Link href="#" className="hover:text-indigo-600">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Kontak</Link></li>
              <li><Link href="#" className="hover:text-indigo-600">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-20 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 text-sm">
          © 2026 KelontongSync. Built with love by Kelompok 5 PPL.
        </div>
      </footer>
    </div>
  );
}
