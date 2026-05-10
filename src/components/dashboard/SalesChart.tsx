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

export default function SalesChart({ data = [] }: { data?: any[] }) {
  const COLORS = ["#facc15", "#4ade80", "#f472b6", "#60a5fa", "#a78bfa", "#fb923c", "#f87171"];

  return (
    <div className="neo-card h-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tight">Tren Penjualan Mingguan</h3>
        <span className="bg-blue-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">Statistik</span>
      </div>

      <div className="flex-1 w-full">
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
      </div>
    </div>
  );
}
