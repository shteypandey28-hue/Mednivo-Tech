import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import {
  CalendarDays, Users, Stethoscope, DollarSign, Clock,
  UserPlus, FilePlus, CalendarPlus, Receipt, Search,
  Timer, ChevronRight, Loader2, CheckCircle2, TrendingUp
} from "lucide-react";
import { queueAPI } from "@/lib/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

// Demo data for dashboard
const todayStats = {
  totalAppointments: 18,
  completed: 7,
  waiting: 4,
  upcoming: 5,
  cancelled: 2,
  revenue: 12500,
  pending: 3500,
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'COMPLETED': { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'IN_CONSULTATION': { label: 'In Consultation', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'WAITING': { label: 'Waiting', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

export function DoctorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data } = await queueAPI.getToday();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    try {
      await queueAPI.callNext();
      fetchQueue();
    } catch (error) {
      console.error('Failed to call next', error);
    }
  };

  const handleComplete = async (queueId: string) => {
    try {
      await queueAPI.updateStatus(queueId, 'COMPLETED');
      fetchQueue();
    } catch (error) {
      console.error('Failed to complete consultation', error);
    }
  };
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const quickActions = [
    { icon: UserPlus, label: "New Patient", href: "/app/patients", color: "from-blue-500 to-blue-600" },
    { icon: Stethoscope, label: "Start Consultation", href: "/app/queue", color: "from-emerald-500 to-teal-600" },
    { icon: FilePlus, label: "New Prescription", href: "/app/prescriptions/new", color: "from-violet-500 to-purple-600" },
    { icon: CalendarPlus, label: "Book Appointment", href: "/app/appointments", color: "from-amber-500 to-orange-600" },
    { icon: Receipt, label: "Generate Invoice", href: "/app/billing", color: "from-rose-500 to-pink-600" },
    { icon: Search, label: "Search Patient", href: "/app/patients", color: "from-slate-500 to-slate-600" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">{user?.name?.split(' ').slice(0, 2).join(' ')}</span>
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening at your clinic today.</p>
        </div>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: queue.length, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: queue.filter(q => q.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Waiting", value: queue.filter(q => q.status === 'WAITING').length, icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Today's Revenue", value: `₹${todayStats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
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
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group"
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

      {/* Today's Queue */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Today's Queue</h2>
            {queue.some(q => q.status === 'WAITING') && (
              <button 
                onClick={handleCallNext}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                <Stethoscope className="w-4 h-4" /> Call Next
              </button>
            )}
          </div>
          <Link to="/app/queue" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50 min-h-[150px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : queue.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Queue is empty for today.
              </div>
            ) : (
              queue.map((q, idx) => {
                const status = statusConfig[q.status] || { label: q.status, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/app/patients/${q.patient.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-500 font-mono w-20 hidden sm:block">
                        {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                        {q.patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{q.patient.name}</p>
                        <p className="text-xs text-slate-500">{q.patient.patientUHID} • {q.patient.age}Y / {q.patient.gender === 'MALE' ? 'M' : 'F'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {q.status === 'WAITING' && (
                        <button
                          onClick={async (e) => { 
                            e.stopPropagation(); 
                            await queueAPI.updateStatus(q.id, 'IN_CONSULTATION');
                            navigate(`/app/consultation/${q.patient.id}`);
                          }}
                          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Start
                        </button>
                      )}
                      {q.status === 'IN_CONSULTATION' && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleComplete(q.id);
                          }}
                          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Bottom row: Pending Payments & Follow-ups */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Pending Payments</h3>
            <span className="text-lg font-bold text-amber-600">₹{todayStats.pending.toLocaleString()}</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Rahul Sharma', amount: 1500, days: 2 },
              { name: 'Sunita Devi', amount: 2000, days: 5 },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500">Overdue by {p.days} days</p>
                </div>
                <span className="font-bold text-amber-700">₹{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Follow-ups Due Today</h3>
            <span className="text-sm text-emerald-600 font-medium">3 patients</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Amit Kumar', reason: 'Diabetes follow-up', lastVisit: '2 weeks ago' },
              { name: 'Priya Singh', reason: 'Post-surgery review', lastVisit: '1 week ago' },
              { name: 'Vikram Patel', reason: 'Blood pressure check', lastVisit: '3 weeks ago' },
            ].map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-500">{f.reason} • {f.lastVisit}</p>
                </div>
                <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700">Call</button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
