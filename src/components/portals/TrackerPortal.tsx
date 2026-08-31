"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { type Submission } from "@/db/schema";
import StatusStepper from "../StatusStepper";

export default function TrackerPortal() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return { label: "Deal SPK", color: "bg-slate-100 text-slate-700 border-slate-200" };
      case 2:
        return { label: "Kirim Prospek", color: "bg-blue-50 text-blue-700 border-blue-100" };
      case 3:
        return { label: "Verifikasi Survey", color: "bg-purple-50 text-purple-700 border-purple-100" };
      case 4:
        return { label: "Menunggu Approval", color: "bg-amber-50 text-amber-700 border-amber-100" };
      case 5:
        return { label: "Approval Sukses", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case 6:
        return { label: "Terbit PO & Cetak", color: "bg-indigo-50 text-indigo-700 border-indigo-100" };
      case 7:
        return { label: "Menunggu TTD", color: "bg-pink-50 text-pink-700 border-pink-100" };
      case 8:
        return { label: "TTD Lengkap", color: "bg-teal-50 text-teal-700 border-teal-100" };
      case 9:
        return { label: "Dana Cair (Selesai)", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      default:
        return { label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.nama.toLowerCase().includes(search.toLowerCase()) ||
      sub.dealer.toLowerCase().includes(search.toLowerCase()) ||
      (sub.modelKendaraan || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Pelacak Semua Pengajuan Kredit</h2>
          <p className="text-sm text-slate-500">Pantau dan kelola seluruh berkas kredit motor (Tahap 1 - 9)</p>
        </div>
        <button
          onClick={fetchAllSubmissions}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      <div className="mb-5 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama konsumen, dealer, atau kendaraan..."
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/20">
          {search ? "Hasil pencarian kosong." : "Belum ada data pengajuan dalam sistem."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Konsumen</th>
                <th className="py-3 px-4">Dealer</th>
                <th className="py-3 px-4">Kendaraan</th>
                <th className="py-3 px-4">DP / Angsuran</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => {
                const isExpanded = expandedId === sub.id;
                const statusStyle = getStatusLabel(sub.status);

                return (
                  <>
                    <tr
                      key={sub.id}
                      onClick={() => toggleExpand(sub.id)}
                      className={`border-b border-slate-200 hover:bg-slate-50/50 cursor-pointer transition ${
                        isExpanded ? "bg-slate-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-500">#{sub.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{sub.nama}</div>
                        <div className="text-xs text-slate-400">{sub.telepon}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{sub.dealer}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {sub.merkKendaraan ? (
                          <>
                            <span className="font-semibold text-slate-700">
                              {sub.merkKendaraan} {sub.modelKendaraan}
                            </span>
                            <span className="text-xs text-slate-400 block">{sub.tipeKendaraan}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Belum Diinput</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.downPayment ? (
                          <>
                            <div className="font-medium text-slate-700">
                              DP: Rp {sub.downPayment.toLocaleString("id-ID")}
                            </div>
                            <div className="text-xs font-semibold text-emerald-600">
                              {sub.tenor}x Rp {sub.angsuran?.toLocaleString("id-ID")}/bln
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Belum Diinput</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 border rounded-full ${statusStyle.color}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${sub.id}-stepper`} className="bg-slate-50/30">
                        <td colSpan={7} className="p-4 border-b border-slate-200">
                          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner space-y-4">
                            <StatusStepper currentStatus={sub.status} />

                            {/* Additional details drawer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 text-xs">
                              <div>
                                <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-1 mb-2">
                                  Informasi Konsumen
                                </h4>
                                <ul className="space-y-1 text-slate-600">
                                  <li>
                                    NIK: <span className="font-semibold text-slate-800">{sub.nik || "-"}</span>
                                  </li>
                                  <li>
                                    Tanggal Lahir:{" "}
                                    <span className="font-semibold text-slate-800">{sub.tanggalLahir || "-"}</span>
                                  </li>
                                  <li>
                                    Status Perkawinan:{" "}
                                    <span className="font-semibold text-slate-800">{sub.statusPerkawinan || "-"}</span>
                                  </li>
                                  {sub.statusPerkawinan === "Kawin" && (
                                    <li>
                                      Nama Pasangan:{" "}
                                      <span className="font-semibold text-slate-800">{sub.namaPasangan || "-"}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-1 mb-2">
                                  Informasi Dokumen & Lampiran
                                </h4>
                                <ul className="space-y-1 text-slate-600">
                                  <li>
                                    Berkas SPK: <span className="text-blue-600 underline cursor-pointer">{sub.spkUrl}</span>
                                  </li>
                                  <li>
                                    Bukti Transfer:{" "}
                                    <span className="text-blue-600 underline cursor-pointer">{sub.buktiBayarUrl}</span>
                                  </li>
                                  {sub.ktpUrl && (
                                    <li>
                                      Foto KTP:{" "}
                                      <span className="text-blue-600 underline cursor-pointer">{sub.ktpUrl}</span>
                                    </li>
                                  )}
                                  {sub.ttdKonsumen && (
                                    <li>
                                      Tanda Tangan Digital:{" "}
                                      <span className="text-emerald-600 font-semibold">Tersimpan (Konsumen, Marketing, Dealer)</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
