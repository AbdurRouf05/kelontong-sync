# 📘 Panduan Pengguna KelontongSync

> Dokumen ini adalah panduan lengkap penggunaan aplikasi **KelontongSync** untuk semua level pengguna.
> Terakhir diperbarui: 2025

---

## 📋 Tentang Dokumen Ini

Panduan ini menjelaskan cara menggunakan setiap fitur dan halaman di aplikasi KelontongSync secara detail.
Dokumen ini ditujukan untuk:

- **Superadmin** — pengelola platform secara keseluruhan
- **Owner** — pemilik bisnis yang mengelola satu atau lebih cabang toko
- **Kasir** — staf yang bertugas melayani transaksi penjualan di kasir

---

## 👤 Role Pengguna

| Role | Deskripsi |
|------|-----------|
| **Superadmin** | Administrator platform. Dapat melihat semua bisnis/tenant yang terdaftar, statistik platform, dan mengelola seluruh sistem. Tidak terikat ke bisnis manapun. |
| **Owner** | Pemilik bisnis. Dapat mengelola semua cabang, produk, laporan, staf, dan pengaturan bisnis miliknya. |
| **Kasir** | Staf operasional. Hanya bisa mengakses data cabang tempat mereka ditugaskan. Dapat melakukan transaksi POS dan melihat inventaris cabangnya. |

---

## 🚀 Alur Onboarding (Pertama Kali Menggunakan)

### Langkah 1 — Daftar Akun Baru (`/register`)

Halaman registrasi menggunakan **multi-step form** yang memandu Anda membuat bisnis dan akun owner sekaligus.


**Step 1 — Nama Bisnis:**
- Isi nama bisnis Anda (contoh: "Toko Kelontong Maju Jaya")
- Nama ini akan menjadi identitas utama semua cabang Anda

**Step 2 — Nama Cabang Pertama:**
- Isi nama cabang pertama Anda (contoh: "Cabang Utama Jl. Sudirman")
- Cabang ini akan otomatis dibuat sebagai cabang aktif pertama

**Step 3 — Data Akun Owner:**
- Isi nama lengkap, email, dan password untuk akun owner
- Email ini digunakan untuk login ke sistem

Setelah submit, sistem akan otomatis membuat entitas **business**, **store**, dan **profile** di database.

### Langkah 2 — Login (`/login`)

Masukkan email dan password yang telah didaftarkan. Sistem akan memverifikasi identitas Anda dan mengarahkan ke dashboard.

### Langkah 3 — Redirect ke Dashboard

Setelah login berhasil, Anda akan diarahkan otomatis ke `/dashboard`. Jika ini adalah pertama kali, sistem akan mendeteksi cabang aktif Anda dan dashboard siap digunakan.

---

## 📄 Panduan Per Halaman

---

### 1. 🏠 Landing Page (`/`)

**Deskripsi:**
Halaman marketing KelontongSync yang menampilkan fitur-fitur unggulan produk dengan visual Neobrutalism yang mencolok.

**Isi Halaman:**
- **Navbar** — Tombol navigasi ke halaman Login dan Register, serta indikator status koneksi database Supabase secara real-time
- **Hero Section** — Tagline dan call-to-action utama
- **Simulasi POS Interaktif** — Demo kasir live yang bisa dicoba langsung di browser tanpa perlu login. Menampilkan bagaimana sistem kasir bekerja
- **Fitur Unggulan** — Penjelasan singkat setiap modul (POS, Inventaris, Laporan, Multi-Cabang)
- **Pricing Section** — Informasi paket harga layanan
- **FAQ Accordion** — Pertanyaan yang sering diajukan, bisa dibuka-tutup secara interaktif

**Catatan:**
Indikator koneksi di navbar menampilkan latensi koneksi ke Supabase secara real-time. Jika berwarna merah, artinya ada gangguan koneksi ke database.


---

### 2. 🔑 Halaman Login (`/login`)

