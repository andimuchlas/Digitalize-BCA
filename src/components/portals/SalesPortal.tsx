"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface SalesPortalProps {
  onSuccess: () => void;
}

export default function SalesPortal({ onSuccess }: SalesPortalProps) {
  const { toast } = useToast();
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [dealer, setDealer] = useState("");
  const [spkFile, setSpkFile] = useState<string | null>(null);
  const [buktiBayarFile, setBuktiBayarFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !telepon || !dealer) {
      toast({
        title: "Peringatan",
        description: "Harap lengkapi semua data wajib",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          telepon,
          dealer,
          spkUrl: spkFile || "spk_mock_uploaded.pdf",
          buktiBayarUrl: buktiBayarFile || "bukti_bayar_mock_uploaded.pdf",
          status: 2, // Tahap 2: Kirim Prospek Cepat
        }),
      });

      if (res.ok) {
        toast({
          title: "Sukses",
          description: "Prospek berhasil dikirim ke Marketing!",
          variant: "success",
        });
        setNama("");
        setTelepon("");
        setDealer("");
        setSpkFile(null);
        setBuktiBayarFile(null);
        onSuccess();
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Mengirim",
          description: err.error || "Gagal mengirim data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Jaringan",
        description: "Gagal mengirim data ke server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Portal Sales Dealer (Eksternal)</h2>
        <p className="text-sm text-slate-500">Kirim data prospek awal & dokumen pendukung (Tahap 1 - 2)</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Konsumen *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              No. Telepon / WA *
            </label>
            <input
              type="tel"
              required
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Dealer *
          </label>
          <select
            required
            value={dealer}
            onChange={(e) => setDealer(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Pilih Dealer</option>
            <option value="Toyota Astra Motor">Toyota Astra Motor</option>
            <option value="Honda Prospect Motor">Honda Prospect Motor</option>
            <option value="Suzuki Indomobil Motor">Suzuki Indomobil Motor</option>
            <option value="Yamaha Motor Dealer">Yamaha Motor Dealer</option>
            <option value="Kawasaki Motor Dealer">Kawasaki Motor Dealer</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* SPK Upload Mock */}
          <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 transition text-center flex flex-col items-center justify-center bg-slate-50">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700">SPK Kendaraan</span>
            <span className="text-[10px] text-slate-400 mt-1">Format PDF/Gambar, Max 2MB</span>
            {spkFile ? (
              <span className="mt-2 text-xs text-emerald-600 font-medium">✓ {spkFile}</span>
            ) : (
              <button
                type="button"
                onClick={() => setSpkFile("SPK_Budi_Santoso.pdf")}
                className="mt-3 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Pilih Berkas SPK
              </button>
            )}
          </div>

          {/* Bukti Bayar Mock */}
          <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 transition text-center flex flex-col items-center justify-center bg-slate-50">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700">Bukti Bayar Tanda Jadi</span>
            <span className="text-[10px] text-slate-400 mt-1">Format PDF/Gambar, Max 2MB</span>
            {buktiBayarFile ? (
              <span className="mt-2 text-xs text-emerald-600 font-medium">✓ {buktiBayarFile}</span>
            ) : (
              <button
                type="button"
                onClick={() => setBuktiBayarFile("Bukti_Transfer_Tanda_Jadi.png")}
                className="mt-3 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Pilih Berkas Bayar
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Pengajuan Prospek"}
          </button>
        </div>
      </form>
    </div>
  );
}
