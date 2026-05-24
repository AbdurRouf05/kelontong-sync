import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function TopProducts({ products = [] }: { products?: any[] }) {
  return (
    <div className="neo-card p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Produk Terlaris</h3>
        <span className="bg-purple-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase shrink-0">Peringkat</span>
      </div>

      <div className="space-y-4">
        {products.map((p, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <div className={`w-12 h-12 border-[2px] border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${p.color}`}>
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-black uppercase text-sm">{p.name}</p>
                <p className="font-bold text-xs bg-black text-white px-2 py-0.5">{p.sales} Terjual</p>
              </div>
              <div className="w-full h-4 bg-white border-[2px] border-black mt-1 overflow-hidden">
                <div 
                  className={`h-full ${p.color} border-r-[2px] border-black transition-all duration-500`} 
                  style={{ width: `${(p.sales / 150) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/dashboard/reports" className="block w-full py-3 border-[3px] border-black font-black uppercase hover:bg-black hover:text-white transition-colors text-center flex items-center justify-center gap-1.5">
        Analisis Produk Lengkap <TrendingUp size={18} />
      </Link>
    </div>
  );
}
