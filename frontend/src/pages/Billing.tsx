import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Search, FileText, Download, CheckCircle2, AlertCircle, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const invoices = [
  { id: 'INV-000124', date: 'Today, 10:30 AM', patient: 'Rahul Sharma', amount: 1500, status: 'paid' },
  { id: 'INV-000123', date: 'Today, 09:45 AM', patient: 'Priya Singh', amount: 800, status: 'pending' },
  { id: 'INV-000122', date: 'Yesterday', patient: 'Amit Kumar', amount: 2500, status: 'paid' },
  { id: 'INV-000121', date: 'Yesterday', patient: 'Sunita Devi', amount: 1200, status: 'overdue' },
  { id: 'INV-000120', date: 'Sep 5, 2026', patient: 'Vikram Patel', amount: 500, status: 'paid' },
];

export function Billing() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-500 mt-1">Manage invoices, payments, and receipts.</p>
        </div>
        <Button className="bg-slate-900 text-white gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Today's Revenue</p>
          <p className="text-3xl font-bold text-slate-900">₹12,500</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex flex-col justify-center">
          <p className="text-sm text-amber-700 font-medium mb-1">Pending Collections</p>
          <p className="text-3xl font-bold text-amber-900">₹4,200</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col justify-center">
          <p className="text-sm text-emerald-700 font-medium mb-1">Total Invoices (This Month)</p>
          <p className="text-3xl font-bold text-emerald-900">142</p>
        </div>
      </motion.div>

      {/* Invoice List */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search invoice..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-2">
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm text-slate-600">
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.patient}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {inv.status === 'paid' && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Paid</span>}
                    {inv.status === 'pending' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>}
                    {inv.status === 'overdue' && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Overdue</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status !== 'paid' && (
                        <button className="text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1 hover:bg-emerald-50 rounded-lg transition-colors">
                          Collect
                        </button>
                      )}
                      <button className="text-slate-500 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