**Deskripsi:**
Halaman autentikasi untuk masuk ke aplikasi.

**Cara Menggunakan:**
1. Masukkan **email** yang terdaftar di kolom pertama
2. Masukkan **password** di kolom kedua
3. Klik tombol **"Masuk"**
4. Sistem akan memverifikasi identitas via Supabase Auth
5. Jika berhasil, Anda akan diredirect otomatis ke `/dashboard`

**Catatan:**
- Jika lupa password, gunakan fitur reset password di halaman **Pengaturan → Ubah Password** (setelah login)
- Jika belum punya akun, klik link **"Daftar"** untuk ke halaman registrasi

---

### 3. 📝 Halaman Register (`/register`)

**Deskripsi:**
Halaman pendaftaran akun baru dengan form multi-step yang intuitif.

**Alur Form:**

| Step | Field | Keterangan |
|------|-------|------------|
| 1 | Nama Bisnis | Nama perusahaan/usaha Anda |
| 2 | Nama Cabang Pertama | Nama cabang toko pertama |
| 3 | Nama Lengkap | Nama owner |
| 3 | Email | Alamat email untuk login |
| 3 | Password | Minimal 6 karakter |

Setelah submit berhasil:
- Entitas `businesses` dibuat di database
- Entitas `stores` (cabang pertama) dibuat dan dikaitkan ke bisnis
- Entitas `profiles` dibuat dengan role `owner` dan `current_store_id` diset ke cabang pertama
- Anda akan diredirect ke halaman login

---

### 4. 📊 Dashboard Overview (`/dashboard`)

**Deskripsi:**
Halaman utama setelah login. Menampilkan ringkasan performa bisnis Anda hari ini.

**Komponen Halaman:**

**Sapaan Dinamis:**
Sistem menampilkan sapaan berdasarkan waktu saat ini:
- 🌅 Pagi (00:00–11:59): "Selamat Pagi, [Nama]!"
- ☀️ Siang (12:00–14:59): "Selamat Siang, [Nama]!"
- 🌆 Sore (15:00–17:59): "Selamat Sore, [Nama]!"
- 🌙 Malam (18:00–23:59): "Selamat Malam, [Nama]!"

**Kartu Ringkasan (Summary Cards):**

| Kartu | Keterangan |
|-------|------------|
| 💰 Total Penjualan | Total omzet penjualan hari ini |
| 📈 Total Keuntungan | Total laba bersih hari ini (harga jual - harga modal) |
| 🧾 Transaksi Hari Ini | Jumlah transaksi yang sudah selesai hari ini |
| 📦 Total Produk | Jumlah produk aktif di katalog cabang ini |
| ⚠️ Stok Menipis | Jumlah produk yang stoknya di bawah batas minimum |

**Grafik Penjualan 7 Hari:**
Bar chart interaktif yang menampilkan tren penjualan 7 hari terakhir. Hover ke bar untuk melihat detail nilai.

**Top 4 Produk Terlaris:**
Daftar 4 produk dengan penjualan tertinggi dalam periode berjalan, dilengkapi jumlah unit terjual.

**5 Transaksi Terakhir:**
Tabel ringkasan 5 transaksi terbaru, menampilkan waktu, total, dan kasir yang bertugas.


---

### 5. 🧾 Kasir POS (`/dashboard/pos`)

**Deskripsi:**
Modul Point of Sales untuk melayani transaksi penjualan secara cepat dan efisien.

**Alur Transaksi:**

**1. Cari Produk**
- Ketik nama produk di kolom pencarian, sistem akan memfilter produk secara real-time
- Atau masukkan kode barcode produk untuk pencarian langsung
- Produk dengan stok habis akan ditampilkan dengan indikator visual berbeda

