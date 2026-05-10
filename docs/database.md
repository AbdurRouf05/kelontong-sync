# Persiapan Database Supabase (SQL)

Silakan salin dan tempel kode SQL di bawah ini ke dalam **SQL Editor** di dashboard Supabase Anda, lalu klik **Run**.

---

## 🟢 1. Struktur Inti (Dibuat oleh: Abdur Rouf - PM)
**Fungsi**: Fondasi utama aplikasi untuk menyimpan data toko, karyawan, barang, dan transaksi.

```sql
-- Hapus tabel jika sudah ada (Gunakan ini jika ingin reset database)
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;

-- 1. Tabel Toko (Tenant)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- [Tambahan oleh Gombet]: Untuk melacak pemilik cabang pada fitur Multi-Cabang
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Profil (Karyawan/Owner)
-- Menghubungkan Supabase Auth dengan data toko
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- [Disederhanakan oleh Gombet]: Untuk mempermudah testing CRUD tanpa Auth User beneran
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('owner', 'kasir')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Kategori Barang
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦', -- [Tambahan: Akmal]: Ikon kategori dalam bentuk Emoji
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Barang (Inventory)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  barcode TEXT,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  image_url TEXT, -- [Tambahan: Inventory]: URL foto produk dari Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

-- 5. Tabel Transaksi
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Detail Transaksi
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MATIKAN RLS (Agar tidak error saat testing)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```


---

## 🟡 2. Otomatisasi Stok (Dibuat oleh: Abdur Rouf - PM)
**Fungsi**: Memastikan stok barang berkurang secara otomatis setiap kali ada transaksi penjualan di kasir.

```sql
CREATE OR REPLACE FUNCTION reduce_stock_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reduce_stock
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION reduce_stock_after_transaction();
```

---

## 🔵 3. Tambahan Modul Inventaris (Dibuat oleh: Rafi/AI)
**Fungsi**: Mencatat riwayat masuk/keluar barang (Audit Trail) untuk laporan manajemen stok Akmal.

```sql
-- Tabel untuk mencatat riwayat perubahan stok
CREATE TABLE stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL, -- Positif (Masuk), Negatif (Keluar)
  type TEXT CHECK (type IN ('initial', 'restock', 'sale', 'adjustment', 'return')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🟣 4. Tambahan Modul Settings (Dibuat oleh: Gombet/AI)
**Fungsi**: Menyimpan preferensi toko seperti logo, footer struk, dan ambang batas stok tipis.

```sql
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔴 5. Keamanan Data (Update: Rafi/AI)
**Status**: **DISABLED (Mode Development)**.
RLS dinonaktifkan sementara agar tim bisa melakukan testing simpan data tanpa terhalang kebijakan keamanan yang rumit selama fase pengembangan.

```sql
-- Perintah untuk memastikan RLS mati selama development
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs DISABLE ROW LEVEL SECURITY;

-- 6. Storage Bucket
-- HARUS DIBUAT MANUAL DI DASHBOARD: 'product-images' (Set to Public)

---

## 🟢 6. Update Fitur Kategori (Dibuat oleh: Akmal/AI)
**Fungsi**: Menambahkan dukungan ikon pada kategori untuk visualisasi yang lebih baik di Dashboard & POS.

```sql
-- Jalankan ini jika tabel categories sudah ada:
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📦';
```
```
