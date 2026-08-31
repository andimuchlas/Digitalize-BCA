"use client";

import { useState, useEffect } from "react";
import {
  User,
  Smartphone,
  ShieldCheck,
  PenTool,
  Layers,
  FileText,
  Database
} from "lucide-react";

import SalesPortal from "@/components/portals/SalesPortal";
import MarketingPortal from "@/components/portals/MarketingPortal";
import AtasanPortal from "@/components/portals/AtasanPortal";
import EsignPortal from "@/components/portals/EsignPortal";
import BackofficePortal from "@/components/portals/BackofficePortal";
import TrackerPortal from "@/components/portals/TrackerPortal";

type Role = "sales" | "marketing" | "atasan" | "esign" | "backoffice" | "tracker";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Role>("tracker");
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; url: string }>({
    connected: false,
    url: "Loading...",
  });

  const checkDbStatus = async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        setDbStatus({
          connected: true,
          url: "Connected to PostgreSQL (Neon)",
        });
      }
    } catch (e) {
      setDbStatus({
        connected: false,
        url: "Fallback: In-Memory / Local Dev Mode Active",
      });
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  const handleActionSuccess = () => {
    console.log("Action performed successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base">
              J
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight text-sm sm:text-base leading-none">
                PT. JKL Multifinance
              </h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1">
                Sistem Digitalisasi Kredit Motor
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Navigation Tabs (Role Selector) */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white border border-slate-200 p-2 rounded-xl shadow-sm print:hidden">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "tracker"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <Layers className="w-4 h-4" />
            Semua Pengajuan
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "sales"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <User className="w-4 h-4" />
            1. Portal Sales (Dealer)
          </button>

          <button
            onClick={() => setActiveTab("marketing")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "marketing"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <Smartphone className="w-4 h-4" />
            2. Portal Marketing
          </button>

          <button
            onClick={() => setActiveTab("atasan")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "atasan"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            3. Approval Atasan
          </button>

          <button
            onClick={() => setActiveTab("esign")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "esign"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <PenTool className="w-4 h-4" />
            4. E-Signature Portal
          </button>

          <button
            onClick={() => setActiveTab("backoffice")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "backoffice"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <FileText className="w-4 h-4" />
            5. Backoffice PO
          </button>
        </div>

        {/* Dynamic Portal View */}
        <div className="min-h-[400px]">
          {activeTab === "tracker" && <TrackerPortal />}
          {activeTab === "sales" && <SalesPortal onSuccess={handleActionSuccess} />}
          {activeTab === "marketing" && <MarketingPortal onSuccess={handleActionSuccess} />}
          {activeTab === "atasan" && <AtasanPortal onSuccess={handleActionSuccess} />}
          {activeTab === "esign" && <EsignPortal onSuccess={handleActionSuccess} />}
          {activeTab === "backoffice" && <BackofficePortal onSuccess={handleActionSuccess} />}
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>andimuchlas</p>
        </div>
      </footer>
    </div>
  );
}
