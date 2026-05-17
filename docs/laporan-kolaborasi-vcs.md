# LAPORAN UAS: KOLABORASI TIM & IMPLEMENTASI VERSION CONTROL SYSTEM (VCS)
## Proyek: KelontongSync (SaaS Manajemen Toko Kelontong Modern - Neobrutalism)

---

## 📄 1. ABSTRAKSI PROYEK
**KelontongSync** adalah aplikasi berbasis perangkat lunak sebagai layanan (SaaS) yang dirancang untuk membantu pemilik toko kelontong mengelola bisnis mereka secara modern. Aplikasi ini mencakup modul **Kasir (POS)**, **Manajemen Inventaris (Stok)**, **Dasbor Analitis (Laporan Penjualan)**, dan kemampuan **Multi-Cabang (Multi-Tenant)**. 

Desain visual aplikasi ini menerapkan tema **Neobrutalism** (berkarakter tebal, kontras tinggi, border hitam tebal, bayangan tajam/hard shadow, dan warna cerah) yang memberikan kesan kokoh, modern, dan sangat responsif. Proyek ini dibangun menggunakan **Next.js (React)**, **Tailwind CSS**, **TypeScript**, **pnpm**, dan **Supabase Cloud (PostgreSQL)**.

---

## 🛠️ 2. METODOLOGI PENGEMBANGAN & KOLABORASI TIM
Proyek ini diselesaikan secara kolaboratif oleh 5 anggota tim dengan menerapkan metode **Agile & Scrum** yang disesuaikan untuk skala akademik.

### A. Alur Kerja Komunikasi & Sinkronisasi
*   **Daily Stand-up Meeting**: Diadakan secara berkala minimal 3 kali seminggu untuk melaporkan progres harian, rencana pekerjaan hari ini, dan hambatan (*blockers*) yang dihadapi masing-masing anggota.
*   **Task Management (Kanban Board)**: Seluruh tugas dibagi ke dalam tiket kerja terstruktur dalam folder `docs/checklist.md` yang bertindak sebagai papan kontrol tugas (*To Do -> In Progress -> In Review -> Done*). Setiap anggota dibatasi hanya boleh mengerjakan maksimal 2 tugas secara bersamaan untuk menjaga kualitas fokus kerja (*WIP Limit*).

### B. Standardisasi Penulisan Kode (Coding Convention)
Untuk memastikan kode tetap seragam dan mudah dibaca oleh anggota tim lainnya:
*   **Bahasa Pemrograman & Skema Database**: Menggunakan Bahasa Inggris penuh untuk penamaan variabel, fungsi, file, dan tabel database (contoh: tabel `products`, kolom `selling_price`, fungsi `fetchCategories()`).
*   **Linter & Formatter**: Setiap anggota wajib menggunakan **Prettier** dan **ESLint** di VS Code masing-masing. Kode yang berantakan tidak diperbolehkan masuk ke repositori utama.

---

## 🐙 3. STRATEGI IMPLEMENTASI GIT & GITHUB (VCS FLOW)
Manajemen kontrol versi (VCS) pada proyek KelontongSync dirancang dengan sangat disiplin untuk menjaga kestabilan kode di production server dan meminimalkan resiko *merge conflicts*.

```mermaid
gitGraph
    commit id: "Initial"
    branch dev
    checkout dev
    commit id: "Setup Next.js & Supabase Schema"
    branch feature/inventory
    checkout feature/inventory
    commit id: "UI Katalog & Form CRUD (Akmal)"
    checkout dev
    branch feature/multi-cabang
    checkout feature/multi-cabang
    commit id: "UI Settings & SaaS Signup (Ferdy)"
    checkout dev
    merge feature/multi-cabang id: "Merge Ferdy into dev"
    checkout feature/inventory
    commit id: "Notifikasi Early Warning (Akmal)"
    checkout dev
    merge feature/inventory id: "Merge Akmal into dev"
    branch staging
    checkout staging
    merge dev id: "UAT / Testing Staging"
    checkout main
    merge staging id: "Release Production V1.0"
```

