import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ListOrdered, CheckCircle2, Clock, Users, Play, Stethoscope, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { queueAPI } from "@/lib/api";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

export function QueuePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
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
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeConsultation = queue.find(q => q.status === 'IN_CONSULTATION');
  const waitingList = queue.filter(q => q.status === 'WAITING' || q.status === 'COMPLETED');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Queue</h1>
          <p className="text-slate-500 mt-1">Manage today's patient flow.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live
          </div>
        </div>
      </motion.div>

      {/* Active Consultation Banner */}
      {activeConsultation ? (
        <motion.div variants={item} className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">Currently Serving</span>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                  {activeConsultation.tokenNumber}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{activeConsultation.patient.name}</h2>
                  <p className="text-emerald-100 mt-1">
                    In consultation since {new Date(activeConsultation.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl font-medium transition-colors">
                Hold
              </button>
              <button 
                onClick={async () => {
                  await queueAPI.updateStatus(activeConsultation.id, 'COMPLETED');
                  fetchQueue();
                }}
                className="flex-1 sm:flex-none bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Complete & Call Next
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">No Active Consultation</span>
              <h2 className="text-2xl font-bold mt-1">Ready for next patient</h2>
            </div>
            {queue.some(q => q.status === 'WAITING') && (
              <button 
                onClick={async () => {
                  await queueAPI.callNext();
                  fetchQueue();
                }}
                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                Call Next Patient
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Queue List */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Waiting List</h2>
          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {waitingList.filter(q => q.status === 'WAITING').length} waiting
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : waitingList.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No patients in the queue.
            </div>
          ) : (
            waitingList.map((p, idx) => (
              <motion.div 
                key={p.id}
                variants={item}
                className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${p.status === 'COMPLETED' ? 'bg-slate-100 text-slate-400' : 
                      p.status === 'IN_CONSULTATION' ? 'bg-emerald-100 text-emerald-600' : 
                      'bg-slate-100 text-slate-700 border-2 border-slate-200'}`}
                  >
                    {p.tokenNumber}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${p.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {p.patient.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  {p.status === 'WAITING' && (
                    <button onClick={() => navigate(`/app/consultation/${p.patient.id}`)} className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors group">
                      <Stethoscope className="w-4 h-4 text-slate-400 group-hover:text-emerald-100" />
                      Start
                    </button>
                  )}
                  {p.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
