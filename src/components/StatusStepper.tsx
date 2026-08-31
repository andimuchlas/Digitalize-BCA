"use client";

interface Step {
  number: number;
  title: string;
  desc: string;
  role: "Sales" | "Marketing" | "Atasan" | "Backoffice" | "Konsumen";
}

const STEPS: Step[] = [
  { number: 1, title: "SPK & Bayar", desc: "Konsumen deal & bayar tanda jadi", role: "Sales" },
  { number: 2, title: "Kirim Prospek", desc: "Sales Dealer kirim prospek awal", role: "Sales" },
  { number: 3, title: "Survey & OCR", desc: "Marketing verifikasi & OCR KTP", role: "Marketing" },
  { number: 4, title: "Detail Input", desc: "Marketing lengkapi data kredit", role: "Marketing" },
  { number: 5, title: "Approval", desc: "Persetujuan Atasan Marketing", role: "Atasan" },
  { number: 6, title: "Print PO", desc: "Admin Backoffice cetak PO & Kontrak", role: "Backoffice" },
  { number: 7, title: "TTD Digital", desc: "E-Sign oleh Konsumen & Dealer", role: "Konsumen" },
  { number: 8, title: "Upload Dokumen", desc: "Unggah dokumen bertanda tangan", role: "Marketing" },
  { number: 9, title: "Pencairan Dana", desc: "Dana dicairkan ke Dealer", role: "Backoffice" },
];

interface StatusStepperProps {
  currentStatus: number;
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">
        Status Pelacakan Pengajuan (Tahap {currentStatus} dari 9)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-9 gap-4 relative">
        {STEPS.map((step) => {
          const isActive = currentStatus >= step.number;
          const isCurrent = currentStatus === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center text-center relative group">
              {/* Connector line for large screens */}
              {step.number < 9 && (
                <div
                  className={`hidden md:block absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-colors duration-300 ${
                    currentStatus > step.number ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Circle indicator */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                    : isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {step.number}
              </div>

              {/* Step info */}
              <div className="mt-3">
                <p
                  className={`text-xs font-semibold leading-tight transition-colors duration-300 ${
                    isActive ? "text-slate-800 font-bold" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug hidden md:block">
                  {step.desc}
                </p>
                <span
                  className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded mt-1.5 transition-all duration-300 ${
                    isCurrent
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : isActive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100"
                  }`}
                >
                  {step.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
