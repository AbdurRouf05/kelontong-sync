"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  ArrowUpDown,
  Download,
  Loader2,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  barcode: string;
  buy_price: number;
  selling_price: number;
  stock: number;
  category: string;
  min_stock?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "Sembako",
    buy_price: "",
    selling_price: "",
    stock: "",
    min_stock: "5"
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setProducts((data || []).map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode || "-",
        buy_price: Number(p.cost_price) || 0,
        selling_price: Number(p.selling_price) || 0,
        stock: p.stock || 0,
        category: "Umum",
        min_stock: 5
      })));
    } catch (err: any) {
      console.error("Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        buy_price: product.buy_price.toString(),
        selling_price: product.selling_price.toString(),
        stock: product.stock.toString(),
        min_stock: (product.min_stock || 5).toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        barcode: "",
        category: "Sembako",
        buy_price: "",
        selling_price: "",
        stock: "",
        min_stock: "5"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        barcode: formData.barcode,
        cost_price: Number(formData.buy_price),
        selling_price: Number(formData.selling_price),
        stock: Number(formData.stock),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const lowStockCount = products.filter(p => p.stock < (p.min_stock || 5)).length;
  const totalValue = products.reduce((acc, p) => acc + (p.selling_price * p.stock), 0);

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Inventaris</h1>
          <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">Manajemen Stok & Katalog Barang</p>
        </div>
        <div className="flex gap-4">
          <button className="neo-btn-primary bg-slate-100 flex items-center gap-2 px-4 py-2 text-sm">
            <Download size={18} /> EXPORT
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="neo-btn-primary bg-green-400 flex items-center gap-2 px-6 py-2"
          >
            <Plus size={20} /> TAMBAH BARANG
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="neo-card bg-white flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 border-[3px] border-black flex items-center justify-center">
            <Package className="text-blue-600" size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Produk</p>
            <p className="text-3xl font-black">{products.length}</p>
          </div>
        </div>
        <div className={`neo-card flex items-center gap-6 ${lowStockCount > 0 ? "bg-red-50 border-red-500 shadow-red-900" : "bg-white"}`}>
          <div className={`w-16 h-16 border-[3px] border-black flex items-center justify-center ${lowStockCount > 0 ? "bg-red-400" : "bg-slate-100"}`}>
            <AlertTriangle className={lowStockCount > 0 ? "text-white" : "text-slate-400"} size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Stok Menipis</p>
            <p className={`text-3xl font-black ${lowStockCount > 0 ? "text-red-600" : ""}`}>{lowStockCount}</p>
          </div>
        </div>
        <div className="neo-card bg-white flex items-center gap-6">
          <div className="w-16 h-16 bg-green-100 border-[3px] border-black flex items-center justify-center">
            <span className="text-2xl font-black text-green-600">Rp</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Nilai Stok</p>
            <p className="text-2xl font-black">Rp {totalValue.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="neo-card bg-white p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b-[4px] border-black flex flex-col md:flex-row gap-4 items-center bg-slate-50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atau barcode..."
              className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-black font-bold focus:outline-none focus:shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 border-[3px] border-black bg-white px-3 py-3 font-bold w-full md:w-48">
              <Filter size={18} />
              <select 
                className="bg-transparent focus:outline-none w-full cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Sembako">Sembako</option>
                <option value="Minuman">Minuman</option>
                <option value="Kebersihan">Kebersihan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-yellow-400 border-b-[4px] border-black">
                <th className="p-4 font-black uppercase text-sm border-r-[2px] border-black">Produk</th>
                <th className="p-4 font-black uppercase text-sm border-r-[2px] border-black">Kategori</th>
                <th className="p-4 font-black uppercase text-sm border-r-[2px] border-black">Harga Jual</th>
                <th className="p-4 font-black uppercase text-sm border-r-[2px] border-black text-center">Stok</th>
                <th className="p-4 font-black uppercase text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-black">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p className="font-black uppercase tracking-widest">Memuat Inventaris...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b-[2px] border-black hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-r-[2px] border-black">
                      <p className="font-black uppercase">{product.name}</p>
                      <p className="text-xs font-bold text-slate-400 tracking-wider">SN: {product.barcode}</p>
                    </td>
                    <td className="p-4 border-r-[2px] border-black">
                      <span className="bg-slate-200 px-2 py-1 border-[2px] border-black text-xs font-black uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 border-r-[2px] border-black font-bold">
                      Rp {product.selling_price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 border-r-[2px] border-black text-center">
                      <div className={`inline-block px-3 py-1 border-[2px] border-black font-black ${product.stock < (product.min_stock || 5) ? "bg-red-400 text-white" : "bg-green-100"}`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 hover:bg-yellow-100 border-[2px] border-transparent hover:border-black transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-100 border-[2px] border-transparent hover:border-black transition-all text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic font-bold">
                    Barang tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-[4px] border-black bg-blue-400 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight">
                {editingProduct ? "Edit Barang" : "Tambah Barang Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-blue-500 border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Barang</label>
                  <input 
                    type="text" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Barcode / SN</label>
                  <input 
                    type="text"
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Kategori</label>
                  <select 
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Sembako">Sembako</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Stok Awal</label>
                  <input 
                    type="number" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Harga Beli (Rp)</label>
                  <input 
                    type="number" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none bg-slate-50"
                    value={formData.buy_price}
                    onChange={(e) => setFormData({...formData, buy_price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Harga Jual (Rp)</label>
                  <input 
                    type="number" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none bg-yellow-50"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all"
                >
                  BATAL
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 font-black uppercase bg-green-400 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "MENYIMPAN..." : editingProduct ? "SIMPAN PERUBAHAN" : "TAMBAH BARANG"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

