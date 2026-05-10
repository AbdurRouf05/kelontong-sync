"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  RotateCcw,
  PackageSearch,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Beras Sentra Ramos 5kg", price: 75000, category: "Sembako", stock: 24 },
  { id: "2", name: "Minyak Goreng SunCo 2L", price: 38000, category: "Sembako", stock: 15 },
  { id: "3", name: "Indomie Goreng (Dus)", price: 115000, category: "Mie Instan", stock: 10 },
  { id: "4", name: "Telur Ayam Broiler (1kg)", price: 28000, category: "Sembako", stock: 40 },
  { id: "5", name: "Gula Pasir Gulaku 1kg", price: 17500, category: "Sembako", stock: 30 },
  { id: "6", name: "Kopi Kapal Api 165g", price: 14500, category: "Minuman", stock: 20 },
  { id: "7", name: "Susu Kental Manis Frisian Flag", price: 12000, category: "Minuman", stock: 18 },
  { id: "8", name: "Sabun Cuci Mama Lemon 780ml", price: 13500, category: "Kebersihan", stock: 12 },
];

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.02; // 2% tax simulation
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[calc(100vh-140px)]">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama barang atau kategori..."
              className="w-full pl-12 pr-4 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all font-bold text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-blue-400 border-[3px] border-black px-6 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black uppercase">{filteredProducts.length} Barang Tersedia</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  key={product.id}
                  className="neo-card flex flex-col group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="mb-4 aspect-square bg-slate-100 border-[2px] border-black flex items-center justify-center text-4xl group-hover:bg-yellow-100 transition-colors">
                    {product.category === "Sembako" ? "🌾" : 
                     product.category === "Mie Instan" ? "🍜" : 
                     product.category === "Minuman" ? "🥤" : "🧹"}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{product.category}</span>
                    <h3 className="text-lg font-black leading-tight mb-2 uppercase">{product.name}</h3>
                    <p className="text-xl font-bold text-green-600">Rp {product.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-1 border-[2px] border-black ${product.stock < 15 ? "bg-red-400" : "bg-slate-200"}`}>
                      STOK: {product.stock}
                    </span>
                    <button className="bg-black text-white p-2 border-[2px] border-black hover:bg-slate-800">
                      <Plus size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 neo-card border-dashed border-slate-300 shadow-none">
              <PackageSearch size={64} className="text-slate-300 mb-4" />
              <p className="text-xl font-black uppercase text-slate-400">Barang tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Shopping Cart */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="flex-1 flex flex-col neo-card bg-white p-0 overflow-hidden">
          {/* Cart Header */}
          <div className="p-6 border-b-[4px] border-black bg-pink-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} strokeWidth={3} />
              <h3 className="text-xl font-black uppercase tracking-tight">Keranjang</h3>
            </div>
            <div className="bg-white border-[2px] border-black px-2 py-0.5 font-bold text-sm">
              {cart.length} ITEMS
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.id}
                    className="flex gap-4 p-3 border-[3px] border-black bg-slate-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative group"
                  >
                    <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-2xl shrink-0">
                      {item.category === "Sembako" ? "🌾" : 
                       item.category === "Mie Instan" ? "🍜" : 
                       item.category === "Minuman" ? "🥤" : "🧹"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm uppercase truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-500">Rp {item.price.toLocaleString("id-ID")}</p>
                      
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center border-[2px] border-black bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-red-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-black text-sm border-x-[2px] border-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-green-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-black text-sm ml-auto">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-30">
                  <ShoppingCart size={48} className="mb-2" />
                  <p className="font-bold uppercase italic">Keranjang Kosong</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Footer / Summary */}
          <div className="p-6 border-t-[4px] border-black bg-slate-50 space-y-3">
            <div className="flex justify-between font-bold text-slate-500 uppercase text-xs">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-500 uppercase text-xs">
              <span>Pajak (2%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-black text-xl uppercase pt-2 border-t-[2px] border-dashed border-slate-400">
              <span>Total</span>
              <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setCart([])}
            className="neo-btn-primary bg-slate-200 hover:bg-slate-300 flex items-center justify-center gap-2 py-4"
          >
            <RotateCcw size={20} />
            RESET
          </button>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`neo-btn-secondary flex items-center justify-center gap-2 py-4 ${cart.length === 0 ? "opacity-50 grayscale cursor-not-allowed shadow-none translate-x-0 translate-y-0" : ""}`}
          >
            <CreditCard size={20} />
            BAYAR
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-400 border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase">Transaksi Berhasil!</h4>
              <p className="font-bold">Stok telah diperbarui secara otomatis.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-left: 2px solid black;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: black;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}

