"use client";

import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle
} from "lucide-react";

export default function SummaryMetrics({ 
  data = { totalSales: 0, todayTransactions: 0, lowStockCount: 0, totalProducts: 0 } 
}: { data?: any }) {
  const stats = [
    { 
      name: "Total Penjualan", 
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.totalSales), 
      icon: <TrendingUp className="text-blue-500" />, 
      color: "bg-blue-100",
      colSpan: "col-span-2 md:col-span-1"
    },
    { 
      name: "Transaksi Hari Ini", 
      value: data.todayTransactions.toString(), 
      icon: <ShoppingBag className="text-green-500" />, 
      color: "bg-green-100",
      colSpan: "col-span-1"
    },
    { 
      name: "Stok Menipis", 
      value: data.lowStockCount.toString(), 
      icon: <AlertTriangle className="text-yellow-600" />, 
      color: "bg-yellow-100",
      colSpan: "col-span-1"
    },
    { 
      name: "Total Produk", 
      value: data.totalProducts.toString(), 
      icon: <Users className="text-pink-500" />, 
      color: "bg-pink-100",
      colSpan: "col-span-2 md:col-span-1"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
      {stats.map((s, i) => (
        <div key={i} className={`neo-card p-4 sm:p-6 flex flex-col justify-between gap-4 group hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all ${s.colSpan}`}>
          <div className="flex justify-between items-start">
            <div className={`p-2.5 sm:p-3 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all ${s.color}`}>
              {s.icon}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase text-[9px] sm:text-xs tracking-widest">{s.name}</p>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight mt-1 truncate">{s.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
