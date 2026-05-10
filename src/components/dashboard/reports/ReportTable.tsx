"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, CheckCircle2, XCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportTable({ data = [] }: { data?: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const handleExport = (format: "csv" | "xlsx" | "json" | "pdf") => {
    console.log(`Starting export to ${format}...`, data.length, "items");
    
    if (data.length === 0) {
      showToast("Tidak ada data untuk diekspor!", "error");
      setIsExportMenuOpen(false);
      return;
    }

    const exportData = data.map(r => ({
      Tanggal: r.date,
      Produk: r.productName,
      Kategori: r.category,
      Jumlah: r.quantity,
      Total: r.total
    }));

    try {
      if (format === "csv") {
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_penjualan_${new Date().toLocaleDateString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Berhasil diekspor ke CSV!");
      } else if (format === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
        XLSX.writeFile(wb, `laporan_penjualan_${new Date().toLocaleDateString()}.xlsx`);
        showToast("Berhasil diekspor ke XLSX!");
      } else if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_penjualan_${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Berhasil diekspor ke JSON!");
      } else if (format === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("LAPORAN PENJUALAN PRODUK - KELONTONGSYNC", 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);
        
        autoTable(doc, {
          head: [["Tanggal", "Produk", "Kategori", "Jumlah", "Total"]],
          body: data.map(r => [
            r.date || "-", 
            r.productName || "-", 
            r.category || "-", 
            (r.quantity || 0).toString(),
            `Rp ${(r.total || 0).toLocaleString("id-ID")}`
          ]),
          startY: 25,
          theme: "grid",
          headStyles: { fillColor: [0, 0, 0] },
          styles: { fontStyle: "bold" }
        });
        
        doc.save(`laporan_penjualan_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast("Berhasil diekspor ke PDF!");
      }
    } catch (err: any) {
      console.error(`Gagal export ${format}:`, err);
      showToast(`Gagal export ${format}!`, "error");
    }
    setIsExportMenuOpen(false);
  };
  return (
    <div className="neo-card space-y-6">
      {/* Header Laporan Khusus Print */}
      <div className="hidden print:block mb-8 border-b-[4px] border-black pb-4">
        <h1 className="text-4xl font-black uppercase">Laporan Penjualan Produk</h1>
        <p className="text-xl font-bold">Toko Berkah Utama 🏪</p>
        <p className="text-sm font-bold text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h3 className="text-2xl font-black uppercase tracking-tight">Rincian Penjualan Produk</h3>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 border-[3px] border-black bg-white px-3 py-1 font-bold">
            <span className="text-xs uppercase">Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none cursor-pointer text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex-1 md:flex-none bg-white border-[3px] border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
            >
              <Download size={18} /> EXPORT
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border-[3px] border-black z-[100] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => handleExport("csv")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-yellow-400 border-b-[2px] border-black transition-colors">CSV Format</button>
                <button onClick={() => handleExport("xlsx")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-green-400 border-b-[2px] border-black transition-colors">Excel (XLSX)</button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-red-400 border-b-[2px] border-black transition-colors">PDF Report</button>
                <button onClick={() => handleExport("json")} className="w-full text-left p-3 font-black uppercase text-xs hover:bg-blue-400 border-b-[2px] border-black transition-colors">JSON Data</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-[3px] border-black overflow-hidden print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white text-sm uppercase font-black">
              <tr>
                <th className="p-4 border-r-[2px] border-white">Tanggal</th>
                <th className="p-4 border-r-[2px] border-white">Produk</th>
                <th className="p-4 border-r-[2px] border-white text-center">Jumlah</th>
                <th className="p-4">Total Penjualan</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {paginatedData.length > 0 ? (
                paginatedData.map((r, i) => (
                  <tr key={i} className={`border-t-[3px] border-black ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                    <td className="p-4 border-r-[3px] border-black whitespace-nowrap">{r.date}</td>
                    <td className="p-4 border-r-[3px] border-black">
                      <div className="flex flex-col">
                        <span>{r.productName}</span>
                        <span className="text-[10px] uppercase text-slate-400">{r.category}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[3px] border-black text-center">{r.quantity}</td>
                    <td className="p-4">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada data transaksi untuk ditampilkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t-[3px] border-black print:hidden">
          <div className="text-sm font-bold text-slate-500 uppercase">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="font-black text-sm uppercase">Page</span>
              <div className="bg-black text-white px-3 py-1 font-black text-sm border-[2px] border-black">
                {currentPage}
              </div>
              <span className="font-black text-sm uppercase">of {totalPages}</span>
            </div>

            <button 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 border-[2px] border-black bg-white hover:bg-yellow-400 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      
      <p className="text-xs text-slate-400 italic md:hidden">
        * Gunakan tampilan Desktop untuk hasil print PDF yang lebih baik.
      </p>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-300">
          <div className={`neo-card ${toast.type === "success" ? "bg-green-400" : "bg-red-400"} flex items-center gap-3 px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black`}>
            {toast.type === "success" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <p className="font-black uppercase tracking-tight text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
