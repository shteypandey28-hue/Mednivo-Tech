import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Download, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prescriptionsAPI } from "@/lib/api";
import { openPrescriptionPdf } from "@/lib/pdf";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type Row = { id: string; rxId: string; patient: string; diagnosis: string; date: string; items: number };

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    prescriptionsAPI.getAll()
      .then(({ data }) => setRows(data.map((rx: any) => ({
        id: rx.id,
        rxId: rx.prescriptionId,
        patient: rx.patient?.name || "Unknown patient",
        diagnosis: rx.diagnosis || "No diagnosis",
        date: formatDate(rx.date || rx.createdAt),
        items: rx.items?.length || 0,
      }))))
      .catch(() => setError("Couldn't load prescriptions."))
      .finally(() => setLoading(false));
  }, []);

  const pdf = async (rx: Row, download: boolean) => {
    setBusyId(rx.id);
    try {
      await openPrescriptionPdf(rx.id, download ? { download: `${rx.rxId}.pdf` } : {});
    } catch {
      setError("Couldn't generate the PDF.");
    } finally {
      setBusyId(null);
    }
  };

  const q = searchTerm.toLowerCase();
  const filtered = rows.filter(rx =>
    rx.patient.toLowerCase().includes(q) ||
    rx.rxId.toLowerCase().includes(q) ||
    rx.diagnosis.toLowerCase().includes(q)
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prescriptions</h1>
          <p className="text-slate-500 mt-1">Manage and view all patient prescriptions.</p>
        </div>
        <Link to="/app/prescriptions/new">
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg gap-2">
            <Plus className="w-4 h-4" /> New Prescription
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by patient name, RX ID, or diagnosis..." 
              className="pl-10 h-11 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading && (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          )}
          {error && <p className="px-5 py-3 text-sm text-red-600 bg-red-50">{error}</p>}
          {!loading && filtered.map((rx) => (
            <div key={rx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">{rx.patient}</h4>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="font-mono text-emerald-600 font-medium">{rx.rxId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium">{rx.diagnosis}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{rx.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {rx.items} {rx.items === 1 ? 'medicine' : 'medicines'}
                </div>
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => pdf(rx, false)} disabled={busyId === rx.id} title="Print" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    {busyId === rx.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                  </button>
                  <button onClick={() => pdf(rx, true)} disabled={busyId === rx.id} title="Download PDF" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
             <div className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No prescriptions found</h3>
              <p className="text-sm text-slate-500 mt-1">{rows.length ? "Try a different search term." : "Prescriptions you save will appear here."}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
