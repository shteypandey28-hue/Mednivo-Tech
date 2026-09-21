import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Plus, Search, ChevronLeft, ChevronRight, User, Phone, MapPin, AlignLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { appointmentsAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Appointments() {
  const [date, setDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '', date: '', startTime: '', type: 'Consultation'
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const dateString = date.toISOString().split('T')[0];
      const { data } = await appointmentsAPI.getAll({ date: dateString });
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const handleBook = async () => {
    try {
      await appointmentsAPI.create({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      setShowBookingModal(false);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your schedule and bookings.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
            <button onClick={handlePreviousDay} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-2 px-2 font-medium text-slate-700 text-sm w-32 justify-center">
              <CalendarIcon className="w-4 h-4" /> {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setShowBookingModal(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2">
            <Plus className="w-4 h-4" /> Book Slot
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: appointments.length, color: "blue" },
          { label: "Completed", value: appointments.filter(a => a.status === 'COMPLETED').length, color: "emerald" },
          { label: "Waiting", value: appointments.filter(a => a.status === 'WAITING' || a.status === 'IN_CONSULTATION').length, color: "amber" },
          { label: "Cancelled", value: appointments.filter(a => a.status === 'CANCELLED').length, color: "red" },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4 flex justify-between items-center`}>
            <span className={`text-sm font-medium text-${stat.color}-700`}>{stat.label}</span>
            <span className={`text-xl font-bold text-${stat.color}-800`}>{stat.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Schedule */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Schedule</h2>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Completed</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Waiting</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Upcoming</div>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No appointments scheduled for this date.
            </div>
          ) : (
            appointments.map((apt, idx) => {
              const statusStyles: Record<string, string> = {
                'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'IN_CONSULTATION': 'bg-blue-100 text-blue-700 border-blue-200',
                'WAITING': 'bg-amber-100 text-amber-700 border-amber-200',
                'CONFIRMED': 'bg-slate-100 text-slate-700 border-slate-200',
                'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
              };
              
              return (
                <div key={apt.id} className="flex flex-col sm:flex-row group hover:bg-slate-50 transition-colors">
                  {/* Time block */}
                  <div className="sm:w-32 p-4 flex items-start sm:border-r border-slate-100 text-slate-500">
                    <span className="font-mono text-sm">{apt.startTime}</span>
                  </div>
                  
                  {/* Content block */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-4 sm:pl-6 border-l-4 border-transparent hover:border-emerald-500 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                        {apt.patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{apt.patient.name}</h4>
                        <p className="text-sm text-slate-500">{apt.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[apt.status] || statusStyles['CONFIRMED']}`}>
                        {apt.status.replace(/_/g, ' ')}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                        <AlignLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Book Appointment</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Patient ID (Backend needs Patient UUID for now)</label>
                  <Input className="h-10" placeholder="Patient UUID..." value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Date</label>
                    <Input type="date" className="h-10" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Time (HH:MM)</label>
                    <Input type="time" className="h-10" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Appointment Type</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Consultation</option>
                    <option>Follow-up</option>
                    <option>Procedure</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                  <Button onClick={handleBook} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">Book Slot</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
