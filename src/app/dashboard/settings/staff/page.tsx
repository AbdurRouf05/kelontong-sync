"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Staff = {
  id: string;
  full_name: string;
  role: string;
  status: string; // Karena belum ada kolom status di DB, kita mock dulu
};

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', 'kasir'); // Ambil hanya yang role-nya kasir

        if (error) throw error;
        if (data) {
          // Tambahkan status Aktif secara default karena belum ada di DB
          const formattedData = data.map(item => ({
            ...item,
            status: 'Aktif'
          }));
          setStaffList(formattedData);
        }
      } catch (error) {
        console.error('Gagal mengambil data karyawan:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStaff();
  }, []);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">👥 Karyawan</h1>
          <p className="text-lg font-medium text-gray-700 border-l-4 border-black pl-3">
            Kelola akses karyawan untuk cabang ini.
          </p>
        </div>
        <button 
          className="px-6 py-3 bg-[#FF90E8] text-black border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all font-black text-lg uppercase"
        >
          ➕ Tambah Karyawan
        </button>
      </div>

      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#23A094] text-white border-b-4 border-black uppercase text-lg font-black">
              <th className="p-4 border-r-4 border-black">Nama Lengkap</th>
              <th className="p-4 border-r-4 border-black">Peran</th>
              <th className="p-4 border-r-4 border-black">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center font-bold">Memuat data...</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center font-bold text-gray-500">Belum ada karyawan terdaftar.</td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b-4 border-black last:border-b-0 hover:bg-[#F4F4F4] transition-colors font-bold text-lg">
                  <td className="p-4 border-r-4 border-black">{staff.full_name}</td>
                  <td className="p-4 border-r-4 border-black">
                    <span className="bg-[#FFE800] px-3 py-1 border-2 border-black rounded-full text-sm font-black uppercase text-black">
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 border-r-4 border-black">
                    <span className={`px-3 py-1 border-2 border-black rounded-full text-sm font-black uppercase text-white ${staff.status === 'Aktif' ? 'bg-[#FF6B6B]' : 'bg-gray-500'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button className="px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE800] transition-colors">
                      ✏️ Edit
                    </button>
                    <button className="px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white transition-colors">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
