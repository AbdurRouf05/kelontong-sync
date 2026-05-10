# Persiapan Database Supabase (SQL)

Silakan salin dan tempel kode SQL di bawah ini ke dalam **SQL Editor** di dashboard Supabase Anda, lalu klik **Run**.

## 1. Membuat Tabel Utama

```sql
-- 1. Tabel Toko (Tenant)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Profil (Karyawan/Owner)
-- Menghubungkan Supabase Auth dengan data toko
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  subtotal DECIMAL(12,2) NOT NULL
);
```

## 2. Otomatisasi (Trigger Potong Stok)
Gunakan trigger ini agar setiap ada transaksi baru, stok barang otomatis berkurang.

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

## 3. Keamanan Data (Row Level Security)
Langkah ini sangat penting agar satu toko tidak bisa melihat data toko lain.

```sql
-- Aktifkan RLS di semua tabel
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Contoh Policy: Hanya bisa melihat data yang store_id nya sama dengan store_id user
CREATE POLICY "Allow users to view their own store data" ON products
FOR SELECT USING (
  store_id IN (
    SELECT store_id FROM profiles WHERE id = auth.uid()
  )
);
```

## 4. Tips Setup Supabase
1. **API Keys**: Anda akan butuh `SUPABASE_URL` dan `SUPABASE_ANON_KEY` untuk dimasukkan ke file `.env` di proyek Next.js.
2. **Auth**: Aktifkan Email Auth di menu Authentication agar tim bisa melakukan registrasi akun tes.
