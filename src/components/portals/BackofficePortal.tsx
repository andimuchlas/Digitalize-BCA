"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, Printer, Coins, CheckCircle2 } from "lucide-react";
import { type Submission } from "@/db/schema";
import { useToast } from "@/context/ToastContext";

interface BackofficePortalProps {
  onSuccess: () => void;
}

export default function BackofficePortal({ onSuccess }: BackofficePortalProps) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchBackofficeQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Filter submissions with status = 8 (TTD complete) or 9 (Cair/Selesai)
        setSubmissions(data.filter((s: Submission) => s.status === 8 || s.status === 9));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackofficeQueue();
  }, []);

  const handleCairkan = async (id: number) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 9, // Tahap 9: Dana dicairkan (Pencairan Dana Selesai)
        }),
      });

      if (res.ok) {
        toast({
          title: "Pencairan Berhasil",
          description: "Dana berhasil dicairkan ke dealer! Proses digitalisasi kredit selesai.",
          variant: "success",
        });
        fetchBackofficeQueue();
        setSelectedSub(null);
        onSuccess();
      } else {
        toast({
          title: "Gagal Mencairkan",
          description: "Gagal melakukan pencairan dana ke dealer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Jaringan",
        description: "Terjadi kesalahan jaringan saat memproses pencairan",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6 print:hidden">
        <h2 className="text-lg font-semibold text-slate-800">Portal Backoffice & Pencairan Dana (Internal)</h2>
        <p className="text-sm text-slate-500">Penerbitan dokumen PO / Kontrak digital serta pencairan dana pinjaman (Tahap 6 & 9)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Left column: submissions list (hidden on print) */}
        <div className="lg:col-span-1 border border-slate-100 rounded-lg p-4 bg-slate-50/50 print:hidden">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Daftar Antrean Backoffice ({submissions.length})
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Tidak ada dokumen di antrean backoffice.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    selectedSub?.id === sub.id
                      ? "border-blue-500 bg-blue-50 text-blue-900 font-medium"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold block truncate max-w-[120px]">{sub.nama}</span>
                    <span className="text-[10px] text-slate-400">ID: #{sub.id}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between items-center">
                    <span>{sub.dealer}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        sub.status === 9 ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {sub.status === 9 ? "Lunas/Cair" : "Butuh Pencairan"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Document view & Payout trigger */}
        <div className="lg:col-span-2 print:w-full">
          {!selectedSub ? (
            <div className="border border-slate-100 rounded-lg py-16 text-center text-slate-400 bg-slate-50/20 print:hidden">
              Pilih salah satu transaksi di panel kiri untuk mencetak PO & Kontrak atau memproses pencairan dana.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Backoffice actions bar (hidden on print) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap justify-between items-center gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">Aksi Dokumen:</span>
                  {selectedSub.status === 8 && (
                    <button
                      onClick={() => handleCairkan(selectedSub.id)}
                      disabled={loadingAction}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      {loadingAction ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Coins className="w-3.5 h-3.5" />
                      )}
                      Cairkan Dana (Selesai)
                    </button>
                  )}
                  {selectedSub.status === 9 && (
                    <span className="text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      ✓ Dana Sudah Dicairkan
                    </span>
                  )}
                </div>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Dokumen
                </button>
              </div>

              {/* Purchase Order (PO) & Kontrak Document Preview (Clean Light Theme) */}
              <div className="border border-slate-300 rounded-xl bg-white shadow-md p-8 text-slate-800 space-y-8 font-sans max-w-2xl mx-auto print:border-none print:shadow-none print:p-0">
                {/* PO Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4">
                  <h1 className="text-xl font-bold tracking-wide uppercase text-slate-900">
                    KONTRAK PEMBIAYAAN KREDIT & SURAT PESANAN KENDARAAN (PO)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">PT. JKL MULTIFINANCE INDONESIA</p>
                  <p className="text-xs text-slate-500">ID Transaksi: PO-{selectedSub.id}-{selectedSub.createdAt ? new Date(selectedSub.createdAt).getFullYear() : '2026'}</p>
                </div>

                {/* Section 1: Customer Info */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    I. DATA DEBITUR / KONSUMEN
                  </h3>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500 w-1/3">Nama Lengkap Debitur</td>
                        <td className="py-1.5 text-slate-900 font-semibold">: {selectedSub.nama}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Nomor Induk Kependudukan (NIK)</td>
                        <td className="py-1.5 text-slate-900">: {selectedSub.nik}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Tanggal Lahir</td>
                        <td className="py-1.5 text-slate-900">: {selectedSub.tanggalLahir}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">No. Telepon / Handphone</td>
                        <td className="py-1.5 text-slate-900">: {selectedSub.telepon}</td>
                      </tr>
                      {selectedSub.statusPerkawinan === "Kawin" && (
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 font-medium text-slate-500">Nama Istri / Suami (Pasangan)</td>
                          <td className="py-1.5 text-slate-900">: {selectedSub.namaPasangan}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Vehicle Info */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    II. DATA SPESIFIKASI KENDARAAN
                  </h3>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500 w-1/3">Dealer Rekanan</td>
                        <td className="py-1.5 text-slate-900 font-semibold">: {selectedSub.dealer}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Merek & Model Kendaraan</td>
                        <td className="py-1.5 text-slate-900">
                          : {selectedSub.merkKendaraan} {selectedSub.modelKendaraan}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Tipe / Varian & Warna</td>
                        <td className="py-1.5 text-slate-900">
                          : {selectedSub.tipeKendaraan} ({selectedSub.warnaKendaraan})
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Harga On The Road (OTR)</td>
                        <td className="py-1.5 text-slate-950 font-bold">
                          : Rp {(selectedSub.hargaKendaraan || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Loan Details */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    III. RINCIAN PEMBIAYAAN KREDIT
                  </h3>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500 w-1/3">Uang Muka / Down Payment (DP)</td>
                        <td className="py-1.5 text-slate-900">: Rp {(selectedSub.downPayment || 0).toLocaleString("id-ID")}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Tenor Kredit / Lama Kredit</td>
                        <td className="py-1.5 text-slate-900">: {selectedSub.tenor} Bulan</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Jenis Jaminan Asuransi</td>
                        <td className="py-1.5 text-slate-900">: {selectedSub.asuransi}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-500">Nilai Angsuran per Bulan</td>
                        <td className="py-1.5 text-emerald-700 font-bold">
                          : Rp {(selectedSub.angsuran || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures Row */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 text-center">
                    LEMBAR PERNYATAAN & TANDA TANGAN ELEKTRONIK (E-SIGN)
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Customer */}
                    <div className="flex flex-col items-center justify-between h-36 border border-slate-100 p-2 rounded bg-slate-50/30">
                      <span className="text-[10px] font-bold text-slate-600">Konsumen / Debitur</span>
                      {selectedSub.ttdKonsumen ? (
                        <img
                          src={selectedSub.ttdKonsumen}
                          alt="Tanda Tangan Konsumen"
                          className="max-h-20 w-auto object-contain py-1"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic my-auto">Belum Ditandatangani</span>
                      )}
                      <span className="text-xs font-semibold text-slate-800">{selectedSub.nama}</span>
                    </div>

                    {/* Marketing */}
                    <div className="flex flex-col items-center justify-between h-36 border border-slate-100 p-2 rounded bg-slate-50/30">
                      <span className="text-[10px] font-bold text-slate-600">Marketing JKL</span>
                      {selectedSub.ttdMarketing ? (
                        <img
                          src={selectedSub.ttdMarketing}
                          alt="Tanda Tangan Marketing"
                          className="max-h-20 w-auto object-contain py-1"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic my-auto">Belum Ditandatangani</span>
                      )}
                      <span className="text-xs font-semibold text-slate-800">Petugas Marketing</span>
                    </div>

                    {/* Dealer */}
                    <div className="flex flex-col items-center justify-between h-36 border border-slate-100 p-2 rounded bg-slate-50/30">
                      <span className="text-[10px] font-bold text-slate-600">Perwakilan Dealer</span>
                      {selectedSub.ttdDealer ? (
                        <img
                          src={selectedSub.ttdDealer}
                          alt="Tanda Tangan Dealer"
                          className="max-h-20 w-auto object-contain py-1"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic my-auto">Belum Ditandatangani</span>
                      )}
                      <span className="text-xs font-semibold text-slate-800">Sales Supervisor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
