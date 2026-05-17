"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  TrendingUp, 
  Users, 
  MapPin, 
  Plus, 
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  Building2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BranchStats {
  id: string;
  name: string;
  address: string;
  total_sales: number;
  transaction_count: number;
  product_count: number;
}

export default function ManagementPage() {
  const [branches, setBranches] = useState<BranchStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  const fetchManagementData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Business Info
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id, businesses(name)")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      const business = Array.isArray(profile.businesses) ? profile.businesses[0] : profile.businesses;
      setBusinessName(business?.name || "Bisnis Saya");

      // 2. Get All Branches
      const { data: stores } = await supabase
        .from("stores")
        .select("id, name, address")
        .eq("business_id", profile.business_id);

      if (!stores) return;

      // 3. Get Stats per Branch
      const branchStats = await Promise.all(stores.map(async (store) => {
        // Sales
        const { data: trans } = await supabase
          .from("transactions")
          .select("total_amount")
          .eq("store_id", store.id);
        
        const totalSales = trans?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

        // Stocks
        const { count: prodCount } = await supabase
          .from("product_stocks")
          .select("*", { count: 'exact', head: true })
          .eq("store_id", store.id);

        return {
          id: store.id,
          name: store.name,
          address: store.address || "No Address",
          total_sales: totalSales,
          transaction_count: trans?.length || 0,
          product_count: prodCount || 0
        };
      }));

      setBranches(branchStats);
    } catch (err) {
      console.error("Error fetching management data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagementData();
  }, []);

  const totalBusinessSales = branches.reduce((acc, curr) => acc + curr.total_sales, 0);
  const totalTransactions = branches.reduce((acc, curr) => acc + curr.transaction_count, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Manajemen Tenant</h1>
          <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
            {businessName} • Konsolidasi Seluruh Cabang
          </p>
        </div>
        <button className="neo-btn-primary bg-yellow-400 flex items-center gap-2 px-6 py-3 font-black uppercase">
          <Plus size={20} /> Tambah Cabang Baru
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card bg-white flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 border-[3px] border-black flex items-center justify-center">
            <TrendingUp className="text-blue-600" size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Omzet Gabungan</p>
            <p className="text-2xl font-black">Rp {totalBusinessSales.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="neo-card bg-white flex items-center gap-6">
          <div className="w-16 h-16 bg-green-100 border-[3px] border-black flex items-center justify-center">
            <ShoppingCart size={32} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Transaksi</p>
            <p className="text-3xl font-black">{totalTransactions}</p>
          </div>
        </div>
        <div className="neo-card bg-white flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-100 border-[3px] border-black flex items-center justify-center">
            <Building2 size={32} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah Cabang</p>
            <p className="text-3xl font-black">{branches.length}</p>
          </div>
        </div>
      </div>

      {/* Branch List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Store size={24} /> Performa Per Cabang
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {branches.map((branch, index) => (
            <div 
              key={branch.id}
              className="neo-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-1 hover:translate-y-1 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 border-[3px] border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  index === 0 ? "bg-yellow-400" : index === 1 ? "bg-green-400" : "bg-blue-400"
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase">{branch.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <MapPin size={14} /> {branch.address}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Penjualan</p>
                  <p className="font-black text-lg">Rp {branch.total_sales.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Transaksi</p>
                  <p className="font-black text-lg">{branch.transaction_count}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Varian Produk</p>
                  <p className="font-black text-lg">{branch.product_count}</p>
                </div>
              </div>

              <button className="neo-btn-primary bg-slate-100 p-3 self-end md:self-center">
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