### A. Struktur Pencabangan (Branching Strategy)
1.  **`main`**: Branch produksi yang 100% stabil. Terhubung langsung dengan live domain produksi di Vercel. Tidak ada developer yang boleh menyentuh branch ini secara langsung.
2.  **`dev`**: Branch integrasi utama. Tempat bertemunya seluruh fitur yang dikerjakan oleh developer untuk diuji kompilasinya secara bersamaan sebelum rilis.
3.  **`staging`**: Branch khusus untuk kebutuhan *User Acceptance Testing (UAT)* dan peninjauan QA (*Quality Assurance*) bersama PM sebelum dirilis ke branch `main`.
4.  **`feature/*`**: Branch lokal sementara yang dibuat oleh setiap developer untuk menulis modul masing-masing (contoh: `feature/pos`, `feature/inventory`, `feature/multi-cabang`).
5.  **`review/*`**: Branch sementara (seperti `review-akmal`) yang digunakan secara dinamis oleh Project Manager untuk meninjau secara mendalam kode kontributor, melakukan perbaikan bug kompilasi, sebelum akhirnya digabungkan ke `dev`.

### B. Proses Penggabungan Kode & Alur Kerja Integrasi Tanpa PR (Pull Request)
Pada proyek ini, tim **tidak menggunakan sistem Pull Request (PR) di GitHub** untuk menggabungkan kode. Alur kerja yang disepakati adalah sebagai berikut:
1.  **Push Mandiri ke Branch Fitur**: Setiap developer bekerja pada branch fiturnya masing-masing (`feature/*`) dan secara berkala melakukan `push` hasil pekerjaannya ke remote branch di GitHub (`origin/feature/*`).
2.  **Review Lokal oleh Project Manager**: Setelah fitur selesai, developer melaporkan progresnya. Project Manager (Abdur Rouf) menarik (*pull*) branch fitur tersebut ke komputer lokalnya secara mandiri.
3.  **Uji Kompilasi & Penyelarasan Konflik**: Project Manager meninjau kode, menyelesaikan konflik secara lokal, dan menguji kestabilan build menggunakan perintah `pnpm build` untuk menjamin tidak ada error TypeScript maupun kerusakan tag layout.
4.  **Merge Lokal ke Branch `dev`**: Setelah dipastikan bersih dan sukses dikompilasi, Project Manager melakukan *merge* secara lokal ke branch `dev`.
5.  **Sinkronisasi Final**: Hasil penggabungan lokal tersebut kemudian di-push kembali ke repositori GitHub pada branch `dev` dan akhirnya digabungkan ke branch `main` untuk sinkronisasi production.
*   **Penggunaan Non-Fast-Forward Merge (`--no-ff`)**: Semua merge besar dari branch fitur ke `dev` dieksekusi menggunakan perintah `git merge --no-ff` agar riwayat pencabangan grafis tetap terekam jelas, menunjukkan dengan tepat kontribusi masing-masing developer.

---

## 👥 4. PEMBAGIAN PERAN & KONTRIBUSI TIM
Setiap anggota tim memegang peran krusial dalam keberhasilan penyusunan KelontongSync:

### 1. Abdur Rouf (Project Manager & Lead Backend Developer)
*   **Peran**: Mengoordinasikan tim, mengelola rilis, mengulas kode (*code review*), dan penanggung jawab penuh arsitektur backend.
*   **Kontribusi Utama**:
    *   Menginisialisasi Next.js Boilerplate, struktur repositori Git, dan pipeline CI/CD Vercel.
    *   Merancang seluruh skema database PostgreSQL Supabase Cloud (Tabel `stores`, `profiles`, `products`, `categories`, `transactions`, dll).
    *   Membuat API / Server Actions untuk memfasilitasi transaksi data antara frontend dengan Supabase.
    *   Menulis SQL Triggers dan Functions di Supabase untuk kalkulasi pengurangan stok otomatis saat transaksi POS selesai.
    *   Memimpin penyelesaian konflik kode secara lokal dan perbaikan error kompilasi TypeScript untuk menjamin aplikasi lolos uji `pnpm build` dengan status *Clean Build (Exit Code 0)*.

### 2. Rafi Ryuu (Frontend Developer - Modul POS)
*   **Peran**: Bertanggung jawab penuh atas kelancaran sistem kasir (Point of Sales).
*   **Kontribusi Utama**:
    *   Membangun antarmuka POS Neobrutalism yang interaktif dengan pembagian panel daftar barang dan keranjang belanja.
    *   Mengembangkan logika keranjang belanja lengkap (tambah, kurangi nominal, hapus, perhitungan subtotal, diskon, dan pajak secara real-time).
    *   Mengimplementasikan fitur pencarian barang berbasis nama/barcode dan perhitungan nominal kembalian pelanggan.
    *   Membangun fitur cetak struk digital dalam bentuk struk thermal modern dan PDF ramah cetak.

