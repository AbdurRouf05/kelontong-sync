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

export default function SalesReportChart({ data = [] }: { data?: any[] }) {
  return (
    <div className="neo-card h-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tight">Tren Penjualan & Laba</h3>
        <span className="bg-green-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">Analitik</span>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickLine={{ stroke: '#000', strokeWidth: 2 }}
              tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }}
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
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="monotone" 
              dataKey="sales" 
              name="Penjualan"
              stroke="#60a5fa" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#60a5fa', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Laba (Est)"
              stroke="#4ade80" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#4ade80', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
