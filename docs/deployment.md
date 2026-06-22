# 🚀 Panduan Deployment KelontongSync

> Panduan lengkap untuk men-deploy aplikasi KelontongSync dari development lokal hingga production di Vercel.

---

## 📋 Prerequisites

Pastikan semua tools berikut sudah terinstall dan akun berikut sudah dimiliki sebelum memulai proses deployment:

### Tools yang Dibutuhkan

| Tool | Versi Minimum | Cara Install |
|------|---------------|--------------|
| **Node.js** | >= 18.x | [nodejs.org/download](https://nodejs.org/download) |
| **pnpm** | >= 8.x | `npm install -g pnpm` |
| **Git** | Terbaru | [git-scm.com](https://git-scm.com) |

### Akun yang Dibutuhkan

| Layanan | Tier | Link |
|---------|------|------|
| **Supabase** | Free tier cukup | [supabase.com](https://supabase.com) |
| **Vercel** | Free tier cukup | [vercel.com](https://vercel.com) |
| **GitHub** | Free | [github.com](https://github.com) |

---

## 1. 🗄️ Setup Supabase

### 1.1 Buat Project Baru

1. Login ke [supabase.com](https://supabase.com) dan klik **"New Project"**
2. Isi nama project (misal: `kelontong-sync-prod`)
3. Pilih region terdekat (disarankan: **Southeast Asia - Singapore**)
4. Set password database yang kuat dan simpan di tempat aman
5. Klik **"Create new project"** dan tunggu hingga project selesai dibuat (biasanya 1-2 menit)

### 1.2 Catat Kredensial API

1. Di dashboard Supabase, buka **Settings → API**
2. Catat dua nilai berikut:
   - **Project URL** — format: `https://xxxxx.supabase.co`
   - **anon/public key** — string panjang dimulai dengan `eyJ...`

> ⚠️ Jangan bagikan `service_role` key ke siapapun. Key yang kita butuhkan hanyalah **anon/public key**.


### 1.3 Jalankan SQL Schema Database

1. Di dashboard Supabase, buka **SQL Editor** (ikon di sidebar kiri)
2. Klik **"New Query"**
3. Buka file [`docs/database.md`](./database.md) di repository ini
4. Salin **seluruh blok SQL** yang ada di bagian "SQL Lengkap"
5. Paste ke SQL Editor Supabase
6. Klik tombol **"Run"** (atau tekan `Ctrl+Enter`)
7. Pastikan hasilnya menampilkan pesan sukses tanpa error

Script SQL ini akan:
- Menghapus tabel lama jika ada (fresh start)
- Membuat 10 tabel sesuai arsitektur Multi-Branch SaaS
- Menonaktifkan Row Level Security (RLS) untuk mode development

### 1.4 Buat Storage Bucket

1. Di sidebar Supabase, buka **Storage**
2. Klik **"New Bucket"**
3. Isi nama bucket: `product-images`
4. Aktifkan toggle **"Public bucket"** agar gambar bisa diakses publik
5. Klik **"Save"**

> Storage bucket ini digunakan untuk menyimpan gambar produk yang diupload.

### 1.5 (Untuk Production) Aktifkan RLS

> ⚠️ Langkah ini opsional untuk development, tapi **wajib** untuk production agar data antar tenant tidak bocor.

Jalankan SQL berikut di SQL Editor untuk mengaktifkan Row Level Security:
```sql
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
```
Kemudian buat RLS Policies sesuai kebutuhan akses per role.

---

## 2. 🔧 Setup Environment Variables

Buat file `.env.local` di root project dengan menyalin dari `.env.example`:

```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi dengan nilai yang sudah dicatat dari Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 🔒 File `.env.local` sudah ada di `.gitignore` dan **tidak akan ter-commit** ke repository. Jangan pernah commit file yang berisi kredensial.


---

## 3. 💻 Jalankan Lokal (Local Development)

```bash
# Clone repository
git clone <repo-url>
cd kelontong-sync

# Install semua dependencies
pnpm install

# Jalankan development server
pnpm dev
```

Buka browser dan akses [http://localhost:3000](http://localhost:3000).

Server development akan berjalan dengan **hot reload** — setiap perubahan kode akan langsung ter-refresh di browser.

### Build Production Lokal (Opsional)

Untuk memastikan build production tidak ada error sebelum deploy:
```bash
pnpm build
pnpm start
```

Jika `pnpm build` berhasil tanpa error, kode siap untuk di-deploy ke Vercel.

---

## 4. 👑 Buat Akun Superadmin

Akun superadmin tidak bisa dibuat melalui halaman register biasa. Gunakan script yang tersedia:

```bash
node scripts/create-superadmin.js
```

Script ini akan:
1. Membuat user baru di Supabase Auth dengan email dan password superadmin
2. Membuat profil dengan role `superadmin` di tabel `profiles`
3. Menampilkan kredensial superadmin di terminal

Simpan kredensial yang ditampilkan. Gunakan untuk login di `/admin`.

---

## 5. 🌱 Seed Data Demo (Opsional)

Jika ingin mengisi database dengan data contoh yang realistis untuk keperluan demo atau testing:

```bash
npx tsx scripts/seed-data.ts
```

Script ini akan mengisi database dengan:
- **100 produk** dengan nama, kategori, harga modal, harga jual, dan barcode yang realistis
- **Riwayat 300 hari transaksi** — data penjualan historis selama 10 bulan ke belakang
- Stok produk yang bervariasi

> ⏳ Proses seeder membutuhkan waktu beberapa menit. Biarkan berjalan hingga selesai.

Untuk seed data tenant tambahan:
```bash
node scripts/seed-tenant.js
```

---

## 6. ☁️ Deploy ke Vercel

### Cara A: Via GitHub (Direkomendasikan)

Ini adalah cara yang paling mudah dan memungkinkan CI/CD otomatis.

**Langkah-langkah:**

1. **Push kode ke GitHub**
   ```bash
   git add .
   git commit -m "chore: ready for production deployment"
   git push origin main
   ```

2. **Import ke Vercel**
   - Buka [vercel.com](https://vercel.com) dan login
   - Klik **"Add New... → Project"**
   - Pilih **"Import Git Repository"**
   - Authorize Vercel untuk mengakses GitHub Anda
   - Cari dan pilih repository `kelontong-sync`

3. **Konfigurasi Project**
   - **Framework Preset:** Next.js (biasanya terdeteksi otomatis)
   - **Root Directory:** `.` (root)
   - **Build Command:** `pnpm build`
   - **Install Command:** `pnpm install`

4. **Tambahkan Environment Variables**
   - Di bagian **"Environment Variables"**, tambahkan:
     - `NEXT_PUBLIC_SUPABASE_URL` → nilai URL Supabase Anda
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → nilai anon key Supabase Anda
   - Pastikan keduanya di-set untuk environment **Production**, **Preview**, dan **Development**

5. **Deploy**
   - Klik tombol **"Deploy"**
   - Tunggu proses build selesai (biasanya 2-5 menit)
   - Setelah selesai, Vercel akan memberikan URL production seperti `https://kelontong-sync.vercel.app`


### Cara B: Via Vercel CLI

Alternatif jika ingin deploy langsung dari terminal tanpa melalui GitHub.

```bash
# Install Vercel CLI (jika belum ada)
pnpm dlx vercel

# Ikuti prompt interaktif:
# - Login ke akun Vercel Anda
# - Konfirmasi direktori project
# - Set up project name
# - Masukkan environment variables saat diminta
```

Untuk deploy ulang setelah ada perubahan:
```bash
pnpm dlx vercel --prod
```

---

## 7. 🌐 Konfigurasi Domain Custom (Opsional)

Jika Anda punya domain sendiri (misal: `kelontong.mybusiness.com`):

1. Di Vercel Dashboard, buka project Anda
2. Buka tab **"Settings" → "Domains"**
3. Klik **"Add"** dan masukkan domain Anda
4. Vercel akan menampilkan DNS record yang perlu dikonfigurasi:
   - Biasanya berupa **CNAME record** yang mengarah ke `cname.vercel-dns.com`
   - Atau **A record** yang mengarah ke IP Vercel
5. Login ke provider domain Anda (Niagahoster, Cloudflare, GoDaddy, dsb.)
6. Tambahkan DNS record sesuai instruksi Vercel
7. Tunggu propagasi DNS (bisa memakan waktu 5 menit hingga 48 jam)
8. Vercel otomatis akan menerbitkan SSL certificate via Let's Encrypt

---

## 8. 🔄 CI/CD Pipeline

KelontongSync menggunakan Vercel sebagai platform CI/CD. Setiap push ke repository akan otomatis memicu deployment.

### Alur Deployment Otomatis

| Branch | Aksi | URL |
|--------|------|-----|
| `main` | Deploy ke **Production** | `https://kelontong-sync.vercel.app` |
| `staging` | Deploy ke **Preview** (UAT) | `https://kelontong-sync-git-staging.vercel.app` |
| `feature/*`, `dev` | Deploy ke **Preview** | URL unik per commit |

### Branch Strategy

```
main          ← Production (live)
  └── staging ← UAT / Testing
        └── dev ← Integration
              └── feature/* ← Individual development
```

**Alur kerja tim:**
1. Developer mengerjakan fitur di branch `feature/nama-fitur`
2. Buka Pull Request ke branch `dev`
3. PM melakukan code review dan merge ke `dev`
4. `dev` di-merge ke `staging` untuk UAT
5. Setelah testing di staging lulus, `staging` di-merge ke `main`
6. Vercel otomatis deploy ke production

### Verifikasi Deployment

Setelah deployment selesai:
1. Buka URL production Anda
2. Coba login dengan akun yang sudah dibuat
3. Cek indikator koneksi database di landing page — harus berwarna hijau
4. Lakukan transaksi test kecil di POS untuk memastikan end-to-end flow berjalan

---

## 🛠️ Troubleshooting Deployment

| Problem | Kemungkinan Penyebab | Solusi |
|---------|----------------------|--------|
| **Build error: `cannot find module`** | Dependency tidak ter-install atau lockfile tidak ter-commit | Jalankan `pnpm install` lagi, pastikan `pnpm-lock.yaml` ada di repository dan sudah di-commit |
| **Hydration mismatch error** | Komponen yang menggunakan `Math.random()`, `Date.now()`, atau `new Date()` tidak di-wrap `useEffect` | Bungkus logika yang menghasilkan nilai berbeda antara server dan client ke dalam `useEffect` |
| **Supabase connection error di production** | Environment variables belum dikonfigurasi di Vercel atau nilainya salah | Buka Vercel Dashboard → Project → Settings → Environment Variables, pastikan kedua variabel sudah ada dan nilainya benar |
| **Gambar produk tidak muncul** | Storage bucket belum dibuat atau tidak di-set ke Public | Buat bucket `product-images` di Supabase Storage dan aktifkan opsi "Public bucket" |
| **Halaman `/admin` tidak bisa diakses** | Akun yang digunakan bukan `superadmin` | Jalankan `node scripts/create-superadmin.js` untuk membuat akun superadmin |
| **Data tidak muncul setelah deploy ulang** | Database terpisah dari deployment — data ada di Supabase, bukan di Vercel | Pastikan environment variables di Vercel sudah mengarah ke Supabase project yang benar |
| **Build timeout di Vercel** | Build memakan waktu terlalu lama (default timeout 45 menit) | Cek apakah ada import yang tidak perlu atau dependency yang berat. Pertimbangkan `pnpm build` lokal untuk diagnosa |
| **Error `NEXT_PUBLIC_*` tidak terbaca** | Env vars dengan prefix `NEXT_PUBLIC_` harus tersedia saat build time | Pastikan variabel ditambahkan ke Vercel SEBELUM melakukan deploy, bukan setelah |

---

## 📊 Monitoring & Maintenance

### Memantau Performa di Vercel

- Buka Vercel Dashboard → Project → **Analytics** untuk melihat Core Web Vitals
- Tab **"Functions"** menampilkan performa Server Actions
- Tab **"Logs"** menampilkan runtime logs secara real-time

### Memantau Database di Supabase

- **Database → Tables** — Lihat isi setiap tabel
- **Authentication → Users** — Kelola akun pengguna
- **Storage** — Kelola file yang diupload
- **Logs → Postgres** — Query logs untuk debug performa database

### Backup Database

Supabase (free tier) menyediakan backup otomatis harian. Untuk backup manual:
1. Buka Supabase Dashboard → **Database → Backups**
2. Klik **"Download"** untuk mengunduh backup terbaru

---

*Panduan ini dibuat oleh Tim KelontongSync. Untuk pertanyaan teknis terkait deployment, hubungi **Abdur Rouf** (Project Manager).*
