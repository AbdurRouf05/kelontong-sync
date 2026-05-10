"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  RotateCcw,
  PackageSearch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Payment States
  const [cashAmount, setCashAmount] = useState<number>(0);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setProducts([]);
        } else {
          const mappedProducts = data.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.selling_price),
            category: "Umum",
            stock: p.stock
          }));
          setProducts(mappedProducts);
        }
      } catch (err: any) {
        console.error("Supabase error:", err.message);
        setError("Koneksi Database Gagal. Pastikan URL & API Key di .env.local sudah benar.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;
  const changeAmount = cashAmount > 0 ? cashAmount - total : 0;

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing || cashAmount < total) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Save to Supabase (Must work or it will fail)
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert([{
          total_amount: total,
          payment_amount: cashAmount,
          change_amount: changeAmount
        }])
        .select()
        .single();

      if (txError) throw txError;

      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Success
      setShowSuccess(true);
      setCart([]);
      setCashAmount(0);
      
      // Refresh products to show updated stock from DB
      const { data: refreshed } = await supabase.from("products").select("*");
      if (refreshed) {
        setProducts(refreshed.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.selling_price),
          category: "Umum",
          stock: p.stock
        })));
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Checkout failed:", err.message);
      setError("Gagal menyimpan transaksi: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[calc(100vh-140px)]">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari barang..."
              className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="border-[3px] border-black px-6 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-blue-400">
            <span className="font-black uppercase">{filteredProducts.length} BARANG</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-[3px] border-black p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" />
            <p className="font-bold text-red-600">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-black">MENGHUBUNGKAN KE DATABASE...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className={`neo-card flex flex-col group cursor-pointer ${product.stock <= 0 ? "opacity-50 grayscale" : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="mb-4 aspect-square bg-slate-100 border-[2px] border-black flex items-center justify-center text-4xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black leading-tight uppercase">{product.name}</h3>
                    <p className="text-xl font-bold text-green-600">Rp {product.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-1 border-[2px] border-black ${product.stock < 5 ? "bg-red-400" : "bg-slate-200"}`}>
                      STOK: {product.stock}
                    </span>
                    <button className="bg-black text-white p-2 border-[2px] border-black">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 neo-card border-dashed border-slate-300 shadow-none">
              <PackageSearch size={64} className="text-slate-300 mb-4" />
              <p className="text-xl font-black uppercase text-slate-400">Database Kosong / Tidak Terhubung</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="flex-1 flex flex-col neo-card bg-white p-0 overflow-hidden">
          <div className="p-6 border-b-[4px] border-black bg-pink-400 flex items-center justify-between">
            <h3 className="text-xl font-black uppercase flex items-center gap-2">
              <ShoppingCart size={24} strokeWidth={3} /> Keranjang
            </h3>
            <span className="bg-white border-[2px] border-black px-2 font-bold">{cart.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 border-[3px] border-black bg-slate-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm uppercase truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-slate-500">Rp {item.price.toLocaleString("id-ID")}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center border-[2px] border-black bg-white">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={14} /></button>
                      <span className="w-8 text-center font-black text-sm border-x-[2px] border-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={14} /></button>
                    </div>
                    <p className="font-black text-sm ml-auto">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          <div className="p-6 border-t-[4px] border-black bg-slate-50">
            <div className="flex justify-between font-black text-2xl uppercase">
              <span>Total</span>
              <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Change Calculation Area */}
        <div className="neo-card bg-white space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="text-green-600" />
            <h3 className="font-black uppercase tracking-tight">Pembayaran Online</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400">Uang Bayar (Rp)</label>
            <input 
              type="number" 
              className="w-full p-3 border-[3px] border-black bg-yellow-50 font-black text-xl focus:outline-none"
              placeholder="0"
              value={cashAmount || ""}
              onChange={(e) => setCashAmount(Number(e.target.value))}
            />
          </div>

          <div className="p-3 border-[3px] border-black bg-slate-100">
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase text-xs">Kembalian</span>
              <span className={`font-black text-xl ${changeAmount < 0 ? "text-red-500" : "text-green-600"}`}>
                Rp {changeAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setCart([])} className="neo-btn-primary bg-slate-200 py-3 text-sm">RESET</button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || cashAmount < total || isProcessing}
              className={`neo-btn-secondary py-3 text-sm flex items-center justify-center gap-2 ${cart.length === 0 || cashAmount < total || isProcessing ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
              BAYAR
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="neo-card bg-green-400 max-w-sm w-full text-center py-10">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-white" />
              <h2 className="text-3xl font-black uppercase mb-2">TERSIMPAN!</h2>
              <p className="font-bold text-white uppercase tracking-widest">Transaksi Masuk Database</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: black; }
      `}</style>
    </div>
  );
}
