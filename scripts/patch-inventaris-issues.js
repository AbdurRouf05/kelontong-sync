const { execSync } = require('child_process');

const users = {
  pm: 'AbdurRouf05',
  inventory: 'Akmal'
};

const missingIssues = [
  {
    title: '[Inventaris] UI Katalog Barang Bento Grid & Tabel',
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Membangun antarmuka katalog barang toko kelontong.

### Detail Implementasi
* Layout Bento Grid Premium untuk visualisasi produk yang modern dan adaptif.
* Tabel terstruktur untuk pengelolaan administratif inventaris yang padat informasi (Commit: \`fbbe594\`).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Form CRUD Tambah & Edit Produk (Modal)',
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
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Mengembangkan sistem penyaringan untuk manajemen persediaan barang yang efisien.

### Detail Implementasi
* Dropdown dinamis penyaringan barang berdasarkan kategori (Commit: \`0d34718\`).
* Visualisasi indikator level stok barang (cukup, menipis, atau habis).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  },
  {
    title: '[Inventaris] Notifikasi Stok Menipis (Early Warning Threshold)',
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
    labels: 'inventory,frontend',
    body: `### Deskripsi Tugas
Mempercepat onboarding pemilik toko kelontong yang memiliki ribuan katalog barang lama.

### Detail Implementasi
* Parser file unggahan format CSV, XLS, dan JSON secara modular.
* Penyelarasan judul kolom dinamis (*auto-header mapping*) dengan toleransi ejaan multibahasa (Commit: \`contoh_import\`).

**Pengerjaan Oleh**: Akmal (@${users.inventory})
**Status**: SELESAI`
  }
];

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('=== KELONTONGSYNC INVENTORY ISSUES PATCHER ===');
  
  let repo = run('git remote get-url origin');
  if (repo) {
    repo = repo.replace('git@github.com:', '').replace('https://github.com/', '').replace('.git', '').trim();
  } else {
    repo = 'AbdurRouf05/kelontong-sync';
  }
  console.log(`✓ Repositori: ${repo}\n`);

  let successCount = 0;
  for (let i = 0; i < missingIssues.length; i++) {
    const iss = missingIssues[i];
    console.log(`[${i + 1}/${missingIssues.length}] Memproses: "${iss.title}"...`);

    const fs = require('fs');
    const path = require('path');
    const tempBodyPath = path.join(__dirname, 'temp-patch-body.md');
    fs.writeFileSync(tempBodyPath, iss.body);

    // Kita assign ke PM (AbdurRouf05) agar pasti sukses dibuat karena dia kolaborator aktif
    let createCmd = `gh issue create --repo "${repo}" --title "${iss.title}" --body-file "${tempBodyPath}" --label "${iss.labels}" --assignee "${users.pm}"`;
    
    let issueUrl = run(createCmd);
    if (!issueUrl) {
      // Jika gagal dengan assignee, coba tanpa assignee
      console.log('  * Gagal dengan assignee PM. Mencoba tanpa assignee...');
      createCmd = `gh issue create --repo "${repo}" --title "${iss.title}" --body-file "${tempBodyPath}" --label "${iss.labels}"`;
      issueUrl = run(createCmd);
    }

    if (fs.existsSync(tempBodyPath)) fs.unlinkSync(tempBodyPath);

    if (issueUrl) {
      const issueNumber = issueUrl.split('/').pop();
      console.log(`  ✓ Sukses dibuat: Issue #${issueNumber} (${issueUrl})`);

      // Langsung tutup issue
      const closeRes = run(`gh issue close ${issueNumber} --repo "${repo}"`);
      if (closeRes !== null) {
        console.log(`  ✓ Sukses ditutup: Issue #${issueNumber} ditandai sebagai SELESAI/DONE.`);
      }
      successCount++;
    } else {
      console.error(`  ❌ Gagal total membuat issue: ${iss.title}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n=== PATCH SELESAI ===`);
  console.log(`Berhasil menambahkan ${successCount} dari ${missingIssues.length} isu Inventaris.`);
}

main();
