"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ReportFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "all";

  const setPeriod = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-white border-[4px] border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {[
        { id: "daily", label: "Hari Ini" },
        { id: "weekly", label: "Minggu Ini" },
        { id: "monthly", label: "Bulan Ini" },
        { id: "yearly", label: "Tahun Ini" }
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => setPeriod(p.id)}
          className={`px-6 py-2 text-sm font-black uppercase transition-all ${
            currentPeriod === p.id 
              ? "bg-yellow-400 border-[2px] border-black" 
              : "hover:bg-slate-50"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
