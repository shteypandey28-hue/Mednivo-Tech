import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { User, Stethoscope, Briefcase, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export function Onboarding() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await authAPI.updateProfile({ name, role, isOnboarded: true });
      
      const token = useAuthStore.getState().accessToken;
      if (token) await setAuth(token);

      if (role === 'RECEPTIONIST') {
        navigate('/app/reception');
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-teal-50 flex flex-col items-center justify-center p-4 sm:p-8">
      
      <div className="absolute top-8 left-8">
        <img src="/logo.png" alt="Mednivo Logo" className="h-10 object-contain" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        <div className="p-10 sm:p-14">
          <div className="flex items-center gap-3 mb-8 inline-flex px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
            <Sparkles className="w-4 h-4" />
            <span>Profile Setup</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Welcome aboard.
          </h1>
          <p className="text-lg text-slate-500 mb-12 max-w-lg">
            Let's personalize your Mednivo experience. Tell us a bit about yourself to get your dashboard ready.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">What's your full name?</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                  <User className="h-6 w-6" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-slate-50/50 border-2 border-slate-200 rounded-2xl text-lg focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                  placeholder="e.g. Dr. Jane Smith"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">How will you use Mednivo?</label>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    role === 'DOCTOR'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'DOCTOR' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${role === 'DOCTOR' ? 'text-emerald-900' : 'text-slate-700'}`}>Doctor</h3>
                    <p className={`text-sm mt-1 ${role === 'DOCTOR' ? 'text-emerald-700/80' : 'text-slate-500'}`}>Manage patients & write prescriptions</p>
                  </div>
                  {role === 'DOCTOR' && <CheckCircle2 className="absolute top-5 right-5 w-6 h-6 text-emerald-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECEPTIONIST')}
                  className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    role === 'RECEPTIONIST'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'RECEPTIONIST' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${role === 'RECEPTIONIST' ? 'text-emerald-900' : 'text-slate-700'}`}>Receptionist</h3>
                    <p className={`text-sm mt-1 ${role === 'RECEPTIONIST' ? 'text-emerald-700/80' : 'text-slate-500'}`}>Manage queues & appointments</p>
                  </div>
                  {role === 'RECEPTIONIST' && <CheckCircle2 className="absolute top-5 right-5 w-6 h-6 text-emerald-500" />}
                </button>

              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full h-16 bg-slate-900 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Preparing your workspace...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
          
        </div>
      </motion.div>
    </div>
  );
}
