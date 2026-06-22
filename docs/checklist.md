
# Checklist Pembangunan KelontongSync

Dokumen ini digunakan untuk memantau progres pengerjaan setiap fase. Anggota tim hanya diperbolehkan memberi tanda centang `[x]` pada tugas yang sudah selesai. Perubahan struktur tugas hanya boleh dilakukan oleh **Abdur Rouf**.

## FASE 1: Inisiasi & Persiapan (Pondasi)
*Target: Infrastruktur siap digunakan oleh semua developer.*

- [x] **Abdur Rouf**: Inisialisasi Repositori GitHub & Next.js Boilerplate.
- [x] **Abdur Rouf**: Konfigurasi Branching Git (`dev`, `staging`, `feature/*`).
- [x] **Abdur Rouf**: Setup Proyek Supabase & Vercel.
- [x] **Abdur Rouf**: Membuat Skema Database (Tabel Toko, Barang, Karyawan, Transaksi) di Supabase.
- [x] **Semua Anggota**: Melakukan `git clone` dan `pnpm install` di komputer masing-masing.
- [x] **Semua Anggota**: Berpindah ke branch modul masing-masing (contoh: `git checkout feature/pos`).

---

## FASE 2: Core Development (Pengerjaan Modul)
*Target: Antarmuka dan logika utama modul selesai di masing-masing branch.*

### Modul POS (Rafi)
- [x] **Rafi**: Membuat UI Halaman Kasir (Daftar Barang & Keranjang).
- [x] **Rafi**: Implementasi logika keranjang (Tambah, Kurang, Hapus barang).
- [x] **Rafi**: Implementasi fitur pencarian barang & hitung kembalian.
- [x] **Rafi**: Optimasi input pencarian dengan *onChange event handler* terintegrasi (Commit: `4788b76`).
- [x] **Rafi**: Perbaikan redundansi deklarasi state `viewMode` pada POSPage (Commit: `4be909c`).

### Modul Inventaris (Akmal)
- [x] **Akmal**: Membuat UI Katalog Barang (Tabel & Grid Bento Modern).
- [x] **Akmal**: Membuat Form Tambah/Edit Barang (CRUD Modal).
- [x] **Akmal**: Implementasi fitur kategori dan filter level persediaan barang.
- [x] **Akmal**: Optimasi tata letak responsif Bento Grid Premium di halaman katalog produk (Commit: `fbbe594`, `0d34718`).
- [x] **Akmal**: Implementasi filter kategori dropdown cerdas dan aksi hapus massal (*bulk delete*) produk (Commit: `0d34718`).

### Modul Dasbor & Laporan (Adam)
- [x] **Adam**: Membuat UI Dasbor Utama (Ringkasan Angka Laba/Rugi, Omzet, Barang Terjual).
- [x] **Adam**: Integrasi library Recharts untuk grafik penjualan dan pie chart kategori terpopuler.
- [x] **Adam**: Menstabilkan query pelaporan dengan dukungan filter mingguan, bulanan, dan tahunan (Commit: `2b985b7`, `14fffd5`).
- [x] **Adam**: Sinkronisasi data visualisasi tren penjualan dengan *global period filter* (Commit: `512f78b`, `9831e4f`).
- [x] **Adam**: Membuat layout responsif premium (*mobile-friendly*) di seluruh halaman laporan.

### Modul Settings & Multi-Cabang (Ferdy)
- [x] **Ferdy**: Membuat UI Pengaturan Profil Toko & Cabang.
- [x] **Ferdy**: Membuat antarmuka pendaftaran tenant SaaS Multi-Step (`/register`) (Commit: `277016a`).
- [x] **Ferdy**: Membuat halaman manajemen utama Super Admin Tenant (`/tenant`) untuk monitoring cabang & omzet (Commit: `26d92bc`, `9d83fb3`).
- [x] **Ferdy**: Implementasi UI untuk fitur perpindahan antar cabang (Store Switcher) dan hak akses kasir.
- [x] **Ferdy**: Merapikan tombol navigasi platform admin & tenant agar simetris tanpa wrap (Commit: `fe6c37e`, `6d7a2a4`, `8a15dd7`).

---

## FASE 3: Integrasi & Fitur Lanjutan
*Target: Frontend terhubung ke Supabase dan fitur lintas modul berfungsi.*

- [x] **Abdur Rouf**: Membuat API / Server Actions untuk koneksi aman ke Supabase.
- [x] **Semua Anggota**: Menghubungkan UI Modul ke Database (Fetch & Post data dinamis).
- [ ] **Abdur Rouf**: Implementasi Row Level Security (RLS) agar data antar toko tidak bocor (Tertunda/Non-aktif demi kemudahan presentasi & testing dev).
- [x] **Abdur Rouf**: Membuat Trigger SQL dan PostgreSQL Functions untuk pemotongan stok otomatis saat POS checkout.
- [x] **Abdur Rouf**: Membuat skrip seeder otomatis untuk 100 produk nyata lengkap dengan transaksi historis sepanjang 300 hari terakhir (Commit: `05e52da`).
- [x] **Rafi**: Implementasi fitur cetak struk digital (Thermal/PDF).
- [x] **Akmal**: Implementasi notifikasi "Early Warning" jika stok di bawah batas minimum (*low stock threshold*).
- [x] **Akmal**: Mengembangkan modul impor data produk massal berbasis file CSV, Excel, dan JSON (Commit: `contoh_import`).
- [x] **Ferdy**: Mengintegrasikan widget diagnostik koneksi dan latensi database Supabase real-time di seluruh header (Commit: `6c3c9e4`, `737901b`).
- [x] **Ferdy**: Menambahkan developer bypass mode dan widget detektor latency untuk mempercepat monitoring jaringan dev (Commit: `5af3389`).

---

## FASE 4: Testing & Deployment Final
*Target: Aplikasi stabil dan siap rilis.*

- [x] **Semua Anggota**: Mengambil, meninjau, dan melakukan merge dari branch feature ke branch `dev` secara lokal oleh PM.
- [x] **Abdur Rouf**: Melakukan Code Review secara berkala dan penyelarasan konflik kode tim secara lokal.
- [x] **Abdur Rouf & Adam**: Uji kompilasi build produksi Next.js Turbopack secara lokal untuk memastikan *Clean Build*.
- [x] **Semua Anggota**: Perbaikan bug TypeScript, hydration mismatch (Commit: `6c3a73a`), dan optimasi responsiveness layout Bento Grid (Commit: `fbbe594`).
- [x] **Abdur Rouf**: Melakukan merge lokal dengan mode `--no-ff` ke branch `dev` lalu dilanjutkan ke branch `main`.
- [x] **Abdur Rouf**: Sinkronisasi repository final ke GitHub, setup mailmap (Commit: `a9df462`), dan sinkronisasi checklist progres (Commit: `0e26eaf`).

---
*Catatan: Segera hubungi PM (Abdur Rouf) jika ada kendala (blocker) pada salah satu poin di atas.*
