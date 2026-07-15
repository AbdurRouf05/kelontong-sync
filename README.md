<div align="center">

# Kelontong Sync

**Enterprise Resource Planning (ERP) System as a SaaS**

[![Next.js](https://img.shields.io/badge/Framework-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/Platform-PWA-5A0FC8?style=flat-square&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

</div>

---

## PROJECT OVERVIEW

Sebuah sistem Enterprise Resource Planning (ERP) dengan konsep Software as a Service (SaaS). Dirancang khusus sebagai Progressive Web App (PWA) untuk manajemen ritel yang memiliki kemampuan sinkronisasi tingkat tinggi, memungkinkan operasional tanpa henti (offline-first).

## KEY FEATURES

- **Offline-First Architecture:** Sistem kasir dan inventaris tetap berfungsi optimal meski tanpa koneksi internet.
- **Smart Synchronization:** Penyinkronan data otomatis dengan server pusat (Supabase) ketika koneksi kembali tersedia.
- **Inventory Management:** Pemantauan stok barang secara akurat dan real-time.
- **Financial Analytics:** Pelaporan transaksi dan arus kas otomatis.

## TECHNOLOGY STACK

- **Frontend:** Next.js, React
- **Local Storage / Caching:** IndexedDB
- **Backend & Database:** Supabase

## GETTING STARTED

**Prerequisites:** Node.js (v18+)

```bash
# Clone repository
git clone https://github.com/AbdurRouf05/kelontong-sync.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```
