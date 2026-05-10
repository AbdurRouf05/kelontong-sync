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
  
  const periodLabel = period === "daily" ? "Harian" : period === "weekly" ? "Mingguan" : period === "monthly" ? "Bulanan" : "Harian";

  return (
    <div className="neo-card h-[400px] flex flex-col gap-4 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Tren Penjualan & Laba</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tampilan: {periodLabel}</p>
        </div>
        <span className="bg-green-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
              tickFormatter={(val) => {
                if (period === "daily" || period === "all") return val.split('-').slice(1).join('/');
                return val;
              }}
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