### 3. Akmal (Frontend Developer - Modul Inventaris)
*   **Peran**: Mengelola katalog, klasifikasi kategori barang, dan manajemen persediaan produk.
*   **Kontribusi Utama**:
    *   Membangun katalog barang dengan dual-mode tampilan (Tabel Terstruktur dan Grid Visual).
    *   Membuat form modal interaktif untuk penambahan (CRUD) dan pengeditan barang lengkap dengan validasi.
    *   Mengembangkan sistem penyaringan berdasarkan kategori dan visualisasi level stok barang (cukup, menipis, habis).
    *   Mengimplementasikan notifikasi *Early Warning* otomatis apabila stok produk berada di bawah batas minimum (*low stock threshold*).
    *   Membangun modul impor produk massal cerdas berbasis CSV/Excel/JSON dengan *auto-header mapping* multibahasa.
    *   Mengoptimalkan visualisasi responsif dengan layout Bento Grid Premium yang sangat adaptif di berbagai ukuran perangkat.

### 4. Adam (Frontend Developer - Modul Dasbor & Laporan)
*   **Peran**: Bertanggung jawab menyajikan rangkuman analitis performa bisnis pemilik toko.
*   **Kontribusi Utama**:
    *   Merancang halaman Dasbor Utama dengan widget ringkasan metrik (Omzet, Margin Laba, Total Transaksi, Produk Terjual).
    *   Mengintegrasikan library visualisasi grafik interaktif menggunakan Recharts untuk bagan tren penjualan dan pie chart kategori produk terpopuler.
    *   Mengembangkan filter periode dinamis (Harian, Mingguan, Bulanan, Tahunan) untuk menyaring data grafik secara instan.
    *   Membuat tata letak responsif penuh (*mobile-friendly*) untuk aksesibilitas tinggi bagi pemilik toko di lapangan.

### 5. Ferdy (Frontend Developer - Modul Multi-Cabang & Settings)
*   **Peran**: Menangani konfigurasi toko, hak akses karyawan, serta kemampuan sistem multi-tenant.
*   **Kontribusi Utama**:
    *   Mengembangkan antarmuka pendaftaran toko SaaS *Multi-Step* (`/register`) yang interaktif bagi pendaftar bisnis baru.
    *   Membangun halaman manajemen utama Super Admin Tenant (`/tenant`) untuk memonitor ringkasan cabang, total omzet gabungan seluruh tenant, dan status keaktifan toko.
    *   Membuat modul pengaturan profil bisnis, data profil cabang, dan manajemen akun staf/kasir terintegrasi.
    *   Menerapkan fitur perpindahan antar cabang aktif (Store Switcher) di header dasbor secara mulus.
    *   Mengimplementasikan developer bypass mode dan widget detektor latency database Supabase real-time untuk mempermudah monitoring koneksi jaringan server selama pengembangan.

---

## 📈 5. EVALUASI DAN PROGRES SAAT INI
Saat ini, proyek KelontongSync berada di penghujung **Fase 4 (Testing & Deployment Final)** dengan persentase penyelesaian **90%**:
1.  **Core Fitur Selesai**: Modul POS, Inventaris, Laporan, dan Pengaturan telah selesai dikembangkan oleh masing-masing developer di branch fiturnya dan terintegrasi dengan backend.
2.  **Integrasi Supabase Sempurna**: API, Triggers database, dan interaksi data dinamis berjalan dengan sangat lancar dan real-time.
3.  **Proses Merge dev & main Sukses**: Seluruh branch milik developer (`feature/*`) telah sukses digabungkan ke branch integrasi utama (`dev`) dan branch rilis (`main`) secara aman tanpa menyisakan satu pun konflik kode.
4.  **Catatan Fitur Multi-Tenant & Multi-Cabang**: Meskipun antarmuka visual pendaftaran multi-step, dasbor super admin (`/tenant`), dan store switcher telah siap di frontend, **fitur logika multi-tenant dan isolasi data antar multi-cabang saat ini masih belum diaktifkan sepenuhnya**. Kebijakan Row Level Security (RLS) pada database Supabase dinonaktifkan sementara demi memberikan kemudahan serta kelancaran proses pengujian data (*testing dev*) selama presentasi UAS.
5.  **Aplikasi Stabil & Siap UAS**: Proyek telah lulus pengujian kompilasi produksi Next.js Turbopack secara lokal dan siap dideploy untuk kebutuhan presentasi UAS esok hari.

---
*Laporan ini disusun secara kolaboratif sebagai bukti nyata pemahaman tim KelontongSync atas konsep arsitektur perangkat lunak, kolaborasi tim yang sehat, serta kedisiplinan implementasi Version Control System (VCS).*
