# Persiapan Database Supabase (SQL) — Arsitektur Multi-Branch SaaS

> **PENTING**: Salin **seluruh** kode SQL di bawah ini ke dalam **SQL Editor** di dashboard Supabase Anda, lalu klik **Run**. Kode ini akan menghapus tabel lama dan membuat ulang semuanya dari nol sesuai arsitektur Multi-Branch SaaS.

---

## SQL Lengkap (Jalankan Sekaligus di SQL Editor Supabase)

```sql
-- ============================================================
-- KELONTONGSYNC — SKEMA DATABASE MULTI-BRANCH SaaS
-- Terakhir diperbarui: 2026-05-24
-- ============================================================

-- ┌──────────────────────────────────────────────────────────┐
-- │ LANGKAH 1: BERSIHKAN TABEL LAMA (RESET DATABASE) │
-- └──────────────────────────────────────────────────────────┘

DROP TRIGGER IF EXISTS trg_reduce_stock ON transaction_items;
DROP FUNCTION IF EXISTS reduce_stock_after_transaction();

DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS product_stocks CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- ┌──────────────────────────────────────────────────────────┐
-- │ LANGKAH 2: BUAT TABEL SESUAI ARSITEKTUR SaaS │
-- └──────────────────────────────────────────────────────────┘

-- 1. Tabel Bisnis (Tenant Utama / Top-Level Entity)
-- Setiap pendaftaran user baru akan menghasilkan 1 entitas bisnis.
-- Semua data (cabang, produk, transaksi) terikat ke bisnis ini.
CREATE TABLE businesses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name TEXT NOT NULL,
 owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Cabang / Toko (Store / Branch)
-- Satu bisnis bisa memiliki banyak cabang.
CREATE TABLE stores (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 address TEXT,
 phone TEXT,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Profil Pengguna (Owner / Kasir / Super Admin)
-- Menghubungkan Supabase Auth User dengan entitas bisnis.
-- `current_store_id` menunjukkan cabang yang sedang aktif digunakan user.
CREATE TABLE profiles (
 id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
 current_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
 full_name TEXT,
 role TEXT CHECK (role IN ('superadmin', 'owner', 'kasir')),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Kategori Barang (Global per Bisnis)
-- Kategori bersifat global: berlaku untuk semua cabang dalam satu bisnis.
CREATE TABLE categories (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 icon TEXT DEFAULT '',
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Katalog Produk (Global per Bisnis)
-- Katalog produk bersifat global: berlaku untuk semua cabang.
-- Stok per cabang dicatat terpisah di tabel `product_stocks`.
CREATE TABLE products (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
 name TEXT NOT NULL,
 barcode TEXT,
 cost_price NUMERIC NOT NULL DEFAULT 0,
 selling_price NUMERIC NOT NULL DEFAULT 0,
 image_url TEXT,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Stok Per Cabang (Branch-Specific Inventory)
-- Mencatat jumlah stok setiap produk di masing-masing cabang.
CREATE TABLE product_stocks (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 stock INTEGER NOT NULL DEFAULT 0,
 min_stock INTEGER DEFAULT 5,
 updated_at TIMESTAMPTZ DEFAULT NOW(),
 UNIQUE(product_id, store_id)
);

-- 7. Tabel Transaksi Penjualan
CREATE TABLE transactions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 total_amount NUMERIC NOT NULL DEFAULT 0,
 payment_amount NUMERIC NOT NULL DEFAULT 0,
 change_amount NUMERIC NOT NULL DEFAULT 0,
 payment_method TEXT DEFAULT 'CASH',
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Detail Item Transaksi
CREATE TABLE transaction_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
 product_id UUID REFERENCES products(id) ON DELETE SET NULL,
 quantity INTEGER NOT NULL CHECK (quantity > 0),
 unit_price NUMERIC NOT NULL,
 subtotal NUMERIC NOT NULL,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Log Perubahan Stok (Audit Trail)
CREATE TABLE stock_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id UUID REFERENCES products(id) ON DELETE CASCADE,
 change_amount INTEGER NOT NULL,
 type TEXT CHECK (type IN ('initial', 'restock', 'sale', 'adjustment', 'return')),
 notes TEXT,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Pengaturan Toko (Per Cabang)
CREATE TABLE store_settings (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
 receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
 low_stock_threshold INTEGER DEFAULT 5,
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ┌──────────────────────────────────────────────────────────┐
-- │ LANGKAH 3: TRIGGER OTOMASI STOK │
-- └──────────────────────────────────────────────────────────┘

-- Trigger ini TIDAK dipakai di arsitektur baru karena stok dikelola
-- melalui tabel `product_stocks` (per cabang), bukan kolom `stock`
-- di tabel `products`. Disimpan untuk referensi jika dibutuhkan.

-- CREATE OR REPLACE FUNCTION reduce_stock_after_transaction()
-- RETURNS TRIGGER AS $$
-- BEGIN
-- UPDATE product_stocks
-- SET stock = stock - NEW.quantity
-- WHERE product_id = NEW.product_id;
-- RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_reduce_stock
-- AFTER INSERT ON transaction_items
-- FOR EACH ROW
-- EXECUTE FUNCTION reduce_stock_after_transaction();

-- ┌──────────────────────────────────────────────────────────┐
-- │ LANGKAH 4: MATIKAN RLS (MODE DEVELOPMENT) │
-- └──────────────────────────────────────────────────────────┘

ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_stocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;
```

