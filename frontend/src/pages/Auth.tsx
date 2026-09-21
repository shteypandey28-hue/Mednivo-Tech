// Auto-restored latest design changes
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, User, Lock, Mail, ArrowRight, Loader2, Hospital, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, name, role });
      }

      const userStr = localStorage.getItem('mednivo-auth');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed?.state?.user?.role === 'RECEPTIONIST') {
          navigate('/app/reception');
        } else {
          navigate('/app');
        }
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - Auth Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 sm:px-16 py-12 relative z-10 bg-white shadow-2xl">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img src="/logo.png" alt="Mednivo Logo" className="h-12 object-contain group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-slate-500">
              {isLogin
                ? "Enter your details to access your clinic dashboard."
                : "Set up your clinic and start managing patients."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="Dr. Arjun Mehta"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('DOCTOR')}
                      className={`h-12 border rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${role === 'DOCTOR'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <Activity className="w-4 h-4" /> Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('RECEPTIONIST')}
                      className={`h-12 border rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${role === 'RECEPTIONIST'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <User className="w-4 h-4" /> Reception
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="doctor@clinic.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {isLogin && (
                  <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visuals */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950 items-end justify-start p-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay (darker at the bottom for text readability, clear at the top) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent z-0" />

        {/* Floating text without the heavy card */}
        <div className="relative z-10 max-w-xl pb-8">

          <h2 className="text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
            The complete OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">modern clinics</span> in India.
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-10 font-light">
            Manage your queue, write prescriptions at lightning speed, collect payments, and grow your practice — all from one beautiful interface.
          </p>

          <div className="flex items-center gap-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 inline-flex">
            <div className="flex -space-x-3">
              {[
                "https://api.dicebear.com/7.x/notionists/svg?seed=Doc1&backgroundColor=e2e8f0",
                "https://api.dicebear.com/7.x/notionists/svg?seed=Doc2&backgroundColor=e2e8f0",
                "https://api.dicebear.com/7.x/notionists/svg?seed=Doc3&backgroundColor=e2e8f0"
              ].map((src, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden relative z-10">
                  <img src={src} alt="Doctor" className="w-full h-full object-cover opacity-90" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-200">Joined by 2,000+ doctors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
