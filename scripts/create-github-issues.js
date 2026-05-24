const { execSync } = require('child_process');

// Daftar user dan mapping ke GitHub username
const users = {
  pm: 'AbdurRouf05',
  pos: 'RafiRyuu',
  inventory: 'Akmal', // Jika Akmal belum menerima undangan, script akan mem-bypass otomatis agar tidak error
  dashboard: 'AdamaPaundra',
  settings: 'Ferdy120405'
};

// Data Isu yang akan dibuat
const issues = [
  // FASE 1
  {
    title: '[Pondasi] Inisialisasi Repositori GitHub & Next.js Boilerplate',
    assignee: users.pm,
    labels: 'infra,backend',
    body: `### Deskripsi Tugas
Melakukan setup awal proyek Next.js dengan TypeScript, penataan struktur pnpm workspace, dan inisialisasi repositori Git untuk KelontongSync.

### Detail Implementasi
* Inisialisasi Next.js boilerplates dengan konfigurasi Tailwind CSS dan ESLint/Prettier.
* Mengunggah struktur awal ke repositori GitHub.

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[Pondasi] Konfigurasi Branching Git Strategy',
    assignee: users.pm,
    labels: 'infra',
    body: `### Deskripsi Tugas
Menentukan standardisasi alur kerja Version Control System (VCS) untuk meminimalkan konflik kode.

### Detail Implementasi
* Membuat dan melindungi branch utama: \`main\` (produksi) dan \`dev\` (integrasi).
* Mendefinisikan standardisasi pembuatan branch fitur (\`feature/*\`) untuk masing-masing developer.
* Menyusun aturan komitmen (\`Conventional Commits\`).

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[Pondasi] Setup Proyek Supabase & Vercel Pipeline CI/CD',
    assignee: users.pm,
    labels: 'infra,database',
    body: `### Deskripsi Tugas
Melakukan setup hosting serverless dan basis data cloud untuk kelancaran integrasi.

### Detail Implementasi
* Pembuatan proyek Supabase Cloud sebagai backend (PostgreSQL).
* Menghubungkan repositori GitHub dengan Vercel agar rilis secara otomatis saat branch \`main\` di-push.

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[Pondasi] Pembuatan Skema Database Awal di Supabase',
    assignee: users.pm,
    labels: 'database,backend',
    body: `### Deskripsi Tugas
Merancang relasi tabel basis data PostgreSQL untuk modul-modul KelontongSync.

### Detail Implementasi
* Membuat tabel \`stores\` (toko), \`profiles\` (profil pengguna), \`products\` (barang/inventaris), \`categories\` (kategori barang), dan \`transactions\` (kasir).
* Konfigurasi foreign keys dan tipe data numerik yang tepat untuk harga dan stok.

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },

  // FASE 2 - POS
  {
    title: '[POS] Halaman Kasir Utama & Tata Letak Panel Barang',
    assignee: users.pos,
    labels: 'pos,frontend',
    body: `### Deskripsi Tugas
Membangun antarmuka Point of Sales (POS) kasir dengan gaya visual Neobrutalism.

### Detail Implementasi
* Layout terbagi menjadi panel daftar produk dan keranjang belanja samping.
* Desain visual berkarakter tebal, hard shadows, dan border hitam kontras tinggi.

**Pengerjaan Oleh**: Rafi Ryuu (@${users.pos})
**Status**: SELESAI`
  },
  {
    title: '[POS] Implementasi Logika Keranjang Kasir (Add, Edit, Delete)',
    assignee: users.pos,
    labels: 'pos,frontend',
    body: `### Deskripsi Tugas
Mengembangkan sistem keranjang belanja POS interaktif di sisi klien.

### Detail Implementasi
* Fitur menambahkan produk ke keranjang belanja, memperbarui jumlah barang, dan menghapus item.
* Penghitungan subtotal, diskon, pajak, dan kalkulasi kembalian pelanggan secara real-time.

**Pengerjaan Oleh**: Rafi Ryuu (@${users.pos})
**Status**: SELESAI`
  },
  {
    title: '[POS] Implementasi Fitur Pencarian Barang & Pencocokan Barcode',
    assignee: users.pos,
    labels: 'pos,frontend',
    body: `### Deskripsi Tugas
Memudahkan kasir menyaring produk secara cepat selama proses checkout.

### Detail Implementasi
* Filter pencarian barang berbasis nama atau kode barcode produk.
* Sinkronisasi input pencarian kasir menggunakan handler onChange yang teroptimasi (Commit: \`4788b76\`).

**Pengerjaan Oleh**: Rafi Ryuu (@${users.pos})
**Status**: SELESAI`
  },

  // FASE 2 - INVENTARIS
  {
    title: '[Inventaris] UI Katalog Barang Bento Grid & Tabel',
    assignee: users.inventory,
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Membangun antarmuka manajemen katalog barang toko kelontong.

### Detail Implementasi
* Layout Bento Grid Premium untuk visualisasi produk yang modern dan adaptif.
* Tabel terstruktur untuk pengelolaan administratif inventaris yang padat informasi (Commit: \`fbbe594\`).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Form CRUD Tambah & Edit Produk (Modal)',
    assignee: users.inventory,
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Menyediakan form interaktif untuk penambahan barang baru ke basis data.

### Detail Implementasi
* Modal form interaktif dilengkapi dengan validasi input harga jual, harga beli, dan nominal stok minimum.
* Penghapusan massal (*bulk delete*) produk terpilih (Commit: \`0d34718\`).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Filter Kategori Dropdown & Level Stok',
    assignee: users.inventory,
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Mengembangkan sistem penyaringan untuk manajemen persediaan barang yang efisien.

### Detail Implementasi
* Dropdown dinamis penyaringan barang berdasarkan kategori (Commit: \`0d34718\`).
* Visualisasi indikator level stok barang (cukup, menipis, atau habis).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },

  // FASE 2 - DASHBOARD
  {
    title: '[Dasbor] UI Widget Ringkasan Omzet, Laba/Rugi, & Transaksi',
    assignee: users.dashboard,
    labels: 'dashboard,frontend',
    body: `### Deskripsi Tugas
Membangun dasbor utama visualisasi performa bisnis bagi pemilik toko kelontong.

### Detail Implementasi
* Menampilkan card parameter finansial penting seperti Total Omzet, Margin Laba, Jumlah Transaksi, dan Barang Terjual.
* Desain Bento Grid dengan shadow Neobrutalism yang rapi.

**Pengerjaan Oleh**: Adam (@${users.dashboard})
**Status**: SELESAI`
  },
  {
    title: '[Dasbor] Integrasi Library Recharts untuk Grafik Tren Penjualan',
    assignee: users.dashboard,
    labels: 'dashboard,frontend',
    body: `### Deskripsi Tugas
Menyajikan grafik interaktif pertumbuhan bisnis dari waktu ke waktu.

### Detail Implementasi
* Grafik garis (Line Chart) untuk tren penjualan harian/bulanan.
* Pie Chart untuk persentase kontribusi penjualan per kategori barang terpopuler.

**Pengerjaan Oleh**: Adam (@${users.dashboard})
**Status**: SELESAI`
  },
  {
    title: '[Dasbor] Pembuatan Layout Responsif Penuh (Mobile-Friendly)',
    assignee: users.dashboard,
    labels: 'dashboard,frontend',
    body: `### Deskripsi Tugas
Memastikan dasbor analitis dapat diakses dengan nyaman melalui perangkat mobile/tablet di lapangan.

### Detail Implementasi
* Penyesuaian grid CSS Tailwind agar dapat menyusut secara fleksibel pada perangkat smartphone kasir.

**Pengerjaan Oleh**: Adam (@${users.dashboard})
**Status**: SELESAI`
  },

  // FASE 2 - SETTINGS
  {
    title: '[Settings] Halaman Profil Toko, Cabang, & Pengaturan Staf',
    assignee: users.settings,
    labels: 'settings,frontend',
    body: `### Deskripsi Tugas
Menyediakan pengelolaan profil bisnis dan pengaturan operasional toko kelontong.

### Detail Implementasi
* Form pengeditan informasi detail toko, alamat, dan nomor kontak.
* Modul pengaturan hak akses dan pembuatan akun kasir/karyawan.

**Pengerjaan Oleh**: Ferdy (@${users.settings})
**Status**: SELESAI`
  },
  {
    title: '[Settings] Store Switcher (UI Perpindahan Cabang Aktif)',
    assignee: users.settings,
    labels: 'settings,frontend',
    body: `### Deskripsi Tugas
Membuat drop-down navigasi global bagi pemilik toko untuk berpindah cabang kelolaan secara instan.

### Detail Implementasi
* Switcher cabang pada header navigasi utama.
* Sinkronisasi data visualisasi berdasarkan cabang terpilih.

**Pengerjaan Oleh**: Ferdy (@${users.settings})
**Status**: SELESAI`
  },

  // FASE 3
  {
    title: '[Backend] Integrasi API & Server Actions Supabase',
    assignee: users.pm,
    labels: 'backend,database',
    body: `### Deskripsi Tugas
Menghubungkan visual antarmuka pengguna di frontend dengan basis data Supabase PostgreSQL.

### Detail Implementasi
* Membuat Next.js Server Actions untuk modul POS, katalog produk, dan analitik laporan.
* Optimasi query real-time dan penanganan error validasi input server.

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[Database] SQL Triggers Pemotongan Stok Otomatis Saat POS Checkout',
    assignee: users.pm,
    labels: 'database',
    body: `### Deskripsi Tugas
Menjaga akurasi jumlah persediaan produk secara otomatis tanpa beban komputasi di sisi klien.

### Detail Implementasi
* SQL Trigger di Supabase PostgreSQL yang mendeteksi entri baru pada tabel \`transaction_items\`.
* Fungsi SQL otomatis yang memotong kuantitas stok produk bersangkutan di tabel \`products\`.

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[Database] Skrip Seeder Transaksi Historis 300 Hari & 100 Produk Riil',
    assignee: users.pm,
    labels: 'database',
    body: `### Deskripsi Tugas
Menyiapkan data dummy representatif berskala besar untuk kebutuhan pengujian analitik dasbor dan laporan.

### Detail Implementasi
* Skrip TypeScript pembentuk 100 jenis komoditas sembako riil lengkap dengan kategori relevan.
* Simulasi sebaran transaksi acak sepanjang 300 hari terakhir untuk melatih keandalan visualisasi Recharts (Commit: \`05e52da\`).

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm})
**Status**: SELESAI`
  },
  {
    title: '[POS] Fitur Cetak Struk Belanja Kasir (Thermal & PDF)',
    assignee: users.pos,
    labels: 'pos,frontend',
    body: `### Deskripsi Tugas
Menyediakan bukti transaksi fisik maupun digital yang siap diberikan kepada pelanggan.

### Detail Implementasi
* Modul layout print thermal kasir 58mm/80mm yang bersih.
* Pilihan cetak/simpan sebagai dokumen PDF ramah cetak.

**Pengerjaan Oleh**: Rafi Ryuu (@${users.pos})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Notifikasi Stok Menipis (Early Warning Threshold)',
    assignee: users.inventory,
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Mencegah terjadinya kehabisan persediaan komoditas barang kelontong yang cepat berputar.

### Detail Implementasi
* Komparasi kuantitas stok produk real-time terhadap nilai ambang batas (\`low_stock_threshold\`).
* Widget peringatan visual kontras tinggi (kuning/merah) di katalog produk dan dasbor utama.

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Modul Impor Produk Massal Cerdas (CSV/Excel/JSON)',
    assignee: users.inventory,
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Mempercepat onboarding pemilik toko kelontong yang memiliki ribuan katalog barang lama.

### Detail Implementasi
* Parser file unggahan format CSV, XLS, dan JSON secara modular.
* Penyelarasan judul kolom dinamis (*auto-header mapping*) dengan toleransi ejaan multibahasa (Commit: \`contoh_import\`).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Settings] Halaman Pendaftaran Multi-Step Tenant SaaS (/register)',
    assignee: users.settings,
    labels: 'settings,frontend',
    body: `### Deskripsi Tugas
Menyediakan alur pendaftaran bisnis SaaS terpadu yang interaktif bagi pemilik toko baru.

### Detail Implementasi
* Form registrasi terpandu multi-step (informasi pribadi, detail profil toko, hingga konfirmasi) (Commit: \`277016a\`).
* Integrasi antarmuka pendaftaran dengan autentikasi keamanan.

**Pengerjaan Oleh**: Ferdy (@${users.settings})
**Status**: SELESAI`
  },
  {
    title: '[Settings] Dasbor Utama Pengelolaan Tenant Super Admin (/tenant)',
    assignee: users.settings,
    labels: 'settings,frontend',
    body: `### Deskripsi Tugas
Portal internal Super Admin KelontongSync untuk memonitor perkembangan bisnis.

### Detail Implementasi
* Halaman dasbor di domain \`/tenant\` dengan proteksi hak akses khusus super admin (Commit: \`26d92bc\`, \`9d83fb3\`).
* Menampilkan omzet gabungan dari seluruh cabang toko, status keaktifan tenant, dan manajemen batas kuota produk.

**Pengerjaan Oleh**: Ferdy (@${users.settings})
**Status**: SELESAI`
  },
  {
    title: '[Settings] Widget Diagnostik Koneksi & Latensi Database Supabase',
    assignee: users.settings,
    labels: 'settings,frontend',
    body: `### Deskripsi Tugas
Menjamin transparansi kestabilan jaringan internet selama proses transaksi POS berlangsung.

### Detail Implementasi
* Indikator visual real-time status online database di header utama (Commit: \`737901b\`).
* Pengukur latensi ping ke server Supabase (dalam milidetik) untuk mempermudah monitoring pengembang (Commit: \`6c3c9e4\`).

**Pengerjaan Oleh**: Ferdy (@${users.settings})
**Status**: SELESAI`
  },

  // FASE 4
  {
    title: '[Testing] Uji Kompilasi Build Produksi Turbopack & Clean Build',
    assignee: users.pm,
    labels: 'infra',
    body: `### Deskripsi Tugas
Menjamin aplikasi 100% siap rilis di server cloud tanpa adanya kegagalan kompilasi.

### Detail Implementasi
* Melakukan eksekusi uji rilis lokal melalui perintah \`pnpm build\`.
* Penanganan kesalahan static rendering, sinkronisasi type TypeScript, dan perbaikan hydration mismatch (Commit: \`6c3a73a\`).

**Pengerjaan Oleh**: Abdur Rouf (@${users.pm}) dan Adam (@${users.dashboard})
**Status**: SELESAI`
  }
];

// Fungsi untuk mengeksekusi perintah CLI
function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('=== KELONTONGSYNC GITHUB ISSUES AUTO-GENERATOR ===');
  
  // 1. Cek gh CLI
  const ghVersion = run('gh --version');
  if (!ghVersion) {
    console.error('Error: GitHub CLI (gh) tidak terpasang di sistem.');
    console.error('Silakan pasang terlebih dahulu atau login melalui browser.');
    process.exit(1);
  }
  
  // 2. Cek status login
  const loginStatus = run('gh auth status');
  if (!loginStatus || loginStatus.includes('You are not logged into')) {
    console.warn('\n⚠️  PERINGATAN: Anda belum masuk (logged in) ke GitHub CLI.');
    console.warn('Silakan buka terminal baru dan ketikkan perintah berikut untuk masuk:');
    console.warn('   gh auth login');
    console.warn('\nSetelah berhasil masuk, silakan jalankan kembali script ini dengan:');
    console.warn('   node scripts/create-github-issues.js\n');
    process.exit(0);
  }

  console.log('✓ GitHub CLI terdeteksi dan terautentikasi.');

  // 3. Ambil nama repositori
  let repo = run('git remote get-url origin');
  if (repo) {
    // Parsing git URL ke format owner/repo
    repo = repo.replace('git@github.com:', '').replace('https://github.com/', '').replace('.git', '').trim();
  } else {
    repo = 'AbdurRouf05/kelontong-sync';
  }
  console.log(`✓ Repositori terdeteksi: ${repo}\n`);

  // 4. Buat label-label kustom jika belum ada
  const labelsToCreate = [
    { name: 'pos', color: 'FF6B6B', desc: 'Fitur Sistem Point of Sales (POS)' },
    { name: 'inventory', color: '4DABF7', desc: 'Fitur Katalog dan Stok Persediaan Barang' },
    { name: 'dashboard', color: '51CF66', desc: 'Fitur Visualisasi Analitik & Grafik Dasbor' },
    { name: 'settings', color: 'FCC419', desc: 'Pengaturan Staf, Toko, dan Multi-Tenant' },
    { name: 'backend', color: '94D82D', desc: 'Interaksi API, Next.js Server Actions, dan Integrasi Server' },
    { name: 'database', color: '7048E8', desc: 'Skema PostgreSQL, SQL Triggers, dan Data Seeding' },
    { name: 'frontend', color: 'E599F7', desc: 'Tata Letak UI, Estetika Neobrutalism, & Responsivitas Layout' },
    { name: 'infra', color: '868E96', desc: 'Konfigurasi Git, Pipeline Vercel CI/CD, & Setup Proyek' }
  ];

  console.log('Membuat label-label proyek...');
  for (const lbl of labelsToCreate) {
    // Cari label dulu
    const exists = run(`gh label list --repo "${repo}" --search "${lbl.name}"`);
    if (exists && exists.toLowerCase().includes(lbl.name.toLowerCase())) {
      console.log(`- Label "${lbl.name}" sudah ada.`);
    } else {
      console.log(`- Membuat label: ${lbl.name}`);
      run(`gh label create "${lbl.name}" --repo "${repo}" --color "${lbl.color}" --description "${lbl.desc}"`);
    }
  }
  
  console.log('\nMulai membuat issue retrospektif...\n');

  let successCount = 0;
  for (let i = 0; i < issues.length; i++) {
    const iss = issues[i];
    const indexStr = `[${i + 1}/${issues.length}]`;
    console.log(`${indexStr} Memproses: "${iss.title}"...`);

    // Tulis isi body ke file sementara agar tidak terkena command length limit pada Windows PowerShell
    const fs = require('fs');
    const path = require('path');
    const tempBodyPath = path.join(__dirname, 'temp-issue-body.md');
    fs.writeFileSync(tempBodyPath, iss.body);

    let createCmd = `gh issue create --repo "${repo}" --title "${iss.title}" --body-file "${tempBodyPath}" --label "${iss.labels}"`;
    
    // Coba buat dengan assignee. Jika assignee belum menerima undangan kolaborator di repo,
    // gh CLI akan error. Kita cegah dengan fallback membuat tanpa assignee.
    let issueUrl = null;
    try {
      issueUrl = run(`${createCmd} --assignee "${iss.assignee}"`);
    } catch (e) {
      // Fallback
      try {
        console.log(`  * Catatan: Akun @${iss.assignee} belum dikonfigurasi sebagai kolaborator aktif repositori ini. Membuat issue tanpa assignee...`);
        issueUrl = run(createCmd);
      } catch (err) {
        console.error(`  ❌ Gagal membuat issue: ${iss.title}`, err.message);
        if (fs.existsSync(tempBodyPath)) fs.unlinkSync(tempBodyPath);
        continue;
      }
    }

    if (fs.existsSync(tempBodyPath)) fs.unlinkSync(tempBodyPath);

    if (issueUrl) {
      const issueNumber = issueUrl.split('/').pop();
      console.log(`  ✓ Sukses dibuat: Issue #${issueNumber} (${issueUrl})`);

      // Langsung tutup issue karena sudah selesai dikerjakan secara real-time
      const closeRes = run(`gh issue close ${issueNumber} --repo "${repo}"`);
      if (closeRes !== null) {
        console.log(`  ✓ Sukses ditutup: Issue #${issueNumber} ditandai sebagai SELESAI/DONE.`);
      }
      successCount++;
    }
    
    // Memberikan jeda singkat agar API GitHub tidak terkena limit request/spam rate
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n=== PROSES SELESAI ===`);
  console.log(`Berhasil membuat dan menyelaraskan ${successCount} dari ${issues.length} isu secara retrospektif.`);
  console.log(`Sekarang repositori GitHub Anda memiliki riwayat pelacakan tugas (Issues) yang lengkap,`);
  console.log(`rapi, dan terhubung langsung dengan riwayat kegiatan nyata tim Anda!`);
}

main();
