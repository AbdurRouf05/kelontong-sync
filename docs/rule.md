# Rules & Guidelines Proyek KelontongSync

Dokumen ini berisi aturan main (Rules of Engagement) yang harus dipatuhi oleh kelima anggota tim (Abdur Rouf, Gombet, Rafi, Akmal, dan Adam) agar proses pengembangan berjalan sinkron, terarah, dan terhindar dari konflik (baik konflik kode maupun komunikasi).

## 1. Aturan Komunikasi dan Sinkronisasi (Agile & Scrum)
- **Daily Stand-up**: Diadakan minimal 3 kali seminggu (Senin, Rabu, Jumat) via Online Meeting atau Grup Chat.
- **Format Laporan**:
  1. *Apa yang sudah saya kerjakan kemarin?*
  2. *Apa yang akan saya kerjakan hari ini?*
  3. *Adakah masalah/blocker yang menghambat pekerjaan saya?*
- Project Manager (Abdur Rouf) wajib memastikan tidak ada anggota yang tertahan (*blocked*) selama lebih dari 1 hari kerja.

## 2. Aturan Git dan GitHub (Sangat Penting!)
- **Dilarang keras melakukan `commit` dan `push` langsung ke branch `main` atau `dev`!**
- **Penamaan Branch**: Semua pengerjaan fitur atau perbaikan harus dilakukan di *branch* baru yang dicabangkan dari `dev`.
  - Format fitur baru: `feature/nama-fitur` (Contoh: `feature/pos-cart`)
  - Format perbaikan bug: `bugfix/nama-bug` (Contoh: `bugfix/minus-stock`)
- **Penulisan Commit Message**: Gunakan standar *Conventional Commits*:
  - `feat: Menambahkan halaman dasbor pemilik`
  - `fix: Memperbaiki kalkulasi kembalian kasir`
  - `docs: Memperbarui readme dan SRS`
- **Pull Request (PR)**:
  - Setelah *branch* selesai, buat Pull Request ke branch `dev`.
  - PR tidak boleh di-merge sendiri. Wajib ada **1 Reviewer** (PM atau Dev lain) yang menyetujui (*Approve*) kode tersebut.
  - Jika terjadi *Merge Conflict*, developer yang mengajukan PR wajib menyelesaikan konflik tersebut di komputer lokal mereka sebelum di-merge.

## 3. Standar Penulisan Kode (Coding Convention)
- **Bahasa**: Gunakan **Bahasa Inggris** untuk penamaan Variabel, Fungsi, File, dan Nama Tabel di Database. (Contoh: gunakan `calculateTotal()` bukan `hitungTotal()`, gunakan tabel `products` bukan `barang`).
- **Linter & Formatter**: Wajib mengaktifkan **Prettier** dan **ESLint** pada VSCode masing-masing. Kode yang formatnya berantakan tidak akan diloloskan saat *Code Review*.
- **Kebersihan Kode**:
  - Hapus semua *Dead Code* (kode yang di-comment).
  - Hapus semua `console.log()` sebelum melakukan *commit* dan membuat Pull Request.
  - Tambahkan komentar hanya pada algoritma yang rumit. Untuk kode yang mudah dibaca, biarkan kode tersebut menjelaskan dirinya sendiri.

## 4. Manajemen Tugas (Task Management)
- Menggunakan papan Kanban (seperti Trello, Jira, atau GitHub Projects).
- **Alur Kolom**: `To Do` -> `In Progress` -> `In Review` -> `Done`.
- **Aturan Batas (WIP Limit)**: Setiap anggota tim maksimal hanya boleh memiliki **2 tugas** di kolom `In Progress` pada waktu yang bersamaan agar tetap fokus menyelesaikan pekerjaan.
- Pindahkan tiket ke kolom `In Review` saat sudah membuat Pull Request.

## 5. Deployment dan Pengujian (QA Rules)
- Lingkungan (*Environment*):
  - **Local**: `localhost:3000` (untuk ngoding di komputer masing-masing)
  - **Staging**: `staging-kelontongsync.vercel.app` (untuk testing bersama)
  - **Production**: `kelontongsync.com` (Sistem Final / Rilis)
- **Adam (sebagai QA)** berhak me-*reject* Pull Request atau menunda rilis ke Production jika ditemukan bug kritis (seperti salah hitung total transaksi atau bocornya data antar cabang).
- Tidak boleh ada perubahan *Environment Variables* (seperti API Keys Supabase) tanpa sepengetahuan tim DevOps dan PM.
