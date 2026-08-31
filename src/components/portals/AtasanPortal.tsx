"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ThumbsUp, ThumbsDown } from "lucide-react";
import { type Submission } from "@/db/schema";

interface AtasanPortalProps {
  onSuccess: () => void;
}

export default function AtasanPortal({ onSuccess }: AtasanPortalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchPendingApproval = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Filter submissions with status = 4 (Submitted, waiting for approval)
        setSubmissions(data.filter((s: Submission) => s.status === 4));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApproval();
  }, []);

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 6, // Tahap 6: PO & Kontrak diterbitkan, siap E-Sign
        }),
      });

      if (res.ok) {
        alert("Pengajuan kredit berhasil disetujui! PO & Kontrak siap ditandatangani.");
        fetchPendingApproval();
        onSuccess();
      } else {
        alert("Gagal menyetujui pengajuan");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Portal Atasan Marketing (Internal)</h2>
        <p className="text-sm text-slate-500">Persetujuan pengajuan kredit yang telah lengkap secara digital (Tahap 5)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/20">
          Tidak ada pengajuan yang membutuhkan persetujuan saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">{sub.nama}</span>
                  <span className="text-xs text-slate-500">ID: #{sub.id}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Dealer:</span>
                    <span className="font-medium text-slate-800">{sub.dealer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kendaraan:</span>
                    <span className="font-medium text-slate-800">
                      {sub.merkKendaraan} {sub.modelKendaraan} {sub.tipeKendaraan}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">DP / Tenor:</span>
                    <span className="font-medium text-slate-800">
                      Rp {(sub.downPayment || 0).toLocaleString("id-ID")} / {sub.tenor} Bln
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Angsuran / Bln:</span>
                    <span className="font-medium text-emerald-600 font-bold">
                      Rp {(sub.angsuran || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleApprove(sub.id)}
                  disabled={actionId !== null}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {actionId === sub.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-3.5 h-3.5" />
                  )}
                  Setujui Kredit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
