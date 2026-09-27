import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { User, Stethoscope, Briefcase, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      
      {/* Immersive Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* Rich overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />

      {/* Top Logo */}
      <div className="absolute top-8 left-8 z-20">
        <img src="/logo.png" alt="Mednivo Logo" className="h-10 object-contain drop-shadow-lg filter brightness-0 invert" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[600px] bg-white/95 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="p-10 sm:p-14">
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Final Step
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Set up your profile
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-md">
              Welcome to Mednivo! Tell us who you are so we can tailor your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-slate-100 border border-slate-200 rounded-2xl text-lg focus:bg-white focus:border-emerald-500 focus:ring-[4px] focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400"
                  placeholder="e.g. Dr. Jane Smith"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Type</label>
              <div className="grid sm:grid-cols-2 gap-4">
                
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                    role === 'DOCTOR'
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20 translate-y-[-2px]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${role === 'DOCTOR' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 shadow-sm'}`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black text-xl mb-1 ${role === 'DOCTOR' ? 'text-emerald-900' : 'text-slate-700'}`}>Doctor</h3>
                    <p className={`text-sm font-medium ${role === 'DOCTOR' ? 'text-emerald-700/80' : 'text-slate-500'}`}>Write prescriptions & treat patients</p>
                  </div>
                  {role === 'DOCTOR' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 right-6">
                      <Check className="w-6 h-6 text-emerald-500" strokeWidth={3} />
                    </motion.div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECEPTIONIST')}
                  className={`group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                    role === 'RECEPTIONIST'
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20 translate-y-[-2px]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${role === 'RECEPTIONIST' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 shadow-sm'}`}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black text-xl mb-1 ${role === 'RECEPTIONIST' ? 'text-emerald-900' : 'text-slate-700'}`}>Receptionist</h3>
                    <p className={`text-sm font-medium ${role === 'RECEPTIONIST' ? 'text-emerald-700/80' : 'text-slate-500'}`}>Manage the queue & appointments</p>
                  </div>
                  {role === 'RECEPTIONIST' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-6 right-6">
                      <Check className="w-6 h-6 text-emerald-500" strokeWidth={3} />
                    </motion.div>
                  )}
                </button>

              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="group w-full h-[70px] bg-slate-950 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 focus:ring-[4px] focus:ring-slate-900/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    Finalizing setup...
                  </>
                ) : (
                  <>
                    Launch Workspace
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