**2. Tambahkan ke Keranjang**
- Klik produk untuk menambahkannya ke keranjang belanja
- Klik tombol `+` untuk menambah kuantitas, `-` untuk mengurangi
- Klik ikon hapus (🗑️) untuk menghapus produk dari keranjang
- Subtotal per item dan total keseluruhan dikalkulasi otomatis

**3. Proses Pembayaran**
- Masukkan nominal uang yang diterima dari pelanggan
- Sistem otomatis menghitung **kembalian** yang harus diberikan
- Klik **"Checkout / Bayar"** untuk memproses transaksi

**4. Selesai**
- Transaksi tersimpan ke database
- Stok produk dikurangi otomatis sesuai kuantitas yang terjual
- Opsi cetak struk muncul: **PDF** (untuk printer biasa) atau **Thermal** (untuk printer kasir)

**Perhatian:**
- Jika stok produk tidak mencukupi jumlah yang dimasukkan, sistem akan menampilkan alert peringatan dan mencegah proses checkout
- Pastikan `current_store_id` di profil Anda sudah diset ke cabang yang aktif agar stok yang dikurangi sesuai cabang

---

### 6. 📦 Manajemen Inventaris (`/dashboard/inventory`)

**Deskripsi:**
Halaman untuk mengelola seluruh katalog produk di toko Anda.

**Tampilan Produk:**
Anda bisa beralih antara dua mode tampilan:
- **Tampilan Tabel** — Cocok untuk manajemen data secara detail
- **Tampilan Grid Bento** — Visual yang lebih menarik dengan kartu produk premium

**Fitur CRUD Produk:**

| Aksi | Cara |
|------|------|
| ➕ Tambah Produk | Klik tombol "Tambah Produk", isi form di modal (nama, kategori, barcode, harga modal, harga jual, stok awal, stok minimum) |
| ✏️ Edit Produk | Klik ikon edit pada baris/kartu produk, ubah data yang diinginkan di modal |
| 🗑️ Hapus Produk | Klik ikon hapus, konfirmasi penghapusan di dialog |
| 🗑️ Hapus Massal | Centang beberapa produk, klik "Hapus Terpilih" untuk bulk delete |

**Filter & Pencarian:**
- Cari produk berdasarkan nama
- Filter berdasarkan kategori menggunakan dropdown
- Produk dengan stok di bawah batas minimum akan disorot dengan warna merah sebagai alert

**Import Produk Massal:**
Anda bisa mengimpor banyak produk sekaligus dari file:
1. Klik tombol **"Import Produk"**
2. Pilih format file: **CSV**, **Excel (.xlsx)**, atau **JSON**
3. Download template contoh import jika perlu (file `contoh_import.csv` dan `contoh_import.json` tersedia di root proyek)
4. Upload file, sistem akan mem-preview data sebelum diimpor
5. Konfirmasi import

**Manajemen Kategori:**
- Buat, edit, dan hapus kategori produk
- Setiap kategori bisa diberi emoji icon yang tampil di katalog
- Kategori bersifat global dan berlaku untuk semua cabang dalam satu bisnis


---

### 7. 📈 Laporan & Analitik (`/dashboard/reports`)

**Deskripsi:**
Halaman analitik bisnis yang menampilkan laporan penjualan secara visual dan detail.

**Filter Periode:**
Pilih rentang waktu laporan menggunakan filter di bagian atas:
- **Harian** — Data hari ini
- **Mingguan** — Data 7 hari terakhir
- **Bulanan** — Data bulan berjalan
- **Tahunan** — Data tahun berjalan

Semua grafik dan tabel akan memperbarui diri secara otomatis sesuai filter yang dipilih.

**Komponen Laporan:**

| Komponen | Keterangan |
|----------|------------|
| 📊 Grafik Tren Penjualan | Bar/line chart yang menampilkan tren omzet dan keuntungan bersih per periode |
| 🥧 Pie Chart Kategori | Visualisasi distribusi penjualan berdasarkan kategori produk |
| 🏆 Top Produk | Peringkat produk berdasarkan nilai penjualan tertinggi |
| 📋 Tabel Detail Transaksi | Daftar lengkap semua transaksi dalam periode yang dipilih, termasuk waktu, kasir, dan total |

