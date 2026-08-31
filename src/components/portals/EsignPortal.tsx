"use client";

import { useState, useEffect } from "react";
import { Loader2, PenTool, CheckCircle2 } from "lucide-react";
import { type Submission } from "@/db/schema";
import { useToast } from "@/context/ToastContext";
import SignaturePad from "../SignaturePad";

interface EsignPortalProps {
  onSuccess: () => void;
}

export default function EsignPortal({ onSuccess }: EsignPortalProps) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Signatures
  const [ttdKonsumen, setTtdKonsumen] = useState<string | null>(null);
  const [ttdMarketing, setTtdMarketing] = useState<string | null>(null);
  const [ttdDealer, setTtdDealer] = useState<string | null>(null);

  const fetchPendingSignatures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Filter submissions with status = 6 (Approved, ready for E-Signature)
        setSubmissions(data.filter((s: Submission) => s.status === 6));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSignatures();
  }, []);

  const selectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setTtdKonsumen(sub.ttdKonsumen || null);
    setTtdMarketing(sub.ttdMarketing || null);
    setTtdDealer(sub.ttdDealer || null);
  };

  const handleSaveSignatures = async () => {
    if (!selectedSub) return;
    if (!ttdKonsumen || !ttdMarketing || !ttdDealer) {
      toast({
        title: "Peringatan",
        description: "Harap lengkapi ketiga tanda tangan (Konsumen, Marketing, & Dealer)",
        variant: "destructive",
      });
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ttdKonsumen,
          ttdMarketing,
          ttdDealer,
          status: 8, // Tahap 8: Dokumen Ditandatangani & Diunggah
        }),
      });

      if (res.ok) {
        toast({
          title: "Sukses TTD",
          description: "Dokumen berhasil ditandatangani secara digital! Status pengajuan kini lengkap.",
          variant: "success",
        });
        setSelectedSub(null);
        fetchPendingSignatures();
        onSuccess();
      } else {
        toast({
          title: "Gagal Menyimpan",
          description: "Gagal menyimpan tanda tangan digital",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Jaringan",
        description: "Terjadi kesalahan jaringan saat menyimpan tanda tangan",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Portal Tanda Tangan Digital (E-Signature)</h2>
        <p className="text-sm text-slate-500">Penandatanganan dokumen Kontrak & PO secara digital oleh Konsumen, Marketing, dan Dealer (Tahap 7)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: submissions waiting for signature */}
        <div className="lg:col-span-1 border border-slate-100 rounded-lg p-4 bg-slate-50/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Daftar Antrean TTD ({submissions.length})
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Tidak ada dokumen yang butuh TTD.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => selectSubmission(sub)}
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
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>{sub.dealer}</span>
                    <span className="text-blue-600 font-semibold flex items-center">
                      TTD Sekarang <PenTool className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Signature process canvas */}
        <div className="lg:col-span-2">
          {!selectedSub ? (
            <div className="border border-slate-100 rounded-lg py-16 text-center text-slate-400 bg-slate-50/20">
              Pilih salah satu dokumen di panel kiri untuk mulai proses penandatanganan digital.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800">Detail Pengajuan</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Nama Konsumen: <strong>{selectedSub.nama}</strong> | Dealer: <strong>{selectedSub.dealer}</strong> | Kendaraan:{" "}
                  <strong>
                    {selectedSub.merkKendaraan} {selectedSub.modelKendaraan}
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SignaturePad
                  label="Tanda Tangan Konsumen"
                  onSave={(data) => setTtdKonsumen(data)}
                  onClear={() => setTtdKonsumen(null)}
                />
                <SignaturePad
                  label="Tanda Tangan Marketing"
                  onSave={(data) => setTtdMarketing(data)}
                  onClear={() => setTtdMarketing(null)}
                />
                <SignaturePad
                  label="Tanda Tangan Dealer"
                  onSave={(data) => setTtdDealer(data)}
                  onClear={() => setTtdDealer(null)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSignatures}
                  disabled={loadingSubmit || !ttdKonsumen || !ttdMarketing || !ttdDealer}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {loadingSubmit ? "Menyimpan..." : "Kirim Dokumen TTD"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
