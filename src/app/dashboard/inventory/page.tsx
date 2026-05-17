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
  X,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";
import { useEffect as useAutoSuggest } from "react";

const CATEGORY_ICONS = [
  { icon: "🛍️", label: "Belanja" },
  { icon: "🍕", label: "Makanan" },
  { icon: "🥤", label: "Minuman" },
  { icon: "📦", label: "Stok" },
  { icon: "🧼", label: "Sabun" },
  { icon: "💊", label: "Obat" },
  { icon: "🚬", label: "Rokok" },
  { icon: "🍙", label: "Snack" },
  { icon: "🧹", label: "Alat Bersih" },
  { icon: "🔋", label: "Baterai" },
  { icon: "📱", label: "Pulsa" },
  { icon: "🕯️", label: "Lilin" },
  { icon: "🧂", label: "Bumbu" },
  { icon: "🥚", label: "Telur" },
  { icon: "🍚", label: "Beras" },
  { icon: "🧴", label: "Kosmetik" },
  { icon: "☕", label: "Kopi" },
  { icon: "🍞", label: "Roti" },
  { icon: "🍗", label: "Ayam" },
  { icon: "🐟", label: "Ikan" },
  { icon: "🥬", label: "Sayur" },
  { icon: "🍎", label: "Buah" },
  { icon: "🍦", label: "Es Krim" },
  { icon: "👕", label: "Pakaian" },
  { icon: "🚗", label: "Otomotif" },
  { icon: "🛠️", label: "Perkakas" },
  { icon: "📚", label: "Buku" },
];

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  barcode: string;
  selling_price: number;
  stock: number;
  category_id?: string;
  category_name?: string;
  category_icon?: string;
  min_stock: number;
  cost_price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [userContext, setUserContext] = useState<{ business_id: string; current_store_id: string } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category_id: "",
    cost_price: "",
    selling_price: "",
    stock: "",
    min_stock: "5",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch User Context
  const fetchUserContext = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, current_store_id")
      .eq("id", user.id)
      .single();
      
    if (profile) {
      setUserContext(profile);
      return profile;
    }
  };

  // Fetch categories
  const fetchCategories = async (bizId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, icon")
        .eq("business_id", bizId)
        .order("name", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    }
  };

  // Fetch products
  const fetchProducts = async (bizId: string, storeId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name, icon),
          product_stocks!inner (
            stock,
            min_stock
          )
        `)
        .eq("business_id", bizId)
        .eq("product_stocks.store_id", storeId)
        .order("name", { ascending: true });

      if (error) throw error;

      setProducts((data || []).map((p: any) => {
        const stockInfo = p.product_stocks?.[0] || { stock: 0, min_stock: 0 };
        return {
          id: p.id,
          name: p.name,
          barcode: p.barcode || "-",
          cost_price: p.cost_price || 0,
          selling_price: p.selling_price || 0,
          stock: stockInfo.stock,
          min_stock: stockInfo.min_stock,
          category_id: p.category_id,
          category_name: p.categories?.name || "Tanpa Kategori",
          category_icon: p.categories?.icon || "📦",
        };
      }));
    } catch (err: any) {
      console.error("Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const context = await fetchUserContext();
      if (context) {
        fetchCategories(context.business_id);
        fetchProducts(context.business_id, context.current_store_id);
      }
    };
    init();
  }, []);

  // Auto-suggest icon based on name
  const handleCategoryNameChange = (name: string) => {
    setNewCategoryName(name);
    const lowerName = name.toLowerCase();
    
    const mapping: { [key: string]: string } = {
      "makan": "🍕",
      "snack": "🍙",
      "camil": "🍙",
      "minum": "🥤",
      "haus": "🥤",
      "botol": "🥤",
      "susu": "🥤",
      "kopi": "☕",
      "teh": "☕",
      "roti": "🍞",
      "sembako": "🍚",
      "beras": "🍚",
      "telur": "🥚",
      "bumbu": "🧂",
      "dapur": "🧂",
      "sabun": "🧼",
      "shampoo": "🧴",
      "cuci": "🧼",
      "bersih": "🧹",
      "pel": "🧹",
      "sapu": "🧹",
      "obat": "💊",
      "sakit": "💊",
      "sehat": "💊",
      "rokok": "🚬",
      "listrik": "⚡",
      "baterai": "🔋",
      "pulsa": "📱",
      "kuota": "📱",
      "baju": "👕",
      "pakaian": "👕",
      "celana": "👕",
      "sayur": "🥬",
      "buah": "🍎",
      "daging": "🍗",
      "ikan": "🐟",
      "beku": "🍦",
      "es": "🍦",
      "oli": "🚗",
      "motor": "🚗",
      "mobil": "🚗",
      "alat": "🛠️",
      "tulis": "📚",
      "buku": "📚"
    };

    for (const key in mapping) {
      if (lowerName.includes(key)) {
        setNewCategoryIcon(mapping[key]);
        break;
      }
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        category_id: product.category_id || "",
        cost_price: product.cost_price.toString(),
        selling_price: product.selling_price.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
      });
      setImagePreview(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        barcode: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        cost_price: "",
        selling_price: "",
        stock: "",
        min_stock: "5",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set dimensions (Max 1000px width/height)
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas compression failed"));
            },
            'image/webp',
            0.8 // Quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file: File) => {
    try {
      // Compress to WebP
      const compressedBlob = await compressImage(file);
      
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.webp`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error("Compression/Upload error:", err);
      throw new Error("Gagal memproses gambar: " + err.message);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsCategorySubmitting(true);
      const { data: stores } = await supabase.from("stores").select("id").limit(1);
      const storeId = stores?.[0]?.id;

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({ name: newCategoryName, icon: newCategoryIcon })
          .eq("id", editingCategory.id);
        if (error) throw error;
        showToast("Kategori berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([{ 
            name: newCategoryName, 
            business_id: userContext?.business_id, 
            icon: newCategoryIcon 
          }]);
        if (error) throw error;
        showToast("Kategori berhasil ditambahkan!");
      }
      
      setNewCategoryName("");
      setNewCategoryIcon("📦");
      setEditingCategory(null);
      if (userContext) fetchCategories(userContext.business_id);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"? Barang dengan kategori ini akan berubah menjadi 'Tanpa Kategori'.`)) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      showToast(`Kategori "${name}" berhasil dihapus!`);
      if (userContext) {
        fetchCategories(userContext.business_id);
        fetchProducts(userContext.business_id, userContext.current_store_id);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let finalImageUrl = "";
      
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.name,
        barcode: formData.barcode,
        category_id: formData.category_id || null,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock),
      };

      if (editingProduct) {
        // Update Katalog Global
        const { error: prodError } = await supabase
          .from("products")
          .update({
            name: formData.name,
            barcode: formData.barcode,
            category_id: formData.category_id || null,
            cost_price: parseFloat(formData.cost_price),
            selling_price: parseFloat(formData.selling_price),
          })
          .eq("id", editingProduct.id);
        if (prodError) throw prodError;

        // Update Stok Cabang Aktif
        const { error: stockError } = await supabase
          .from("product_stocks")
          .update({
            stock: parseInt(formData.stock),
            min_stock: parseInt(formData.min_stock),
          })
          .eq("product_id", editingProduct.id)
          .eq("store_id", userContext?.current_store_id);
        if (stockError) throw stockError;
        
        showToast("Barang berhasil diperbarui!");
      } else {
        // Insert Katalog Global
        const { data: newProd, error: prodError } = await supabase
          .from("products")
          .insert([{
            business_id: userContext?.business_id,
            name: formData.name,
            barcode: formData.barcode,
            category_id: formData.category_id || null,
            cost_price: parseFloat(formData.cost_price),
            selling_price: parseFloat(formData.selling_price),
          }])
          .select()
          .single();
        if (prodError) throw prodError;

        // Insert Stok Awal Cabang Aktif
        const { error: stockError } = await supabase
          .from("product_stocks")
          .insert([{
            product_id: newProd.id,
            store_id: userContext?.current_store_id,
            stock: parseInt(formData.stock),
            min_stock: parseInt(formData.min_stock),
          }]);
        if (stockError) throw stockError;

        showToast("Barang berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      if (userContext) fetchProducts(userContext.business_id, userContext.current_store_id);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      showToast("Barang berhasil dihapus!");
      if (userContext) fetchProducts(userContext.business_id, userContext.current_store_id);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const filteredProducts = useMemo(() => {
    setCurrentPage(1); // Reset page on search/filter
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Semua" || p.category_id === selectedCategory;
      const matchLowStock = !showOnlyLowStock || p.stock < (p.min_stock || 5);
      return matchSearch && matchCategory && matchLowStock;
    });
  }, [searchQuery, selectedCategory, products, showOnlyLowStock]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Hapus ${selectedIds.size} barang yang dipilih?`)) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", Array.from(selectedIds));
      
      if (error) throw error;
      
      showToast(`${selectedIds.size} barang berhasil dihapus!`);
      setSelectedIds(new Set());
      if (userContext) fetchProducts(userContext.business_id, userContext.current_store_id);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirm1 = confirm("PERINGATAN KRITIS: Hapus SEMUA barang di inventaris?");
    if (!confirm1) return;
    const confirm2 = confirm("Data yang dihapus tidak bisa dikembalikan. Kamu yakin banget?");
    if (!confirm2) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("business_id", userContext?.business_id);
      
      if (error) throw error;
      
      showToast("Seluruh inventaris berhasil dibersihkan!");
      setSelectedIds(new Set());
      if (userContext) fetchProducts(userContext.business_id, userContext.current_store_id);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Export Logic
  const handleExport = (format: "csv" | "xlsx" | "json" | "pdf") => {
    const exportData = filteredProducts.map(p => ({
      Nama: p.name,
      Barcode: p.barcode,
      Kategori: p.category_name,
      "Harga Beli": p.cost_price,
      "Harga Jual": p.selling_price,
      Stok: p.stock,
      "Min Stok": p.min_stock
    }));

    if (format === "csv") {
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `inventaris_export_${new Date().toLocaleDateString()}.csv`;
      link.click();
    } else if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventaris");
      XLSX.writeFile(wb, `inventaris_export_${new Date().toLocaleDateString()}.xlsx`);
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `inventaris_export_${new Date().toLocaleDateString()}.json`;
      link.click();
    } else if (format === "pdf") {
      try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("LAPORAN INVENTARIS KELONTONGSYNC", 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);
        
        autoTable(doc, {
          head: [["Nama", "Barcode", "Kategori", "Harga", "Stok"]],
          body: filteredProducts.map(p => [
            p.name || "-", 
            p.barcode || "-", 
            p.category_name || "Tanpa Kategori", 
            `Rp ${p.selling_price.toLocaleString("id-ID")}`, 
            p.stock.toString()
          ]),
          startY: 25,
          theme: "grid",
          headStyles: { fillColor: [250, 204, 21] }, // Yellow-400
          styles: { fontStyle: "bold" }
        });
        
        doc.save(`laporan_inventaris_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err: any) {
        showToast("Gagal export PDF: " + err.message, "error");
      }
    }
    setIsExportMenuOpen(false);
    showToast(`Produk berhasil diekspor ke ${format.toUpperCase()}`);
  };

  // Import Logic
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const results: any[] = [];
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".csv")) {
          const csvData = Papa.parse(evt.target?.result as string, { header: true }).data;
          results.push(...csvData);
        } else if (fileName.endsWith(".xlsx")) {
          const ab = evt.target?.result;
          const wb = XLSX.read(ab, { type: "array" });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(ws);
          results.push(...jsonData);
        } else if (fileName.endsWith(".json")) {
          results.push(...JSON.parse(evt.target?.result as string));
        }

        if (results.length === 0) throw new Error("File kosong atau tidak valid.");

        // Map keys to standard fields (handle lowercase, spaces, Indonesian, and English)
        const toInsert = results.map((r: any) => {
          const name = r.Nama || r.nama || r.Name || r.name || "";
          const barcode = r.Barcode || r.barcode || r.SN || r.sn || r["Barcode / SN"] || "";
          const cost_price = Number(r["Harga Beli"] || r.harga_beli || r.cost_price || r.buy_price || r["Harga Beli (Rp)"] || 0);
          const selling_price = Number(r["Harga Jual"] || r.harga_jual || r.selling_price || r["Harga Jual (Rp)"] || 0);
          const stock = Number(r.Stok || r.stok || r.stock || r.Stock || r["Stok Awal"] || 0);
          const min_stock = Number(r["Min Stok"] || r.min_stock || r["Limit Stok Minimum"] || 5);
          return { name, barcode, cost_price, selling_price, stock, min_stock };
        }).filter(p => p.name);

        if (toInsert.length === 0) throw new Error("Tidak ada produk valid yang ditemukan untuk diimport.");

        // 1. Insert into Products
        const { data: insertedProds, error: prodError } = await supabase
          .from("products")
          .insert(toInsert.map(p => ({
            business_id: userContext?.business_id,
            name: p.name,
            barcode: p.barcode,
            cost_price: p.cost_price,
            selling_price: p.selling_price
          })))
          .select("id, name");

        if (prodError) throw prodError;

        // 2. Insert into Product Stocks for current store
        const stocksToInsert = (insertedProds || []).map(p => {
          const original = toInsert.find(ti => ti.name === p.name);
          return {
            product_id: p.id,
            store_id: userContext?.current_store_id,
            stock: original?.stock || 0,
            min_stock: original?.min_stock || 5
          };
        });

        const { error: stockError } = await supabase
          .from("product_stocks")
          .insert(stocksToInsert);

        if (stockError) throw stockError;

        showToast(`${toInsert.length} barang berhasil diimport!`);
        setIsImportModalOpen(false);
        if (userContext) fetchProducts(userContext.business_id, userContext.current_store_id);
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (file.name.endsWith(".xlsx")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const lowStockCount = products.filter(p => p.stock < (p.min_stock || 5)).length;
  const totalValue = products.reduce((acc, p) => acc + (p.selling_price * p.stock), 0);

  return (
    <div className="space-y-6 pb-12 relative px-4 md:px-0">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-center lg:text-left">Inventaris</h1>
          <p className="font-bold text-slate-500 uppercase text-[10px] sm:text-sm tracking-widest text-center lg:text-left">Manajemen Stok & Katalog Barang</p>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-2 sm:gap-3 w-full lg:w-auto items-stretch justify-center lg:justify-end">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="neo-btn-primary bg-blue-400 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-auto"
          >
            <Download className="rotate-180" size={16} /> IMPORT
          </button>

          <div className="relative flex col-span-1 lg:col-span-auto">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="neo-btn-primary bg-slate-100 flex w-full items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Download size={16} /> EXPORT
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border-[3px] border-black z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => handleExport("csv")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-yellow-400 border-b-[2px] border-black transition-colors">CSV Format</button>
                <button onClick={() => handleExport("xlsx")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-green-400 border-b-[2px] border-black transition-colors">Excel (XLSX)</button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-red-400 border-b-[2px] border-black transition-colors">PDF Report</button>
                <button onClick={() => handleExport("json")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-blue-400 border-b-[2px] border-black transition-colors">JSON Data</button>
                <button onClick={handleDeleteAll} className="w-full text-left p-3 font-black uppercase text-[10px] text-red-600 hover:bg-red-50 transition-colors">Hapus Semua Data</button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="neo-btn-primary bg-yellow-400 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-auto"
          >
            <Plus size={16} /> KATEGORI
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="neo-btn-primary bg-green-400 flex w-full lg:w-auto items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-auto"
          >
            <Plus size={18} /> TAMBAH BARANG
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="neo-card bg-red-500 text-white flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 animate-bounce">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white p-2 border-[2px] border-black text-red-600 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-black uppercase text-base sm:text-lg">Peringatan Stok Kritis!</p>
              <p className="font-bold text-xs sm:text-sm opacity-90">Ada {lowStockCount} barang hampir habis. Segera restock!</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOnlyLowStock(true)}
            className="bg-white text-black px-4 py-2 text-xs sm:text-sm font-black border-[3px] border-black hover:bg-slate-100 transition-all text-center w-full md:w-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            CEK SEKARANG
          </button>
        </div>
      )}

      {showOnlyLowStock && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-yellow-100 border-[3px] border-black p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600 shrink-0" size={20} />
            <p className="font-black uppercase text-xs sm:text-sm tracking-tight">Menampilkan Stok Kritis Saja</p>
          </div>
          <button 
            onClick={() => setShowOnlyLowStock(false)}
            className="bg-black text-white px-3 py-2 sm:py-1 font-black text-[10px] sm:text-xs uppercase hover:bg-slate-800 transition-all w-full sm:w-auto text-center"
          >
            Tampilkan Semua Barang
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="neo-card p-4 sm:p-6 bg-white flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-1">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-blue-100 border-[3px] border-black flex items-center justify-center shrink-0">
            <Package className="text-blue-600 w-5 h-5 sm:w-8 sm:h-8" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Total Produk</p>
            <p className="text-xl sm:text-3xl font-black mt-0.5 sm:mt-0">{products.length}</p>
          </div>
        </div>
        <div className={`neo-card p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-1 ${lowStockCount > 0 ? "bg-red-50 border-red-500 shadow-red-900" : "bg-white"}`}>
          <div className={`w-10 h-10 sm:w-16 sm:h-16 border-[3px] border-black flex items-center justify-center shrink-0 ${lowStockCount > 0 ? "bg-red-400" : "bg-slate-100"}`}>
            <AlertTriangle className={`${lowStockCount > 0 ? "text-white" : "text-slate-400"} w-5 h-5 sm:w-8 sm:h-8`} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Stok Menipis</p>
            <p className={`text-xl sm:text-3xl font-black mt-0.5 sm:mt-0 ${lowStockCount > 0 ? "text-red-600" : ""}`}>{lowStockCount}</p>
          </div>
        </div>
        <div className="neo-card p-4 sm:p-6 bg-white flex flex-row items-center gap-4 sm:gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] col-span-2 lg:col-span-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 border-[3px] border-black flex items-center justify-center shrink-0">
            <span className="text-xl sm:text-2xl font-black text-green-600">Rp</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Total Nilai Stok</p>
            <p className="text-xl sm:text-2xl font-black mt-0.5 sm:mt-0">Rp {totalValue.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="neo-card bg-white p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-6 border-b-[4px] border-black flex flex-col lg:flex-row gap-4 items-stretch lg:items-center bg-slate-50">
          {/* Left Column: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari nama atau barcode..."
                className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-black font-bold focus:outline-none focus:shadow-none text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Dropdown Filter */}
            <div className="relative w-full sm:w-48 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border-[3px] border-black font-bold appearance-none cursor-pointer focus:outline-none text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-none"
              >
                <option value="Semua">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon || "📦"} {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter size={16} />
              </div>
            </div>
          </div>
          
          {/* Right Column: Bulk Action & View Mode */}
          <div className="flex flex-row gap-3 items-center justify-between lg:justify-end shrink-0">
            {selectedIds.size > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="neo-btn-primary bg-red-500 hover:bg-red-400 text-white flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-black border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Trash2 size={16} /> Hapus ({selectedIds.size})
              </button>
            )}

            <div className="flex border-[3px] border-black bg-white overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-yellow-400' : 'hover:bg-slate-100'}`}
                title="Tampilan Kotak"
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={`p-3 border-l-[3px] border-black transition-colors ${viewMode === 'table' ? 'bg-yellow-400' : 'hover:bg-slate-100'}`}
                title="Tampilan Tabel"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Table/Grid Content */}
        {viewMode === "table" ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-400 border-b-[4px] border-black">
                    <th className="p-4 border-r-[2px] border-black w-10">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 accent-black cursor-pointer"
                        checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                      <td colSpan={6} className="p-20 text-center text-black">
                        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                        <p className="font-black uppercase tracking-widest">Memuat Inventaris...</p>
                      </td>
                    </tr>
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className={`border-b-[2px] border-black hover:bg-slate-50 transition-colors ${selectedIds.has(product.id) ? "bg-yellow-50" : ""}`}>
                        <td className="p-4 border-r-[2px] border-black">
                          <input 
                            type="checkbox"
                            className="w-5 h-5 accent-black cursor-pointer"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelectOne(product.id)}
                          />
                        </td>
                        <td className="p-4 border-r-[2px] border-black">
                          <div>
                            <p className="font-black uppercase leading-tight">{product.name}</p>
                            <p className="text-xs font-bold text-slate-400 tracking-wider">SN: {product.barcode}</p>
                          </div>
                        </td>
                        <td className="p-4 border-r-[2px] border-black">
                          <span className="bg-slate-200 px-2 py-1 border-[2px] border-black text-xs font-black uppercase flex items-center gap-1 w-fit">
                            <span>{product.category_icon || "📦"}</span>
                            <span>{product.category_name}</span>
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
                      <td colSpan={6} className="p-20 text-center text-slate-400 italic font-bold">
                        Barang tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Bento List View */}
            <div className="block md:hidden p-4 bg-slate-50 border-t-[4px] border-black">
              {isLoading ? (
                <div className="p-12 text-center text-black">
                  <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                  <p className="font-black uppercase text-sm tracking-wider">Memuat Inventaris...</p>
                </div>
              ) : paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {paginatedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className={`neo-card p-3 sm:p-4 bg-white flex flex-col gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${selectedIds.has(product.id) ? "bg-yellow-50 border-yellow-400" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox & Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input 
                            type="checkbox"
                            className="w-5 h-5 mt-0.5 accent-black cursor-pointer shrink-0"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelectOne(product.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black uppercase text-sm leading-tight truncate">{product.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">SN: {product.barcode}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="bg-slate-200 px-1.5 py-0.5 border border-black text-[8px] font-black uppercase flex items-center gap-0.5 w-fit">
                                <span>{product.category_icon || "📦"}</span>
                                <span>{product.category_name}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions (Top Right of Bento Card) */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-yellow-400 hover:bg-yellow-300 active:translate-y-[2px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-red-500 text-white hover:bg-red-400 active:translate-y-[2px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Price & Stock info in a bento-style sub-box */}
                      <div className="flex items-center justify-between bg-slate-50 border-[2px] border-black p-2 mt-1">
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-400">Harga Jual</p>
                          <p className="font-black text-xs text-green-600">Rp {product.selling_price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className={`px-2 py-1 border-[2px] border-black text-[10px] font-black ${product.stock < (product.min_stock || 5) ? "bg-red-500 text-white animate-pulse" : "bg-green-100"}`}>
                          STOK: {product.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-bold italic text-sm">
                  Barang tidak ditemukan.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                <p className="font-black uppercase tracking-widest">Memuat...</p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`neo-card p-3 sm:p-6 flex flex-col bg-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${selectedIds.has(product.id) ? "bg-yellow-50 border-yellow-400" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4 gap-1.5">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-black cursor-pointer shrink-0"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelectOne(product.id)}
                    />
                    <span className="bg-slate-200 px-1.5 py-0.5 sm:px-2 sm:py-1 border-[2px] border-black text-[8px] sm:text-[10px] font-black uppercase flex items-center gap-0.5 truncate">
                      <span>{product.category_icon || "📦"}</span>
                      <span className="truncate">{product.category_name}</span>
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-black uppercase text-xs sm:text-lg line-clamp-1 mb-0.5 sm:mb-1">{product.name}</h3>
                    <p className="text-[9px] sm:text-xs font-bold text-slate-400 mb-2 sm:mb-4 tracking-wider truncate">SN: {product.barcode}</p>
                    
                    <div className="flex justify-between items-end mt-3 sm:mt-4 gap-2">
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 mb-0.5 sm:mb-1">Harga Jual</p>
                        <p className="font-black text-xs sm:text-lg text-green-600 truncate">Rp {product.selling_price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className={`px-2 py-0.5 sm:px-3 sm:py-1 border-[2px] border-black font-black text-xs sm:text-sm shrink-0 ${product.stock < (product.min_stock || 5) ? "bg-red-400 text-white" : "bg-green-100"}`}>
                        {product.stock}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 border-t-[2px] border-black mt-4 sm:mt-6 pt-3 sm:pt-4">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 py-1.5 sm:py-2 font-black text-[10px] sm:text-xs uppercase border-[2px] border-black bg-white hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-center"
                    >
                      EDIT
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 py-1.5 sm:py-2 font-black text-[10px] sm:text-xs uppercase border-[2px] border-black bg-white hover:bg-red-500 hover:text-white text-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-center"
                    >
                      HAPUS
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">
                Barang tidak ditemukan.
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t-[4px] border-black flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} Dari {filteredProducts.length} Produk
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ChevronsLeft size={16} />
              </button>
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="font-black text-[10px] uppercase tracking-widest">Halaman</span>
                <div className="bg-black text-white px-4 py-1 font-black text-sm border-[2px] border-black">
                  {currentPage}
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">Dari {totalPages}</span>
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-10 duration-300 w-full max-w-2xl px-4">
          <div className="neo-card bg-black text-white flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 text-black px-4 py-1 font-black text-2xl border-[3px] border-white">
                {selectedIds.size}
              </div>
              <p className="font-black uppercase tracking-tighter text-sm">Barang Dipilih</p>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 font-black uppercase text-sm border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2"
              >
                <Trash2 size={20} /> HAPUS {selectedIds.size} BARANG
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-white/50 hover:text-white font-black uppercase text-xs tracking-widest"
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}

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
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon || "📦"} {c.name}</option>
                    ))}
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
                <div className="space-y-2 col-span-full">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Limit Stok Minimum (Early Warning)</label>
                  <input 
                    type="number" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none bg-red-50"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Harga Beli (Rp)</label>
                  <input 
                    type="number" required
                    className="w-full p-3 border-[3px] border-black font-bold focus:outline-none bg-slate-50"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-[4px] border-black bg-blue-400 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Import Data Barang</h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 hover:bg-blue-500 border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-[4px] border-dashed border-slate-300 p-12 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".csv, .xlsx, .json"
                  className="hidden"
                />
                <div className="w-20 h-20 bg-blue-100 border-[3px] border-black flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Download className="rotate-180 text-blue-600" size={40} />
                </div>
                <p className="font-black uppercase text-sm">Pilih File untuk Upload</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Mendukung: CVS, Excel, JSON</p>
              </div>
              
              {isImporting && (
                <div className="flex items-center justify-center gap-3 font-black uppercase text-sm">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sedang memproses file...</span>
                </div>
              )}

              <div className="bg-yellow-50 border-[2px] border-black p-4 text-left">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Tips Format CSV/Excel:</p>
                <p className="text-[10px] font-bold">Pastikan header kolom berisi: <span className="bg-yellow-200 px-1">Nama</span>, <span className="bg-yellow-200 px-1">Barcode</span>, <span className="bg-yellow-200 px-1">Harga Beli</span>, <span className="bg-yellow-200 px-1">Harga Jual</span>, <span className="bg-yellow-200 px-1">Stok</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="neo-card bg-white w-full max-w-md p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-[4px] border-black bg-yellow-400 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Tambah Kategori</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 hover:bg-yellow-500 border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Existing Categories List */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Daftar Kategori</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 border-[2px] border-black bg-slate-50 font-bold group">
                        <div className="flex items-center gap-3">
                          <span className="text-xl bg-white w-8 h-8 flex items-center justify-center border-[2px] border-black">{cat.icon || "📦"}</span>
                          <span className="uppercase text-sm">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingCategory(cat);
                              setNewCategoryName(cat.name);
                              setNewCategoryIcon(cat.icon || "📦");
                            }}
                            className="p-1 hover:bg-yellow-100 border-[2px] border-transparent hover:border-black transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="text-red-500 hover:bg-red-50 p-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-slate-400 text-center py-4">Belum ada kategori.</p>
                  )}
                </div>
              </div>

              <div className="h-[2px] bg-black/10 my-6" />

              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {editingCategory ? "Nama Kategori (Edit)" : "Nama Kategori Baru"}
                    </label>
                    <input 
                      type="text" required
                      placeholder="Contoh: Snack, Alat Tulis..."
                      className="w-full p-3 border-[3px] border-black font-bold focus:outline-none"
                      value={newCategoryName}
                      onChange={(e) => editingCategory ? setNewCategoryName(e.target.value) : handleCategoryNameChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Pilih Ikon (Saran Otomatis)</label>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border-[3px] border-black bg-slate-50 custom-scrollbar">
                      {CATEGORY_ICONS.map((item) => (
                        <button
                          key={item.icon}
                          type="button"
                          onClick={() => setNewCategoryIcon(item.icon)}
                          className={`text-2xl p-2 border-[2px] transition-all flex items-center justify-center hover:bg-yellow-100 ${newCategoryIcon === item.icon ? "border-black bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                          title={item.label}
                        >
                          {item.icon}
                        </button>
                      ))}
                      {/* Default package icon if not in list */}
                      {!CATEGORY_ICONS.find(i => i.icon === newCategoryIcon) && (
                         <button
                          type="button"
                          className="text-2xl p-2 border-[2px] border-black bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-110"
                        >
                          {newCategoryIcon}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {editingCategory && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategoryName("");
                        setNewCategoryIcon("📦");
                      }}
                      className="flex-1 py-4 font-black uppercase border-[3px] border-black hover:bg-slate-100 transition-all"
                    >
                      BATAL
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isCategorySubmitting}
                    className="flex-[2] py-4 font-black uppercase bg-green-400 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {isCategorySubmitting ? "MENYIMPAN..." : editingCategory ? "SIMPAN PERUBAHAN" : "TAMBAH KATEGORI"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-300">
          <div className={`neo-card flex items-center gap-4 px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${toast.type === "success" ? "bg-green-400" : "bg-red-400 text-white"}`}>
            {toast.type === "success" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <p className="font-black uppercase tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