**Export Laporan:**
- Klik tombol **"Export PDF"** untuk mengunduh laporan dalam format PDF
- Laporan PDF mencakup semua data yang tampil di layar sesuai filter periode aktif

---

### 8. 🏪 Manajemen Multi-Cabang (`/dashboard/management`)

**Deskripsi:**
Halaman untuk mengelola semua cabang bisnis dan berpindah antar cabang.

**Fitur Store Switcher:**
- Di bagian atas sidebar/header terdapat widget **Store Switcher**
- Klik untuk melihat daftar semua cabang yang dimiliki bisnis Anda
- Pilih cabang yang ingin diaktifkan — semua data (POS, inventaris, laporan) akan langsung menampilkan data cabang tersebut

**Manajemen Cabang:**
- **Lihat Semua Cabang** — Tabel/kartu yang menampilkan semua cabang beserta alamat dan nomor telepon
- **Tambah Cabang Baru** — Klik "Tambah Cabang", isi nama, alamat, dan nomor telepon
- **Edit Cabang** — Ubah informasi cabang yang sudah ada
- **Hapus Cabang** — Hapus cabang (data produk dan transaksi yang terikat akan terpengaruh)

**Hak Akses:**

| Role | Akses |
|------|-------|
| **Owner** | Bisa melihat, menambah, mengedit, dan menghapus semua cabang |
| **Kasir** | Hanya bisa melihat data cabang tempat mereka ditugaskan. Tidak bisa mengelola cabang lain |

---

### 9. ⚙️ Pengaturan (`/dashboard/settings`)

**Deskripsi:**
Halaman pengaturan toko dan akun pengguna, terbagi menjadi beberapa sub-halaman.

**Sub-halaman Pengaturan:**

**a. Pengaturan Toko**
- Nama toko
- Alamat toko
- Nomor telepon toko
- **Footer struk** — Teks yang muncul di bagian bawah struk (misal: "Terima kasih sudah berbelanja!")
- **Threshold stok minimum** — Nilai default batas minimum stok sebelum alert "stok menipis" muncul

**b. Manajemen Staf**
- Lihat daftar kasir yang terdaftar di bisnis Anda
- Tambah kasir baru: masukkan email dan nama, sistem akan membuat akun kasir
- Assign kasir ke cabang tertentu menggunakan dropdown
- Hapus kasir dari sistem

**c. Kelola Cabang**
- Tampilan ringkas semua cabang bisnis
- Shortcut ke halaman Manajemen Multi-Cabang untuk pengelolaan lebih lanjut

**d. Ubah Password**
- Masukkan password baru dan konfirmasi password baru
- Klik "Simpan" untuk memperbarui password akun Anda


---

### 10. 🔐 Portal Superadmin (`/admin`)

**Deskripsi:**
Halaman khusus yang hanya bisa diakses oleh pengguna dengan role `superadmin`. Digunakan untuk memantau dan mengelola seluruh platform KelontongSync.

> ⚠️ Akses ke halaman ini dibatasi secara ketat. Jika Anda bukan superadmin, sistem akan menolak akses.

**Fitur:**
- **Daftar Semua Bisnis/Tenant** — Tabel semua bisnis yang terdaftar di platform, lengkap dengan nama owner dan tanggal registrasi
- **Statistik Platform:**
  - Total tenant/bisnis aktif
  - Total transaksi di seluruh platform
  - Total omzet platform secara keseluruhan
- **Navigasi ke Detail Tenant** — Klik nama bisnis untuk melihat detail lebih lanjut

**Cara Membuat Akun Superadmin:**
```bash
node scripts/create-superadmin.js
```
Jalankan perintah ini sekali saat setup awal. Akun superadmin tidak dibuat melalui halaman register biasa.

