"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Neo-Brutalism Palette
const CATEGORY_COLORS: Record<string, string> = {
  "Makanan": "#facc15", // Yellow
  "Minuman": "#60a5fa", // Blue
  "Sembako": "#4ade80", // Green
  "Elektronik": "#a78bfa", // Purple
  "Pakaian": "#f472b6", // Pink
  "Alat Tulis": "#fb923c", // Orange (changed to distinguish from Sembako)
  "Kebutuhan Rumah": "#fb923c", // Orange
  "Kesehatan": "#f87171", // Red
  "Lainnya": "#94a3b8", // Slate
  "Tanpa Kategori": "#cbd5e1", // Light Slate
};

const FALLBACK_COLORS = [
  "#facc15", "#4ade80", "#f472b6", "#60a5fa", "#a78bfa", "#fb923c", "#f87171",
  "#2dd4bf", "#818cf8", "#fb7185", "#e879f9", "#34d399"
];

const getCategoryColor = (name: string, index: number) => {
  // Case-insensitive matching
  const normalizedName = Object.keys(CATEGORY_COLORS).find(
    key => key.toLowerCase() === name.toLowerCase()
  );
  
  if (normalizedName) return CATEGORY_COLORS[normalizedName];
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export default function CategoryPieChart({ data = [] }: { data?: any[] }) {
  return (
    <div className="neo-card h-[400px] flex flex-col gap-4 bg-white">
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
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="#000"
              strokeWidth={3}
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getCategoryColor(entry.name, index)} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '3px solid #000', 
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#000' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="rect"
              formatter={(value) => <span className="font-bold uppercase text-[10px] text-black">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
