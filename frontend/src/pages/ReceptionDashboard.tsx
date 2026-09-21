import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserPlus, CalendarPlus, UserCheck, Receipt, DollarSign, Printer,
  Search, Users, Clock, CheckCircle2, AlertCircle, TrendingUp, ChevronRight
} from "lucide-react";
import api, { queueAPI, clinicAPI } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const receptionStats = {
  todayAppointments: 22,
  walkins: 5,
  waitingQueue: 6,
  registrations: 3,
  todayCollection: 28500,
  pendingPayments: 8200,
};

export function ReceptionDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const fetchQueue = async () => {
    try {
      const { data } = await queueAPI.getToday();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue', error);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await clinicAPI.getDoctors();
        setDoctors(data);
        if (data.length > 0) setSelectedDoctor(data[0].id);
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };
    fetchDoctors();
    
    // Initial fetch
    fetchQueue();

    // Polling every 3 seconds
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { icon: UserPlus, label: "Register Patient", href: "/app/patients", color: "from-blue-500 to-blue-600" },
    { icon: CalendarPlus, label: "Book Appointment", href: "/app/appointments", color: "from-violet-500 to-purple-600" },
    { icon: UserCheck, label: "Check In", href: "/app/queue", color: "from-emerald-500 to-teal-600" },
    { icon: Receipt, label: "Generate Bill", href: "/app/billing", color: "from-amber-500 to-orange-600" },
    { icon: DollarSign, label: "Collect Payment", href: "/app/billing", color: "from-rose-500 to-pink-600" },
    { icon: Printer, label: "Print Receipt", href: "/app/billing", color: "from-slate-500 to-slate-600" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Reception <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">Dashboard</span>
        </h1>
        <p className="text-slate-500 mt-1">Manage front desk operations efficiently.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Today's Appointments", value: receptionStats.todayAppointments, icon: CalendarPlus, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Waiting Queue", value: queue.filter(q => q.status === 'WAITING').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Today's Collection", value: `₹${receptionStats.todayCollection.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Patients + Payment Queue */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full max-h-[600px] overflow-hidden">
          <h3 className="font-semibold text-slate-900 mb-4 shrink-0">Live Check-ins & Queue</h3>
          <div className="space-y-3 overflow-y-auto pr-2 pb-4">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No patients in queue today.</div>
            ) : (
              queue.map((p, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${p.status === 'IN_CONSULTATION' ? 'bg-blue-50/50 border-blue-100' : p.status === 'COMPLETED' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      p.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-700' : 
                      p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {p.tokenNumber}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{p.patient.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.status === 'WAITING' ? `Waiting for ${p.doctor.name}` :
                         p.status === 'IN_CONSULTATION' ? `In Room with ${p.doctor.name}` :
                         'Consultation Completed'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badges & Actions */}
                  {p.status === 'WAITING' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">Waiting</span>
                  )}
                  {p.status === 'IN_CONSULTATION' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium animate-pulse">Sent to Doctor</span>
                  )}
                  {p.status === 'COMPLETED' && (
                    <Link to="/app/billing" className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-medium transition-colors">
                      <Receipt className="w-3.5 h-3.5" /> Bill
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Check-in</h3>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedDoctor) {
              alert("Please select a doctor first.");
              return;
            }
            
            const formData = new FormData(e.currentTarget);
            try {
              // 1. Create Patient
              const { data: patient } = await api.post('/patients', {
                name: formData.get('name'),
                age: Number(formData.get('age')),
                phone: formData.get('phone'),
                gender: String(formData.get('gender')).toUpperCase()
              });
              
              // 2. Add to Queue
              await api.post('/queue', {
                patientId: patient.id,
                doctorId: selectedDoctor
              });
              
              fetchQueue(); // Manually refresh right away to feel snappy
              e.currentTarget.reset();
            } catch (error) {
              console.error('Failed to add to queue', error);
              alert('Failed to add patient to queue');
            }
          }}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Assign Doctor</label>
              <select 
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required 
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {doctors.length === 0 && <option value="">Loading doctors...</option>}
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Patient Name</label>
              <input type="text" name="name" required className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Age</label>
                <input type="number" name="age" required className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. 34" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <select name="gender" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input type="tel" name="phone" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. 9876543210" />
            </div>
            <button type="submit" className="w-full h-10 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors mt-2">
              Add to Queue
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