---

### 11. 🏢 Manajemen Tenant (`/tenant`)

**Deskripsi:**
Halaman monitoring tenant platform yang bisa diakses oleh superadmin untuk melihat detail setiap bisnis secara mendalam.

**Informasi yang Tersedia Per Tenant:**
- Nama bisnis dan nama owner
- Jumlah cabang yang dimiliki
- Total produk terdaftar
- Total kasir aktif
- Total omzet kumulatif bisnis tersebut
- Tanggal bergabung ke platform

---

## 🔑 Matriks Peran & Hak Akses

| Fitur | Superadmin | Owner | Kasir |
|-------|:----------:|:-----:|:-----:|
| Landing Page | ✅ | ✅ | ✅ |
| Login / Register | ✅ | ✅ | ✅ |
| Dashboard Overview | ❌ | ✅ | ✅ |
| Kasir POS | ❌ | ✅ | ✅ |
| Lihat Inventaris | ❌ | ✅ | ✅ |
| Tambah/Edit/Hapus Produk | ❌ | ✅ | ❌ |
| Import Produk Massal | ❌ | ✅ | ❌ |
| Laporan & Analitik | ❌ | ✅ | ❌ |
| Lihat Semua Cabang | ❌ | ✅ | ❌ (hanya cabang sendiri) |
| Tambah/Edit/Hapus Cabang | ❌ | ✅ | ❌ |
| Manajemen Staf/Kasir | ❌ | ✅ | ❌ |
| Pengaturan Toko | ❌ | ✅ | ❌ |
| Ubah Password Sendiri | ✅ | ✅ | ✅ |
| Portal Superadmin (`/admin`) | ✅ | ❌ | ❌ |
| Monitoring Tenant (`/tenant`) | ✅ | ❌ | ❌ |

---

## 💡 Tips & Troubleshooting

### Tips Penggunaan

- **POS lebih cepat dengan keyboard:** Fokuskan kursor di kolom pencarian produk dan langsung ketik nama produk atau barcode. Tekan Enter untuk menambah ke keranjang.
- **Gunakan import CSV untuk onboarding cepat:** Jika Anda punya daftar produk di Excel, konversi ke CSV dan import sekaligus daripada input satu per satu.
- **Pantau stok menipis di dashboard:** Kartu "Stok Menipis" di dashboard langsung menunjukkan jumlah produk yang perlu direstok.

### Troubleshooting

**Koneksi database error atau halaman tidak memuat data:**
1. Periksa file `.env.local` — pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
2. Pastikan project Supabase Anda aktif dan tidak dalam status paused (project gratis Supabase akan di-pause setelah tidak aktif)
3. Cek indikator koneksi di navbar landing page — jika merah, ada gangguan jaringan ke Supabase

**Stok tidak berkurang setelah transaksi POS:**
1. Pastikan profil pengguna memiliki `current_store_id` yang terisi — ini menentukan cabang mana yang stoknya akan dikurangi
2. Cek apakah produk memiliki entri di tabel `product_stocks` untuk cabang aktif Anda
3. Jika menggunakan data baru tanpa seeder, tambahkan stok produk terlebih dahulu melalui halaman Inventaris

**Tidak bisa login:**
1. Pastikan email dan password yang dimasukkan sudah benar (case-sensitive)
2. Cek apakah akun sudah terdaftar di Supabase Auth (bisa dicek di Supabase Dashboard → Authentication → Users)

**Cara reset password:**
1. Login ke dashboard
2. Buka **Pengaturan → Ubah Password**
3. Masukkan password baru dan konfirmasi
4. Klik "Simpan"

**Gambar produk tidak muncul:**
Pastikan Storage Bucket `product-images` sudah dibuat di Supabase Storage dan statusnya di-set ke **Public**.

---

*Untuk pertanyaan lebih lanjut, hubungi Project Manager: **Abdur Rouf**.*
