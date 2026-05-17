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
  Banknote,
  Download,
  Printer,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  category_icon?: string;
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
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [userContext, setUserContext] = useState<{ business_id: string; current_store_id: string } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Payment States
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch context and products
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Get User Context
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id, current_store_id")
          .eq("id", user.id)
          .single();
          
        if (!profile) return;
        setUserContext(profile);

        // 2. Fetch Products with Branch Stock
        const { data, error: fetchError } = await supabase
          .from("products")
          .select(`
            *,
            categories (
              name,
              icon
            ),
            product_stocks!inner (
              stock
            )
          `)
          .eq("business_id", profile.business_id)
          .eq("product_stocks.store_id", profile.current_store_id)
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setProducts([]);
        } else {
          const mappedProducts = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.selling_price),
            category: p.categories?.name || "Umum",
            category_icon: p.categories?.icon || "📦",
            stock: (p.product_stocks as any)?.[0]?.stock || 0,
            image: p.image_url
          }));
          setProducts(mappedProducts);
        }
      } catch (err: any) {
        console.error("Initialization error:", err.message);
        setError("Gagal memuat data kasir.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
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

      // Save Transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert([{
          business_id: userContext?.business_id,
          store_id: userContext?.current_store_id,
          cashier_id: (await supabase.auth.getUser()).data.user?.id,
          total_amount: total,
          payment_amount: cashAmount,
          change_amount: changeAmount
        }])
        .select()
        .single();

      if (txError) throw txError;

      // Save Items
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

      // Update Stock per Branch
      for (const item of cart) {
        const { data: currentStock } = await supabase
          .from("product_stocks")
          .select("stock")
          .eq("product_id", item.id)
          .eq("store_id", userContext?.current_store_id)
          .single();
          
        await supabase
          .from("product_stocks")
          .update({ stock: (currentStock?.stock || 0) - item.quantity })
          .eq("product_id", item.id)
          .eq("store_id", userContext?.current_store_id);
      }

      // Prepare Receipt
      setLastTransaction({
        id: transaction.id,
        date: new Date().toLocaleString("id-ID"),
        items: [...cart],
        total: total,
        cash: cashAmount,
        change: changeAmount
      });

      // Success UI
      setShowSuccess(true);
      setCart([]);
      setCashAmount(0);
      
      // Refresh Data
      const { data: refreshed } = await supabase
        .from("products")
        .select(`*, product_stocks!inner(stock)`)
        .eq("business_id", userContext?.business_id)
        .eq("product_stocks.store_id", userContext?.current_store_id);

      if (refreshed) {
        setProducts(refreshed.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.selling_price),
          category: "Umum",
          stock: (p.product_stocks as any)?.[0]?.stock || 0,
          image: p.image_url
        })));
      }
    } catch (err: any) {
      console.error("Checkout failed:", err.message);
      setError("Gagal menyimpan transaksi: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[calc(100vh-140px)]">
      {/* Hidden Receipt Area */}
      <div id="receipt-content" className="hidden print:block w-[80mm] mx-auto p-6 text-black font-mono leading-relaxed bg-white">
        <div className="text-center mb-8">
          <h2 className="text-[20px] font-black uppercase tracking-tighter m-0">KELONTONGSYNC</h2>
          <div className="border-t border-dashed border-black my-4"></div>
          <h1 className="text-[16px] font-black m-0 tracking-[0.2em] underline">INVOICE</h1>
          <p className="text-[12px] m-0 mt-2 font-bold uppercase">INV: #{lastTransaction?.id?.substring(0, 8)}</p>
          <p className="text-[12px] m-0 text-slate-500">{lastTransaction?.date}</p>
        </div>

        <table className="w-full text-[14px] border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-left">ITEM</th>
              <th className="py-2 text-center">QTY</th>
              <th className="py-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-black">
            {lastTransaction?.items.map((item: any) => (
              <tr key={item.id}>
                <td className="py-2 text-left uppercase">{item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{(item.price * item.quantity).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 mb-8">
          <div className="flex justify-between font-black text-[18px] border-y-2 border-black py-2">
            <span>TOTAL</span>
            <span>Rp {lastTransaction?.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span>Tunai</span>
            <span>{lastTransaction?.cash.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[16px] font-black">
            <span>Kembalian</span>
            <span>Rp {lastTransaction?.change.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="text-center border-t border-dashed border-black pt-4">
          <p className="m-0 text-[12px] font-black uppercase">*** TERIMA KASIH ***</p>
        </div>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden print:hidden">
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
          <div className="flex gap-4">
            <div className="flex border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-4 transition-colors ${viewMode === "grid" ? "bg-yellow-400" : "hover:bg-slate-100"}`}
                title="Tampilan Kotak"
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-4 border-l-[3px] border-black transition-colors ${viewMode === "list" ? "bg-yellow-400" : "hover:bg-slate-100"}`}
                title="Tampilan Daftar"
              >
                <List size={20} />
              </button>
            </div>
            <div className="border-[3px] border-black px-6 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-blue-400">
              <span className="font-black uppercase">{filteredProducts.length} BARANG</span>
            </div>
          </div>
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
              <p className="font-black">MEMUAT DATA KASIR...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      className={`neo-card p-3 flex flex-col group cursor-pointer ${product.stock <= 0 ? "opacity-50 grayscale" : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"}`}
                      onClick={() => addToCart(product)}
                    >
                      <div className="mb-3 aspect-square bg-slate-100 border-[2px] border-black flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{product.category_icon || "📦"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-h-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[8px] font-black bg-slate-200 px-1 border border-black uppercase truncate">{product.category}</span>
                        </div>
                        <h3 className="text-xs font-black leading-tight uppercase line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-sm font-bold text-green-600">Rp {product.price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 border-[2px] border-black ${product.stock < 5 ? "bg-red-400" : "bg-slate-200"}`}>
                          STOK: {product.stock}
                        </span>
                        <button className="bg-black text-white p-1.5 border-[2px] border-black">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-6">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      className={`neo-card p-3 flex items-center gap-4 group cursor-pointer ${product.stock <= 0 ? "opacity-50 grayscale" : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}
                      onClick={() => addToCart(product)}
                    >
                      <div className="w-16 h-16 bg-slate-100 border-[2px] border-black flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{product.category_icon || "📦"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[8px] font-black bg-slate-200 px-1 border border-black uppercase">{product.category}</span>
                        </div>
                        <h3 className="font-black leading-tight uppercase truncate">{product.name}</h3>
                        <p className="text-xs font-bold text-slate-400">STOK: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-600">Rp {product.price.toLocaleString("id-ID")}</p>
                        <button className="mt-1 bg-black text-white p-1 border-[2px] border-black">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 neo-card border-dashed border-slate-300 shadow-none">
              <PackageSearch size={64} className="text-slate-300 mb-4" />
              <p className="text-xl font-black uppercase text-slate-400">Tidak ada produk di cabang ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 print:hidden">
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

        <div className="neo-card bg-white space-y-4">
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

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || cashAmount < total || isProcessing}
            className={`w-full neo-btn-secondary py-4 font-black flex items-center justify-center gap-2 ${cart.length === 0 || cashAmount < total || isProcessing ? "opacity-50 grayscale cursor-not-allowed" : "bg-green-400"}`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <CreditCard size={24} />}
            KONFIRMASI BAYAR
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:hidden"
          >
            <div className="neo-card bg-white max-w-md w-full overflow-hidden p-0">
              <div className="bg-green-400 p-8 text-center border-b-[4px] border-black">
                <CheckCircle2 size={80} className="mx-auto mb-4 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
                <h2 className="text-4xl font-black uppercase text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">BERHASIL</h2>
              </div>
              <div className="p-6 space-y-6 text-center">
                <p className="font-black text-xl">Kembalian: Rp {lastTransaction?.change.toLocaleString("id-ID")}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handlePrint} className="neo-btn-primary py-4 font-black">STRUK</button>
                  <button onClick={() => setShowSuccess(false)} className="neo-btn-secondary bg-blue-400 py-4 font-black">LANJUT</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: black; }
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
