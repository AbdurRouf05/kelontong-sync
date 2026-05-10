# Checklist Pembangunan KelontongSync

Dokumen ini digunakan untuk memantau progres pengerjaan setiap fase. Anggota tim hanya diperbolehkan memberi tanda centang `[x]` pada tugas yang sudah selesai. Perubahan struktur tugas hanya boleh dilakukan oleh **Abdur Rouf**.

## 🟢 FASE 1: Inisiasi & Persiapan (Pondasi)
*Target: Infrastruktur siap digunakan oleh semua developer.*

- [x] **Abdur Rouf**: Inisialisasi Repositori GitHub & Next.js Boilerplate.
- [x] **Abdur Rouf**: Konfigurasi Branching Git (`dev`, `staging`, `feature/*`).
- [x] **Abdur Rouf**: Setup Proyek Supabase & Vercel.
- [x] **Abdur Rouf**: Membuat Skema Database (Tabel Toko, Barang, Karyawan, Transaksi) di Supabase.
- [ ] **Semua Anggota**: Melakukan `git clone` dan `pnpm install` di komputer masing-masing.
- [ ] **Semua Anggota**: Berpindah ke branch modul masing-masing (contoh: `git checkout feature/pos`).

---

## 🟡 FASE 2: Core Development (Pengerjaan Modul)
*Target: Antarmuka dan logika utama modul selesai di masing-masing branch.*

### Modul POS (Rafi)
- [x] **Rafi**: Membuat UI Halaman Kasir (Daftar Barang & Keranjang).
- [ ] **Rafi**: Implementasi logika keranjang (Tambah, Kurang, Hapus barang).
- [ ] **Rafi**: Implementasi fitur pencarian barang & hitung kembalian.

### Modul Inventaris (Akmal)
- [ ] **Akmal**: Membuat UI Katalog Barang (Tabel & Grid).
- [ ] **Akmal**: Membuat Form Tambah/Edit Barang.
- [ ] **Akmal**: Implementasi fitur kategori dan filter stok.

### Modul Dasbor (Adam)
- [ ] **Adam**: Membuat UI Dasbor Utama (Ringkasan Angka Laba/Rugi).
- [ ] **Adam**: Integrasi library Chart.js/Recharts untuk grafik penjualan.
- [ ] **Adam**: Membuat layout responsif untuk tampilan mobile/tablet.

### Modul Settings & Multi-Cabang (Gombet)
- [ ] **Gombet**: Membuat UI Pengaturan Profil Toko & Cabang.
- [ ] **Gombet**: Membuat halaman manajemen akun karyawan/kasir.
- [ ] **Gombet**: Implementasi UI untuk fitur perpindahan antar cabang.

---

## 🔵 FASE 3: Integrasi & Fitur Lanjutan
*Target: Frontend terhubung ke Supabase dan fitur lintas modul berfungsi.*

- [ ] **Abdur Rouf**: Membuat API / Server Actions untuk koneksi ke Supabase.
- [ ] **Semua Anggota**: Menghubungkan UI Modul ke Database (Fetch & Post data).
- [ ] **Abdur Rouf**: Implementasi Row Level Security (RLS) agar data antar toko tidak bocor.
- [ ] **Abdur Rouf**: Membuat Trigger SQL untuk pemotongan stok otomatis saat transaksi.
- [ ] **Rafi**: Implementasi fitur cetak struk (Thermal/PDF).
- [ ] **Akmal**: Implementasi notifikasi "Early Warning" jika stok di bawah limit.

---

## 🔴 FASE 4: Testing & Deployment Final
*Target: Aplikasi stabil dan siap rilis.*

- [ ] **Semua Anggota**: Melakukan Merge PR dari branch feature ke branch `dev`.
- [ ] **Abdur Rouf**: Melakukan Code Review dan penyelesaian konflik kode.
- [ ] **Abdur Rouf & Adam**: Testing menyeluruh (UAT) di branch `staging`.
- [ ] **Semua Anggota**: Perbaikan bug hasil testing.
- [ ] **Abdur Rouf**: Final Merge ke branch `main` dan rilis ke domain produksi.

---
*Catatan: Segera hubungi PM (Abdur Rouf) jika ada kendala (blocker) pada salah satu poin di atas.*
