import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { Stethoscope, Briefcase, ArrowRight, Loader2, ChevronDown } from 'lucide-react';

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Shri', 'Smt.'];

export function Onboarding() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();

  // Strip any existing prefix from the Google name
  const rawName = (user?.name || '').replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Mx\.|Shri|Smt\.)\s*/i, '');

  const [firstName, setFirstName] = useState(rawName);
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR');
  const [title, setTitle] = useState('Mr.');
  const [isLoading, setIsLoading] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);

  // Build the display name
  const displayName = role === 'DOCTOR'
    ? `Dr. ${firstName}`.trim()
    : `${title} ${firstName}`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setIsLoading(true);
    try {
      await authAPI.updateProfile({ name: displayName, role, isOnboarded: true });

      const token = useAuthStore.getState().accessToken;
      if (token) await setAuth(token);

      navigate(role === 'RECEPTIONIST' ? '/app/reception' : '/app');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[420px] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px]" />

        <div className="relative z-10">
          <img src="/logo.png" alt="Mednivo" className="h-10 object-contain filter brightness-0 invert mb-16" />
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Almost there,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              let's get you set up.
            </span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            One quick step and your personalized clinic dashboard will be ready.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex -space-x-3">
            {['Doc1', 'Doc2', 'Doc3'].map((seed, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`} alt="" className="w-full h-full" />
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-slate-300 font-medium">2,000+ doctors trust Mednivo</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <img src="/logo.png" alt="Mednivo" className="h-10 object-contain" />
          </div>

          <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-3">Profile Setup</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome to Mednivo
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Tell us about yourself to personalize your experience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'DOCTOR' as const, label: 'Doctor', icon: Stethoscope, desc: 'Prescriptions & patients' },
                  { value: 'RECEPTIONIST' as const, label: 'Receptionist', icon: Briefcase, desc: 'Queue & appointments' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      role === opt.value
                        ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      role === opt.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-base ${role === opt.value ? 'text-emerald-900' : 'text-slate-800'}`}>{opt.label}</h3>
                    <p className={`text-xs mt-0.5 ${role === opt.value ? 'text-emerald-600' : 'text-slate-400'}`}>{opt.desc}</p>
                    {role === opt.value && (
                      <motion.div layoutId="roleCheck" className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Your full name</label>
              <div className="flex gap-2">

                {/* Title prefix */}
                {role === 'DOCTOR' ? (
                  <div className="flex items-center h-14 px-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-bold text-base select-none shrink-0">
                    Dr.
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setTitleOpen(!titleOpen)}
                      className="flex items-center gap-1.5 h-14 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold text-base hover:border-slate-300 transition-colors"
                    >
                      {title}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${titleOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {titleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-20 py-1 overflow-hidden"
                        >
                          {TITLES.map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => { setTitle(t); setTitleOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                                t === title ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="flex-1 h-14 px-5 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-800 font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="Enter your name"
                />
              </div>

              {/* Live preview */}
              {firstName.trim() && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-slate-500 pl-1"
                >
                  You'll appear as <span className="font-bold text-slate-800">{displayName}</span>
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !firstName.trim()}
              className="group w-full h-14 bg-slate-900 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2.5 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
