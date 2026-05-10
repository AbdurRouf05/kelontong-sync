# Rencana Pembangunan Aplikasi KelontongSync

## 1. Pendahuluan
Dokumen ini merupakan perencanaan teknis, arsitektural, dan manajerial untuk proyek pembangunan sistem **KelontongSync** (SaaS Manajemen Toko Kelontong Modern). Proyek ini berfokus pada penyediaan sistem POS (Kasir), inventaris, dasbor analitik, dan kapabilitas multi-cabang untuk UMKM. Proyek ini akan dikerjakan secara kolaboratif oleh tim yang terdiri dari 5 orang.

## 2. Tech Stack yang Digunakan
Sesuai dengan kebutuhan arsitektur cloud SaaS modern yang cepat, ringan, dan handal, berikut adalah tumpukan teknologi (Tech Stack) yang akan digunakan:
- **Frontend**: Next.js (React Framework)
- **Styling**: Tailwind CSS (Pendekatan Mobile-First dan UI modern)
- **Backend & Database**: Supabase (Menyediakan PostgreSQL Database, Autentikasi Pengguna, dan API secara instan)
- **Hosting / Deployment**: Vercel (Terintegrasi sangat baik dengan Next.js untuk CI/CD)
- **Version Control**: Git & GitHub

## 3. Pembagian Modul dan Peran (5 Anggota Tim)

1. **Abdur Rouf (Project Manager & System Analyst)**
   - **Peran**: Memimpin proyek, mengelola *timeline*, dan menjaga kualitas.
   - **Tugas**: 
     - Menyusun *sprint planning* dan mengelola *backlog* (menggunakan Trello/GitHub Projects).
     - Memastikan UI/UX dan implementasi fitur berjalan sesuai dengan SRS.
     - Melakukan sinkronisasi antar anggota tim jika ada konflik antar modul.
     - Melakukan *Code Review* pada setiap Pull Request.

2. **Gombet (Backend & Database Developer)**
   - **Modul**: Basis Data, Autentikasi, dan Logika Server.
   - **Tugas**:
     - Membangun skema database (Tabel Toko, Barang, Transaksi, dll) di Supabase.
     - Setup modul Login/Register menggunakan Supabase Auth serta mengatur hak akses (Role: Kasir vs Owner).
     - Menulis fungsi database (*Stored Procedures* / *Triggers*) untuk sinkronisasi otomatis pemotongan stok barang setiap kali transaksi berhasil.

3. **Rafi (Frontend Developer - Modul POS)**
   - **Modul**: Point of Sales (POS) dan Struk.
   - **Tugas**:
     - Membangun antarmuka kasir yang responsif.
     - Membuat logika keranjang belanja (*virtual cart*) di sisi klien (kalkulasi subtotal, pajak/diskon, kembalian otomatis).
     - Mengintegrasikan pemindaian *barcode* serta fitur cetak struk (format thermal printer atau PDF).

4. **Akmal (Frontend Developer - Modul Dasbor & Inventaris)**
   - **Modul**: Dasbor Analitik dan Manajemen Inventaris.
   - **Tugas**:
     - Membangun halaman visualisasi data (grafik laba, margin penjualan harian) menggunakan library seperti Recharts atau Chart.js.
     - Membangun sistem *Early Warning* (notifikasi saat stok barang di bawah limit).
     - Mengembangkan halaman CRUD (Create, Read, Update, Delete) untuk manajemen barang (katalog produk).

5. **Adam (DevOps, QA, & Modul Multi-Cabang)**
   - **Modul**: Skalabilitas Cabang dan *Quality Assurance*.
   - **Tugas**:
     - Menerapkan filter logika Multi-Cabang (memastikan satu kasir hanya melihat data cabang mereka, sedangkan owner bisa melihat semua).
     - Mengonfigurasi otomatisasi deployment di Vercel (CI/CD pipeline).
     - Bertanggung jawab sebagai QA (Software Tester): melakukan UAT (User Acceptance Testing) pada staging sebelum dirilis ke production.

## 4. Fase Pembangunan Aplikasi

- **Fase 1: Inisiasi & Persiapan (Minggu 1)**
  - Setup Repository GitHub dan aturan kolaborasi.
  - Setup proyek Vercel dan Supabase.
  - Implementasi struktur awal database (oleh Gombet).
  - Inisiasi boilerplate Next.js + Tailwind (oleh Adam).

