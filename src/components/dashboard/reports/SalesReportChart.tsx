"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface SalesReportChartProps {
  data: any[];
  period: string;
}

export default function SalesReportChart({ 
  data = [], 
  period = "daily"
}: SalesReportChartProps) {
  
  const periodLabel = 
    period === "daily" ? "Hari Ini" : 
    period === "weekly" ? "Minggu Ini" : 
    period === "monthly" ? "Bulan Ini" : 
    period === "yearly" ? "Tahun Ini" : "Semua Waktu";

  return (
    <div className="neo-card p-4 sm:p-6 h-[320px] sm:h-[400px] flex flex-col gap-3 sm:gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center gap-2">
        <div>
          <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight">Tren Penjualan & Laba</h3>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tampilan: {periodLabel}</p>
        </div>
        <span className="bg-green-400 border-[2px] border-black px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
          {periodLabel}
        </span>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickLine={{ stroke: '#000', strokeWidth: 2 }}
              tick={{ fill: '#000', fontWeight: 'bold', fontSize: 10 }}
              tickFormatter={(val) => val}
            />
            <YAxis 
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickLine={{ stroke: '#000', strokeWidth: 2 }}
              tick={{ fill: '#000', fontWeight: 'bold', fontSize: 10 }}
              tickFormatter={(val) => `Rp${val / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '3px solid #000', 
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
              formatter={(value: any) => [
                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value),
                ""
              ]}
            />
            <Legend verticalAlign="top" height={36} iconType="rect"/>
            <Line 
              type="monotone" 
              dataKey="sales" 
              name="Penjualan"
              stroke="#60a5fa" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#60a5fa', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Laba (Est)"
              stroke="#4ade80" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#4ade80', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
