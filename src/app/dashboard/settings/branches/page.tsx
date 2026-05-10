import React from 'react';

export default function BranchesPage() {
  const dummyBranches = [
    { id: 1, name: 'Kelontong Berkah (Pusat)', address: 'Jl. Sudirman No. 123', isActive: true },
    { id: 2, name: 'Kelontong Berkah (Cabang Utara)', address: 'Jl. Merdeka No. 45', isActive: false },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">🏪 Multi-Cabang</h1>
          <p className="text-lg font-medium text-gray-700 border-l-4 border-black pl-3">
            Kelola dan pindah antar cabang toko yang Anda miliki.
          </p>
        </div>
        <button 
          className="px-6 py-3 bg-[#FFE800] text-black border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-black text-lg uppercase"
        >
          🏬 Buka Cabang Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyBranches.map((branch) => (
          <div 
            key={branch.id} 
            className={`p-6 border-4 border-black rounded-xl transition-all relative ${
              branch.isActive 
                ? 'bg-[#23A094] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F4F4F4]'
            }`}
          >
            {branch.isActive && (
              <div className="absolute -top-4 -right-4 bg-[#FF6B6B] text-white px-4 py-1 border-4 border-black rounded-full font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-12">
                Aktif
              </div>
            )}
            <h2 className="text-2xl font-black uppercase mb-2 pr-12">{branch.name}</h2>
            <p className={`font-bold mb-6 ${branch.isActive ? 'text-green-100' : 'text-gray-600'}`}>
              📍 {branch.address}
            </p>
            
            <div className="flex gap-3">
              {!branch.isActive && (
                <button className="flex-1 px-4 py-3 bg-[#FF90E8] text-black border-4 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase text-sm">
                  🔄 Pindah ke Sini
                </button>
              )}
              <button className={`px-4 py-3 border-4 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase text-sm ${branch.isActive ? 'bg-white text-black w-full' : 'bg-white text-black'}`}>
                ⚙️ Atur
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
