import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { Stethoscope, Briefcase, ArrowRight, Loader2, ChevronDown, Sparkles } from 'lucide-react';

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Shri', 'Smt.'];

export function OnboardingModal() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const rawName = (user?.name || '').replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Mx\.|Shri|Smt\.)\s*/i, '');

  const [firstName, setFirstName] = useState(rawName);
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR');
  const [title, setTitle] = useState('Mr.');
  const [isLoading, setIsLoading] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);

  const displayName = role === 'DOCTOR'
    ? `Dr. ${firstName}`.trim()
    : `${title} ${firstName}`.trim();

  // Don't render if user is already onboarded
  if (!user || user.isOnboarded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setIsLoading(true);
    try {
      await authAPI.updateProfile({ name: displayName, role, isOnboarded: true });

      const token = useAuthStore.getState().accessToken;
      if (token) await setAuth(token);

      // Redirect to correct dashboard based on role and reload to refresh layout
      if (role === 'RECEPTIONIST') {
        window.location.href = '/app/reception';
      } else {
        window.location.href = '/app';
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[520px] bg-white rounded-3xl shadow-2xl overflow-visible"
      >
        {/* Green top accent - rounded to match card */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-t-3xl" />

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Mednivo" className="h-14 object-contain mx-auto mb-5" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              One-time setup
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to Mednivo!
            </h2>
            <p className="text-slate-500 mt-2">
              Select your role and confirm your name to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'DOCTOR' as const, label: 'Doctor', icon: Stethoscope, desc: 'Prescriptions & patients' },
                  { value: 'RECEPTIONIST' as const, label: 'Receptionist', icon: Briefcase, desc: 'Queue & appointments' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      role === opt.value
                        ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                      role === opt.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-sm ${role === opt.value ? 'text-emerald-900' : 'text-slate-800'}`}>{opt.label}</h3>
                    <p className={`text-xs mt-0.5 ${role === opt.value ? 'text-emerald-600' : 'text-slate-400'}`}>{opt.desc}</p>
                    {role === opt.value && (
                      <motion.div layoutId="modalRoleCheck" className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Your name</label>
              <div className="flex gap-2">
                {role === 'DOCTOR' ? (
                  <div className="flex items-center h-12 px-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm select-none shrink-0">
                    Dr.
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setTitleOpen(!titleOpen)}
                      className="flex items-center gap-1 h-12 px-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors"
                    >
                      {title}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${titleOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {titleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute bottom-full left-0 mb-1 w-24 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1"
                        >
                          {TITLES.map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => { setTitle(t); setTitleOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-sm font-semibold ${
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
                  className="flex-1 h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
              {firstName.trim() && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-slate-500"
                >
                  You'll appear as <span className="font-bold text-slate-800">{displayName}</span>
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !firstName.trim()}
              className="group w-full h-12 bg-slate-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
