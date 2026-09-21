import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Stethoscope } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Reports() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Gain insights into your clinic's performance.</p>
      </motion.div>

      {/* Chart Placeholders */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Revenue Trend</h3>
              <p className="text-sm text-slate-500">Last 30 days</p>
            </div>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {/* Mock chart bars */}
            {[40, 70, 45, 90, 65, 85, 120, 95, 60, 110, 80, 100].map((h, i) => (
              <div key={i} className="w-full bg-slate-100 rounded-t-md relative group cursor-pointer" style={{ height: '100%' }}>
                <div 
                  className="absolute bottom-0 w-full bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-400" 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Patient Demographics</h3>
              <p className="text-sm text-slate-500">Age distribution</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {/* Mock pie chart placeholder */}
            <div className="w-48 h-48 rounded-full border-[16px] border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-violet-500 transform rotate-45"></div>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> 18-30</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> 31-45</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> 46-60</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500"></div> 60+</div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₹3,45,000", icon: DollarSign, trend: "+12.5%" },
          { label: "New Patients", value: "128", icon: Users, trend: "+5.2%" },
          { label: "Consultations", value: "450", icon: Stethoscope, trend: "-2.1%" },
          { label: "Avg. Daily Visits", value: "18", icon: Calendar, trend: "+1.5%" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
