"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#facc15", "#4ade80", "#f472b6", "#60a5fa", "#a78bfa", "#fb923c", "#f87171"];

export default function CategoryPieChart({ data = [] }: { data?: any[] }) {
  return (
    <div className="neo-card h-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black uppercase tracking-tight">Distribusi Kategori</h3>
        <span className="bg-purple-400 border-[2px] border-black px-3 py-1 text-xs font-black uppercase">Kategori</span>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="#000"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '3px solid #000', 
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                fontWeight: 'bold'
              }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
