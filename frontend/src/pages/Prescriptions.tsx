import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Download, Printer, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const prescriptions = [
  { id: 'RX-000124', date: 'Today, 10:45 AM', patient: 'Rahul Sharma', diagnosis: 'Viral Fever', items: 4 },
  { id: 'RX-000123', date: 'Today, 09:30 AM', patient: 'Priya Singh', diagnosis: 'Migraine', items: 2 },
  { id: 'RX-000122', date: 'Yesterday', patient: 'Amit Kumar', diagnosis: 'Hypertension', items: 3 },
  { id: 'RX-000121', date: 'Yesterday', patient: 'Sunita Devi', diagnosis: 'Type 2 Diabetes', items: 5 },
  { id: 'RX-000120', date: 'Sep 5, 2026', patient: 'Vikram Patel', diagnosis: 'Acid Reflux', items: 2 },
];

export function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = prescriptions.filter(rx => 
    rx.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Button variant="outline" className="h-11 gap-2 bg-white"><Filter className="w-4 h-4" /> Filter</Button>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((rx, idx) => (
            <div key={rx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">{rx.patient}</h4>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="font-mono text-emerald-600 font-medium">{rx.id}</span>
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
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
             <div className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No prescriptions found</h3>
              <p className="text-sm text-slate-500 mt-1">Try a different search term or create a new one.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
