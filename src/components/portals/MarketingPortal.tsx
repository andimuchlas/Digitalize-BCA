"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Scan, CheckCircle2, ChevronRight } from "lucide-react";
import { type Submission } from "@/db/schema";
import { useToast } from "@/context/ToastContext";

interface MarketingPortalProps {
  onSuccess: () => void;
}

export default function MarketingPortal({ onSuccess }: MarketingPortalProps) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Form states
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [statusPerkawinan, setStatusPerkawinan] = useState("Belum Kawin");
  const [namaPasangan, setNamaPasangan] = useState("");

  const [merkKendaraan, setMerkKendaraan] = useState("Honda");
  const [modelKendaraan, setModelKendaraan] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("");
  const [warnaKendaraan, setWarnaKendaraan] = useState("");
  const [hargaKendaraan, setHargaKendaraan] = useState("");

  const [asuransi, setAsuransi] = useState("Kombinasi");
  const [downPayment, setDownPayment] = useState("");
  const [tenor, setTenor] = useState("12");
  const [angsuran, setAngsuran] = useState("");

  const [ocrSuccess, setOcrSuccess] = useState(false);

  const fetchProspeks = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Filter submissions that are status 2 (needs input verification from Marketing)
        setSubmissions(data.filter((s: Submission) => s.status === 2));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProspeks();
  }, []);

  const selectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setNama(sub.nama);
    setNik(sub.nik || "");
    setTanggalLahir(sub.tanggalLahir || "");
    setStatusPerkawinan(sub.statusPerkawinan || "Belum Kawin");
    setNamaPasangan(sub.namaPasangan || "");
    
    // reset other fields
    setMerkKendaraan(sub.merkKendaraan || "Honda");
    setModelKendaraan(sub.modelKendaraan || "");
    setTipeKendaraan(sub.tipeKendaraan || "");
    setWarnaKendaraan(sub.warnaKendaraan || "");
    setHargaKendaraan(sub.hargaKendaraan ? String(sub.hargaKendaraan) : "");
    setAsuransi(sub.asuransi || "Kombinasi");
    setDownPayment(sub.downPayment ? String(sub.downPayment) : "");
    setTenor(sub.tenor ? String(sub.tenor) : "12");
    setAngsuran(sub.angsuran ? String(sub.angsuran) : "");
    setOcrSuccess(false);
  };

  const handleOcrSimulation = async () => {
    setLoadingOcr(true);
    setOcrSuccess(false);
    try {
      const res = await fetch("/api/ocr");
      if (res.ok) {
        const data = await res.json();
        setNik(data.nik);
        setNama(data.nama);
        setTanggalLahir(data.tanggalLahir);
        setStatusPerkawinan(data.statusPerkawinan);
        setNamaPasangan(data.namaPasangan);
        setOcrSuccess(true);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Gagal OCR",
        description: "Simulasi pemindaian OCR KTP gagal",
        variant: "destructive",
      });
    } finally {
      setLoadingOcr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setLoadingSubmit(true);

    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik,
          nama,
          tanggalLahir,
          statusPerkawinan,
          namaPasangan: statusPerkawinan === "Kawin" ? namaPasangan : "",
          merkKendaraan,
          modelKendaraan,
          tipeKendaraan,
          warnaKendaraan,
          hargaKendaraan: parseInt(hargaKendaraan) || 0,
          asuransi,
          downPayment: parseInt(downPayment) || 0,
          tenor: parseInt(tenor) || 12,
          angsuran: parseInt(angsuran) || 0,
          ktpUrl: "ktp_verified_mock.png",
          kkUrl: "kk_verified_mock.png",
          status: 4, // Langsung Tahap 4 (Atasan Approval) - dalam demo ini kita lewati verifikasi internal ke approval
        }),
      });

      if (res.ok) {
        toast({
          title: "Sukses",
          description: "Data digital berhasil dilengkapi! Status pengajuan kini menunggu persetujuan (Status 4)",
          variant: "success",
        });
        setSelectedSub(null);
        fetchProspeks();
        onSuccess();
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error || "Gagal memperbarui data pengajuan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Jaringan",
        description: "Gagal menghubungi server untuk memperbarui data",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Portal Marketing (Internal)</h2>
        <p className="text-sm text-slate-500">Lengkapi data kredit konsumen, lampirkan dokumen & simulasi OCR KTP (Tahap 3 - 4)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of pending prospeks */}
        <div className="lg:col-span-1 border border-slate-100 rounded-lg p-4 bg-slate-50/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Daftar Prospek Masuk ({submissions.length})
          </h3>
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Tidak ada prospek masuk.</p>
          ) : (
            <div className="space-y-2 max-h-[450px] overflow-y-auto">
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
                      Lengkapi <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Edit form with OCR simulation */}
        <div className="lg:col-span-2">
          {!selectedSub ? (
            <div className="border border-slate-100 rounded-lg py-16 text-center text-slate-400 bg-slate-50/20">
              Pilih salah satu prospek di panel kiri untuk mulai memproses data digitalisasi.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OCR simulation section */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Simulasi OCR KTP</h4>
                  <p className="text-xs text-blue-700">Simulasi pengisian data konsumen otomatis menggunakan JSON mock KTP.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOcrSimulation}
                  disabled={loadingOcr}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {loadingOcr ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> memindai...
                    </>
                  ) : (
                    <>
                      <Scan className="w-3.5 h-3.5" /> Ekstrak data (OCR)
                    </>
                  )}
                </button>
              </div>

              {ocrSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Berhasil mengekstrak data dari KTP! Form konsumen terisi otomatis.
                </div>
              )}

              {/* Data Konsumen section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1.5">
                  1. Data Konsumen (Sesuai KTP)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">NIK (KTP)</label>
                    <input
                      type="text"
                      required
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="Masukkan 16 digit NIK"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan Nama Lengkap"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                    <input
                      type="text"
                      required
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      placeholder="Contoh: DD-MM-YYYY"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status Perkawinan</label>
                    <select
                      value={statusPerkawinan}
                      onChange={(e) => setStatusPerkawinan(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>
                  {statusPerkawinan === "Kawin" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pasangan</label>
                      <input
                        type="text"
                        required
                        value={namaPasangan}
                        onChange={(e) => setNamaPasangan(e.target.value)}
                        placeholder="Masukkan nama istri / suami"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Data Kendaraan section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1.5">
                  2. Data Kendaraan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Merk Kendaraan</label>
                    <select
                      value={merkKendaraan}
                      onChange={(e) => setMerkKendaraan(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Honda">Honda</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Kawasaki">Kawasaki</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Model Kendaraan</label>
                    <input
                      type="text"
                      required
                      value={modelKendaraan}
                      onChange={(e) => setModelKendaraan(e.target.value)}
                      placeholder="Contoh: Vario 160, NMAX"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe / Varian</label>
                    <input
                      type="text"
                      required
                      value={tipeKendaraan}
                      onChange={(e) => setTipeKendaraan(e.target.value)}
                      placeholder="Contoh: ABS, CBS"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Warna Kendaraan</label>
                    <input
                      type="text"
                      required
                      value={warnaKendaraan}
                      onChange={(e) => setWarnaKendaraan(e.target.value)}
                      placeholder="Contoh: Matte Black, Red"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Kendaraan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={hargaKendaraan}
                      onChange={(e) => setHargaKendaraan(e.target.value)}
                      placeholder="Contoh: 28500000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data Pinjaman section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1.5">
                  3. Data Kredit / Pinjaman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Down Payment / DP (Rp)</label>
                    <input
                      type="number"
                      required
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      placeholder="Contoh: 3000000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tenor Kredit (Bulan)</label>
                    <select
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="11">11 Bulan</option>
                      <option value="17">17 Bulan</option>
                      <option value="23">23 Bulan</option>
                      <option value="29">29 Bulan</option>
                      <option value="35">35 Bulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Asuransi</label>
                    <select
                      value={asuransi}
                      onChange={(e) => setAsuransi(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Kombinasi">Kombinasi</option>
                      <option value="TLO (Total Loss Only)">TLO (Total Loss Only)</option>
                      <option value="All Risk">All Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Angsuran per Bulan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={angsuran}
                      onChange={(e) => setAngsuran(e.target.value)}
                      placeholder="Contoh: 1250000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {loadingSubmit ? "Menyimpan..." : "Lengkapi & Ajukan Approval"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