- **Fase 2: Core Development (Minggu 2 - 3)**
  - Pembangunan UI POS dan logika keranjang oleh Rafi.
  - Pembangunan UI Katalog Barang dan Manajemen Inventaris oleh Akmal.
  - Integrasi API otentikasi login oleh Gombet.

- **Fase 3: Integrasi & Fitur Lanjutan (Minggu 4)**
  - Menyambungkan Frontend (POS & Inventaris) ke Supabase Database.
  - Implementasi kalkulasi grafik Dasbor dan sistem Early Warning.
  - Implementasi isolasi data Multi-Cabang.

- **Fase 4: Testing & Deployment Final (Minggu 5)**
  - QA Testing menyeluruh (oleh Adam & Abdur Rouf) meliputi skenario happy flow dan error flow.
  - Bug fixing.
  - Rilis versi produksi 1.0.

## 5. Flowchart dan Diagram Pendukung

### A. Arsitektur Sistem (SaaS Cloud)
```mermaid
graph TD
    UserKasir[Kasir / Tablet POS] -->|HTTPS| WebApp[Frontend Next.js + Tailwind]
    UserOwner[Pemilik / Dasbor] -->|HTTPS| WebApp
    WebApp -->|REST API / Realtime| Backend[Supabase Cloud]
    Backend -->|Auth Module| Auth[(Supabase Auth)]
    Backend -->|PostgreSQL| Database[(Database KelontongSync)]
    WebApp -.->|Hosting & CI/CD| Vercel[Vercel Edge Network]
```
*Penjelasan: Klien (baik Kasir maupun Pemilik) mengakses aplikasi melalui browser. Web App yang dihosting di Vercel bertindak sebagai Frontend yang berkomunikasi langsung dengan Supabase untuk keperluan akses data dan otentikasi. Semua terpusat secara real-time.*

### B. Flowchart Transaksi Kasir (Modul POS)
```mermaid
flowchart TD
    Start([Mulai Transaksi]) --> Scan[Kasir Scan Barcode / Cari Barang]
    Scan --> Check{Barang Ada & Stok Cukup?}
    Check -->|Tidak| Alert[Tampilkan Pesan Error/Stok Habis]
    Check -->|Ya| AddCart[Tambahkan ke Keranjang]
    AddCart --> MoreItems{Ada Barang Lain?}
    MoreItems -->|Ya| Scan
    MoreItems -->|Tidak| Pay[Proses Pembayaran]
    Pay --> InputUang[Input Nominal Uang Pelanggan]
    InputUang --> Calc[Sistem Hitung Kembalian]
    Calc --> Save[Simpan ke Database & Kurangi Stok]
    Save --> Print[Cetak Struk]
    Print --> End([Selesai])
```
*Penjelasan: Alur kasir berfokus pada kecepatan. Pencarian barang divalidasi langsung ke ketersediaan stok. Setelah pembayaran diinput, sistem menghitung kembalian dan secara atomik menyimpan transaksi sekaligus memotong stok persediaan di inventaris.*

### C. Git Branching Strategy (Git Flow)
```mermaid
gitGraph
    commit id: "Initial Repository"
    branch dev
    checkout dev
    commit id: "Setup Next.js & Supabase"
    branch feature/pos
    checkout feature/pos
    commit id: "UI Keranjang Kasir"
    commit id: "Fungsi Subtotal"
    checkout dev
    merge feature/pos
    branch feature/dashboard
    checkout feature/dashboard
    commit id: "UI Grafik Laba"
    checkout dev
    merge feature/dashboard
    branch staging
    checkout staging
    merge dev id: "Release Candidate (Testing)"
    checkout main
    merge staging id: "V1.0 Production"
```
*Penjelasan:*
- `main`: Branch produksi yang sudah stabil. Terhubung dengan live domain Vercel.
- `staging`: Branch untuk keperluan pengujian menyeluruh (UAT) sebelum dirilis.
- `dev`: Branch integrasi utama tempat semua kode developer digabungkan.
- `feature/*`: Branch sementara yang dibuat oleh setiap developer untuk mengerjakan tiket modul masing-masing. Di-merge ke `dev` via Pull Request.
