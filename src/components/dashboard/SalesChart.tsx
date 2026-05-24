"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingDown } from "lucide-react";

export default function SalesChart({ data = [] }: { data?: any[] }) {
  const COLORS = ["#facc15", "#4ade80", "#f472b6", "#60a5fa", "#a78bfa", "#fb923c", "#f87171"];

  return (
    <div className="neo-card p-4 sm:p-6 h-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Tren Penjualan Mingguan</h3>
        <span className="bg-blue-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase shrink-0">Statistik</span>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#000"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 2 }}
                tick={{ fill: '#000', fontWeight: 'bold' }}
              />
              <YAxis
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
                tickLine={{ stroke: '#000', strokeWidth: 2 }}
                tick={{ fill: '#000', fontWeight: 'bold' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  fontWeight: 'bold'
                }}
              />
              <Bar
                dataKey="sales"
                stroke="#000"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center space-y-3 flex flex-col items-center justify-center">
            <div className="p-3 border-[3px] border-black bg-pink-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TrendingDown size={32} className="text-black" />
            </div>
            <p className="font-bold italic text-slate-500 text-sm">Belum ada data penjualan minggu ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}