---

## Referensi Cepat: Ringkasan Tabel

| # | Tabel | Fungsi | Relasi Utama |
|---|-------|--------|--------------|
| 1 | `businesses` | Entitas bisnis / tenant utama | `owner_id` → `auth.users` |
| 2 | `stores` | Cabang / toko milik bisnis | `business_id` → `businesses` |
| 3 | `profiles` | Profil pengguna (superadmin/owner/kasir) | `id` → `auth.users`, `business_id` → `businesses`, `current_store_id` → `stores` |
| 4 | `categories` | Kategori barang (global per bisnis) | `business_id` → `businesses` |
| 5 | `products` | Katalog produk (global per bisnis) | `business_id` → `businesses`, `category_id` → `categories` |
| 6 | `product_stocks` | Stok produk per cabang | `product_id` → `products`, `store_id` → `stores` |
| 7 | `transactions` | Transaksi penjualan | `business_id` → `businesses`, `store_id` → `stores`, `cashier_id` → `auth.users` |
| 8 | `transaction_items` | Detail item transaksi | `transaction_id` → `transactions`, `product_id` → `products` |
| 9 | `stock_logs` | Audit trail perubahan stok | `product_id` → `products` |
| 10 | `store_settings` | Pengaturan per cabang | `store_id` → `stores` |

---

## Diagram Relasi (ERD Sederhana)

```
┌─────────────┐
│ auth.users │ (Supabase Built-in)
└──────┬──────┘
 │
 │ owner_id
 ▼
┌─────────────┐ ┌─────────────┐
│ businesses │────│ stores │
└──────┬──────┘ └──────┬──────┘
 │ │
 │ business_id │ store_id
 ▼ ▼
┌─────────────┐ ┌──────────────┐
│ profiles │ │product_stocks│
│ categories │ │store_settings│
│ products │ └──────────────┘
│ transactions│
└─────────────┘
```

---

## Catatan Penting

1. **Storage Bucket**: Buat bucket `product-images` secara **manual** di dashboard Supabase Storage dan set ke **Public**.
2. **RLS Dinonaktifkan**: Semua tabel memiliki RLS yang dimatikan untuk kemudahan development. Aktifkan kembali sebelum deployment produksi.
3. **Trigger Stok**: Trigger otomasi stok lama di-*comment* karena arsitektur baru menggunakan tabel `product_stocks` terpisah. Pengurangan stok dilakukan langsung oleh kode aplikasi di halaman POS.
4. **Role `superadmin`**: Profil dengan role `superadmin` **tidak terikat** ke bisnis/cabang manapun. Mereka hanya bisa mengakses halaman `/admin` dan `/tenant` untuk mengelola semua tenant platform.

## Table `businesses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` | |
| `owner_id` | `uuid` | |
| `created_at` | `timestamptz` | Nullable |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `business_id` | `uuid` | |
| `name` | `text` | |
| `icon` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

## Table `product_stocks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` | |
| `store_id` | `uuid` | |
| `stock` | `int4` | |
| `min_stock` | `int4` | Nullable |
| `updated_at` | `timestamptz` | Nullable |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `business_id` | `uuid` | |
| `category_id` | `uuid` | Nullable |
| `name` | `text` | |
| `barcode` | `text` | Nullable |
| `cost_price` | `numeric` | |
| `selling_price` | `numeric` | |
| `created_at` | `timestamptz` | Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `business_id` | `uuid` | Nullable |
| `current_store_id` | `uuid` | Nullable |
| `full_name` | `text` | Nullable |
| `role` | `text` | Nullable |
| `updated_at` | `timestamptz` | Nullable |

## Table `stock_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` | Nullable |
| `change_amount` | `int4` | |
| `type` | `text` | Nullable |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

## Table `stores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `business_id` | `uuid` | |
| `name` | `text` | |
| `address` | `text` | Nullable |
| `phone` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

## Table `transaction_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `transaction_id` | `uuid` | |
| `product_id` | `uuid` | Nullable |
| `quantity` | `int4` | |
| `unit_price` | `numeric` | |
| `subtotal` | `numeric` | |
| `created_at` | `timestamptz` | Nullable |

## Table `transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `business_id` | `uuid` | |
| `store_id` | `uuid` | |
| `cashier_id` | `uuid` | |
| `total_amount` | `numeric` | |
| `payment_amount` | `numeric` | |
| `change_amount` | `numeric` | |
| `payment_method` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

