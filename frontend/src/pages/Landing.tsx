import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { Logo } from "@/components/Logo";
import {
  Stethoscope, CalendarDays, Receipt, Microscope, ChevronRight,
  Activity, Users, Shield, Zap, ArrowRight, CheckCircle2, Sparkles,
  HeartPulse, ClipboardList, Star, Headphones, Building2, UserCheck, Clock, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

/* ─── Animation Variants ─────────────────────────────────────── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeIn: any = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const slideInLeft: any = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const slideInRight: any = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

/* ─── Floating Blob Component ────────────────────────────────── */
function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        scale: [1, 1.05, 0.98, 1.02, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Stat Counter ───────────────────────────────────────────── */
function AnimatedCounter({ target, decimals = 0, duration = 2 }: { target: number; decimals?: number; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()),
    });
    return controls.stop;
  }, [isInView, target, decimals, duration]);

  return <span ref={ref}>{display}</span>;
}

const statData = [
  { value: 500, decimals: 0, suffix: "+", label: "Active Clinics", desc: "Across 120+ cities", color: "from-blue-600 to-cyan-500" },
  { value: 1.2, decimals: 1, suffix: "M", label: "Patients Managed", desc: "Growing every day", color: "from-emerald-600 to-teal-500" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Uptime SLA", desc: "Enterprise reliability", color: "from-violet-600 to-purple-500" },
  { value: 4.9, decimals: 1, suffix: "★", label: "Doctor Rating", desc: "12,000+ reviews", color: "from-amber-500 to-orange-500" },
];

/* ─── Landing Page ───────────────────────────────────────────── */
export function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    { icon: Users, title: "Smart Queue Management", desc: "Live token tracking, wait time estimation, and seamless check-ins for your front desk.", gradient: "from-blue-500 via-sky-400 to-cyan-400", glow: "shadow-blue-500/30", num: "01", bgTint: "bg-blue-50/80", borderTint: "border-blue-200/60" },
    { icon: Stethoscope, title: "Lightning Fast EMR", desc: "Write clinical notes in seconds with auto-complete and specialty-specific templates.", gradient: "from-emerald-500 via-green-400 to-teal-400", glow: "shadow-emerald-500/30", num: "02", bgTint: "bg-emerald-50/80", borderTint: "border-emerald-200/60" },
    { icon: Zap, title: "AI Voice-to-Notes", desc: "Speak naturally to the patient, and let AI draft the clinical notes for your review.", gradient: "from-violet-500 via-purple-400 to-fuchsia-400", glow: "shadow-violet-500/30", num: "03", bgTint: "bg-violet-50/80", borderTint: "border-violet-200/60" },
    { icon: Receipt, title: "Integrated Billing", desc: "Generate invoices, collect UPI/Card payments via Razorpay, and print receipts instantly.", gradient: "from-amber-500 via-orange-400 to-yellow-400", glow: "shadow-amber-500/30", num: "04", bgTint: "bg-amber-50/80", borderTint: "border-amber-200/60" },
    { icon: Microscope, title: "Prescription Designer", desc: "Beautiful PDF prescriptions with your logo, digital signature, and verification QR code.", gradient: "from-teal-500 via-cyan-400 to-blue-400", glow: "shadow-teal-500/30", num: "05", bgTint: "bg-teal-50/80", borderTint: "border-teal-200/60" },
    { icon: Shield, title: "Bank-Grade Security", desc: "Role-based access control, JWT authentication, and daily automated encrypted backups.", gradient: "from-indigo-500 via-blue-400 to-sky-400", glow: "shadow-indigo-500/30", num: "06", bgTint: "bg-indigo-50/80", borderTint: "border-indigo-200/60" },
  ];

  const steps = [
    { num: "01", title: "Register your clinic", desc: "Set up your clinic profile, add staff, and configure your workflow in under 5 minutes." },
    { num: "02", title: "Add your patients", desc: "Import existing patient data or register new patients with our quick-entry forms." },
    { num: "03", title: "Start your day", desc: "Open the queue, consult patients, prescribe medicines, and bill — all from one place." },
  ];

  return (
    <div className="min-h-screen w-full bg-[#fafcff] text-slate-900 selection:bg-blue-100 selection:text-blue-800 overflow-x-hidden">

      {/* ═══ Decorative Background Blobs ═══ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main blue blob — top left */}
        <FloatingBlob
          className="absolute top-[-10%] left-[-5%] w-[750px] h-[750px] bg-gradient-to-br from-blue-300/50 to-sky-200/40 blur-[100px] rounded-full"
          delay={0}
        />
        {/* Warm amber/yellow blob — top right */}
        <FloatingBlob
          className="absolute top-[5%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-amber-200/40 to-yellow-100/30 blur-[100px] rounded-full"
          delay={2}
        />
        {/* Green/teal blob — middle */}
        <FloatingBlob
          className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/35 to-green-100/25 blur-[90px] rounded-full"
          delay={4}
        />
        {/* Soft blue blob — bottom */}
        <FloatingBlob
          className="absolute bottom-[-5%] left-[20%] w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-cyan-100/30 blur-[120px] rounded-full"
          delay={6}
        />
        {/* Warm accent blob — mid-left */}
        <FloatingBlob
          className="absolute top-[60%] left-[-8%] w-[450px] h-[450px] bg-gradient-to-br from-amber-100/35 to-orange-50/25 blur-[80px] rounded-full"
          delay={8}
        />

        {/* Subtle dot-grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 0.7px, transparent 0.7px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Radial vignette — softer edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#fafcff_100%)]" />
      </div>

      {/* ═══ Navbar ═══ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 border-b border-slate-200/60 bg-white/60 backdrop-blur-2xl sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png?v=3"
              alt="Mednivo Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              Doctor Login
            </Link>
            <Link to="/login?mode=register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:opacity-90 font-semibold rounded-full px-7 shadow-lg shadow-blue-500/20 border-0">
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ═══ Hero Section ═══ */}
      <section ref={heroRef} className="relative z-10 pt-20 sm:pt-28 pb-24 sm:pb-32 px-6 max-w-[1400px] mx-auto overflow-hidden">
        {/* Extra hero background wash */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 right-[15%] w-[350px] h-[350px] bg-amber-100/30 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] bg-blue-100/40 blur-[70px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center lg:text-left">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium mb-8"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative flex h-2 w-2"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </motion.span>
                <Sparkles className="w-4 h-4" />
                Mednivo 2.0 is now live
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight mb-6 leading-[1.1]"
              >
                <span className="text-slate-900">Less work for </span>
                <br className="hidden lg:block" />
                <span className="text-slate-900">the </span>
                <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-transparent bg-clip-text">
                  doctor.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeUp}
                className="text-lg sm:text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                The operating system for modern clinics.
                <br className="hidden md:block" />
                <span className="text-slate-400">Better Care. Smoother Clinics.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/login?mode=register">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      size="lg"
                      className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-full shadow-[0_8px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_50px_rgba(59,130,246,0.4)] transition-shadow border-0"
                    >
                      Start your clinic
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Watch demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Taglines Row */}
              <motion.div
                variants={fadeUp}
                className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-5 text-sm sm:text-base font-bold tracking-[0.2em] text-slate-400 uppercase"
              >
                <span className="hover:text-emerald-500 transition-colors cursor-default">Prescribe</span>
                <span className="text-emerald-400/50">•</span>
                <span className="hover:text-blue-500 transition-colors cursor-default">Manage</span>
                <span className="text-blue-400/50">•</span>
                <span className="hover:text-amber-500 transition-colors cursor-default">Bill</span>
                <span className="text-amber-400/50">•</span>
                <span className="hover:text-teal-500 transition-colors cursor-default">Grow</span>
              </motion.div>

              {/* Trust Signals */}
              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400"
              >
                {[
                  "No credit card required",
                  "5-minute setup",
                  "Free for solo practitioners"
                ].map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full mt-10 lg:mt-0"
          >
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden transform perspective-1000 rotate-y-[-5deg] rotate-x-[2deg]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-4 flex-1 h-6 bg-slate-100 rounded-md max-w-xs" />
              </div>
              {/* Fake Dashboard Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-[2px]">
                    <img src="/logo-icon.png" alt="Mednivo Icon" className="w-full h-full object-contain drop-shadow-sm [clip-path:inset(0_8%_0_0)]" />
                  </div>
                  <div>
                    <div className="h-4 w-48 bg-slate-200 rounded-full" />
                    <div className="h-3 w-32 bg-slate-100 rounded-full mt-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Today's Patients", val: "24", color: "bg-blue-50 border-blue-100 text-blue-600" },
                    { label: "Completed", val: "18", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
                    { label: "In Queue", val: "4", color: "bg-teal-50 border-teal-100 text-teal-600" },
                    { label: "Revenue", val: "₹18.5K", color: "bg-green-50 border-green-100 text-green-600" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                      className={`rounded-xl border p-4 ${s.color}`}
                    >
                      <p className="text-xs font-medium opacity-70">{s.label}</p>
                      <p className="text-xl font-bold mt-1">{s.val}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Patient queue rows */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 rounded-xl bg-white border border-slate-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Queue</span>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {[
                        { name: "Rahul Sharma", time: "10:00 AM", status: "Done", statusColor: "text-emerald-600 bg-emerald-50", avatar: "RS" },
                        { name: "Priya Singh", time: "10:20 AM", status: "In Consultation", statusColor: "text-blue-600 bg-blue-50", avatar: "PS" },
                        { name: "Amit Kumar", time: "10:35 AM", status: "Waiting", statusColor: "text-amber-600 bg-amber-50", avatar: "AK" },
                      ].map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + i * 0.15, duration: 0.4 }}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {p.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.time}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.statusColor}`}>
                            {p.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="rounded-xl bg-white border border-slate-100 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">This Week</span>
                      <span className="text-[10px] text-emerald-600 font-medium">+12%</span>
                    </div>
                    <div className="flex items-end gap-1.5 flex-1 min-h-[60px]">
                      {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.4 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                          className={`flex-1 rounded-t-md ${i === 5 ? 'bg-gradient-to-t from-blue-500 to-emerald-400' : 'bg-blue-100'}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <span key={i} className="text-[9px] text-slate-400 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow below the mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-gradient-to-r from-blue-400/20 via-teal-300/20 to-emerald-400/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section className="relative z-10 pt-16 pb-4 px-6 overflow-hidden">
        <div className="relative max-w-[1400px] mx-auto">
          {/* Glassmorphic Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            {/* Subtle inner gradients for the glass effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-emerald-100/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
              {statData.map((stat, i) => (
                <div key={stat.label} className="relative text-center group cursor-default">
                  {/* Vertical divider (between items, desktop only) */}
                  {i > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: "70%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                      className="hidden md:block absolute left-0 top-[15%] w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"
                    />
                  )}

                  {/* Big animated number */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-br ${stat.color} text-transparent bg-clip-text tracking-tight leading-none mb-3`}
                  >
                    <AnimatedCounter target={stat.value} decimals={stat.decimals} duration={2} />
                    <span className="text-3xl sm:text-4xl lg:text-5xl">{stat.suffix}</span>
                  </motion.div>

                  {/* Labels */}
                  <p className="text-sm sm:text-base font-bold text-slate-800 mb-1">{stat.label}</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Bento Feature Grid ═══ */}
      <section className="relative z-10 py-16 sm:py-20 px-6 overflow-hidden">
        {/* Animated ambient blobs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[-8%] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[5%] right-[-5%] w-[450px] h-[450px] bg-amber-100/35 blur-[100px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-50/30 blur-[100px] rounded-full pointer-events-none"
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="max-w-[1400px] mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-10">
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="inline-block h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full mb-6"
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
              Everything your clinic needs.
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              From queue to prescription — every workflow redesigned to be 10x faster and safer.
            </p>
          </motion.div>

          {/* ── Premium Animated Feature Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. Smart Queue — with live queue mockup */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-blue-200/60 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-500 cursor-default overflow-hidden relative"
            >
              {/* Hover gradient reveal */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-300"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Smart Queue</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5">
                  Live token tracking, real-time wait estimates, and frictionless check-ins.
                </p>
                {/* Mini live queue visualization */}
                <div className="flex items-center gap-2">
                  {[
                    { token: "T-12", status: "active" },
                    { token: "T-13", status: "waiting" },
                    { token: "T-14", status: "waiting" },
                  ].map((t, i) => (
                    <motion.div
                      key={t.token}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 300 }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${t.status === "active"
                          ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30"
                          : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}
                    >
                      {t.token}
                    </motion.div>
                  ))}
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full ml-1"
                  />
                </div>
              </div>
            </motion.div>

            {/* 2. Fast EMR — with typing cursor animation */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-emerald-200/60 hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-500 cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/40 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors duration-300"
                >
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Fast EMR</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5">
                  Write notes in seconds with AI auto-complete & customized templates.
                </p>
                {/* Typing mockup */}
                <div className="bg-slate-50/80 rounded-lg px-3 py-2.5 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-mono">Complaint:</span>
                    <span className="text-[11px] text-slate-600 font-mono">Fever 3 days</span>
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-[2px] h-3 bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. AI Voice — with waveform animation */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-violet-200/60 hover:shadow-xl hover:shadow-violet-100/40 transition-all duration-500 cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 to-violet-50/0 group-hover:from-violet-50/40 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors duration-300"
                >
                  <Zap className="w-5 h-5 text-violet-600" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">AI Voice Notes</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5">
                  Speak naturally — AI drafts clinical notes for your review.
                </p>
                {/* Voice waveform */}
                <div className="flex items-end gap-[3px] h-6">
                  {[3, 5, 8, 12, 6, 10, 14, 8, 5, 11, 7, 4, 9, 13, 6, 8, 10, 5, 7, 3].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${h}px`, `${h * 0.3}px`, `${h}px`] }}
                      transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.05 }}
                      className="w-[3px] bg-violet-300 group-hover:bg-violet-400 rounded-full transition-colors"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 4. Security — dark accent card (2-col span) */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 350, damping: 25 } }}
              className="md:col-span-2 bg-slate-900 rounded-2xl p-7 md:p-8 overflow-hidden relative cursor-default"
            >
              {/* Animated glow orbs */}
              <motion.div
                animate={{ x: [0, 15, 0], y: [0, -10, 0], opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-[-20px] top-[-20px] w-[200px] h-[200px] bg-emerald-400 blur-[80px] rounded-full pointer-events-none"
              />
              <motion.div
                animate={{ x: [0, -10, 0], y: [0, 12, 0], opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute left-[30%] bottom-[-30px] w-[150px] h-[150px] bg-blue-500 blur-[60px] rounded-full pointer-events-none"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="w-11 h-11 bg-emerald-500/15 rounded-xl border border-emerald-500/20 flex items-center justify-center mb-5">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-md">
                    Role-based access, JWT auth, encrypted backups, and real-time drug interaction checks against 50,000+ molecules.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["FDA Database", "WHO Guidelines", "HIPAA Ready"].map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 300 }}
                        className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Animated mini dashboard mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="hidden md:block w-[200px] flex-shrink-0 bg-slate-800/60 border border-slate-700/40 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-emerald-400 rounded-full"
                    />
                    <div className="text-[10px] text-slate-500 font-medium">System Active</div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "85%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                        className="h-full bg-emerald-500/60 rounded-full"
                      />
                    </div>
                    <div className="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "60%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                        className="h-full bg-blue-500/50 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                      <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    </div>
                    <div className="px-2 py-0.5 bg-blue-600/80 rounded text-[9px] text-white font-medium">Secured</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* 5. Billing — with animated price tag */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-amber-200/60 hover:shadow-xl hover:shadow-amber-100/40 transition-all duration-500 cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-amber-50/0 group-hover:from-amber-50/40 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors duration-300"
                >
                  <Receipt className="w-5 h-5 text-amber-600" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Billing & UPI</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5">
                  Generate invoices and collect UPI payments instantly.
                </p>
                {/* Mini invoice mockup */}
                <div className="flex items-center justify-between bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100/60">
                  <span className="text-[10px] font-semibold text-amber-700/70">INV-00042</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
                  >
                    ₹ Paid
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* 6. Prescription Designer */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group bg-white rounded-2xl p-7 border border-slate-100 hover:border-teal-200/60 hover:shadow-xl hover:shadow-teal-100/40 transition-all duration-500 cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/40 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors duration-300"
                >
                  <Microscope className="w-5 h-5 text-teal-600" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Prescription Designer</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5">
                  Beautiful PDFs with your clinic logo, digital signature, and QR code.
                </p>
                {/* Mini Rx card */}
                <div className="bg-gradient-to-br from-teal-50/80 to-cyan-50/60 rounded-lg px-3 py-2.5 border border-teal-100/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 bg-teal-500 rounded-[4px]" />
                    <div className="w-10 h-1 bg-teal-300 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-[3px] bg-teal-200/60 rounded-full" />
                    <div className="w-3/4 h-[3px] bg-teal-200/40 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 7. Smart Templates — 2 col with interactive tags */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 350, damping: 25 } }}
              className="md:col-span-2 group bg-gradient-to-br from-orange-50/30 via-white to-white rounded-2xl p-7 md:p-8 border border-slate-100 hover:border-orange-200/60 hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-500 cursor-default"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <motion.div
                    whileHover={{ rotate: -8 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors duration-300"
                  >
                    <Star className="w-5 h-5 text-orange-500" />
                  </motion.div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Smart Templates</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">
                    1-click protocols for Fever, Diabetes, Pain and more. Create your own in seconds.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:w-auto flex-shrink-0">
                  {["Fever", "Cold", "Diabetes", "Pain", "Infection", "Allergy"].map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.08, borderColor: "rgb(251 146 60)" }}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/40 transition-all duration-200 cursor-default shadow-sm"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>


      {/* ═══ How it Works ═══ */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-br from-blue-50/30 via-transparent to-emerald-50/20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-emerald-100/30 blur-[90px] rounded-full pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-24">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 mb-5 shadow-sm">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
              Go live in 3 simple steps
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              We've designed Mednivo so you spend zero time on setup and maximum time with patients.
            </p>
          </motion.div>

          {/* Steps container */}
          <div className="relative mt-20">
            {/* Animated Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-[2px] bg-slate-100 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 rounded-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 relative z-10">
              
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0 }}
                className="relative flex flex-col items-center group"
              >
                {/* Node */}
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center relative mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0, 0.15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} className="absolute inset-0 rounded-2xl bg-blue-500" />
                  <span className="text-2xl font-black bg-gradient-to-br from-blue-600 to-sky-500 bg-clip-text text-transparent relative z-10">01</span>
                </div>
                {/* Card */}
                <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-lg shadow-slate-100/40 w-full hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col items-center text-center">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-3">Register your clinic</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-6">Set up your clinic profile, add staff, and configure your workflow in under 5 minutes.</p>
                  
                  {/* Detailed Micro Mockup */}
                  <div className="w-full bg-slate-50/80 rounded-xl p-5 border border-slate-100 text-left">
                    <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Clinic Details</div>
                    <div className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 mb-2 shadow-sm flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-blue-500" /> City Care Clinic
                    </div>
                    <div className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 mb-4 shadow-sm flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-emerald-500" /> Dr. Amit Kumar
                    </div>
                    <div className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-[13px] font-bold text-center shadow-md shadow-blue-500/20">
                      Complete Setup &rarr;
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative flex flex-col items-center group"
              >
                {/* Node */}
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center relative mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0, 0.15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 rounded-2xl bg-teal-500" />
                  <span className="text-2xl font-black bg-gradient-to-br from-teal-600 to-emerald-500 bg-clip-text text-transparent relative z-10">02</span>
                </div>
                {/* Card */}
                <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-lg shadow-slate-100/40 w-full hover:shadow-xl hover:border-teal-100 transition-all duration-300 flex flex-col items-center text-center">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-3">Add your patients</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-6">Import existing patient data or register new patients with our quick-entry forms.</p>
                  
                  {/* Detailed Micro Mockup */}
                  <div className="w-full bg-slate-50/80 rounded-xl p-5 border border-slate-100 space-y-3 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient Directory</span>
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">+ Import</span>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">RS</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-slate-800 leading-none mb-1">Rahul Sharma</div>
                        <div className="text-[11px] text-slate-400 leading-none">Male &bull; 34 yrs</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold">AK</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-slate-800 leading-none mb-1">Anjali Kapoor</div>
                        <div className="text-[11px] text-slate-400 leading-none">Female &bull; 28 yrs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="relative flex flex-col items-center group"
              >
                {/* Node */}
                <div className="w-20 h-20 bg-slate-900 rounded-2xl shadow-xl shadow-emerald-900/20 border border-slate-800 flex items-center justify-center relative mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute inset-0 rounded-2xl bg-emerald-500" />
                  <span className="text-2xl font-black bg-gradient-to-br from-emerald-400 to-emerald-300 bg-clip-text text-transparent relative z-10">03</span>
                </div>
                {/* Card */}
                <div className="bg-slate-900 rounded-3xl p-7 border border-slate-800 shadow-xl shadow-slate-900/40 w-full hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                  <h3 className="text-[17px] font-bold text-white mb-3 relative z-10">Start your day</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed mb-6 relative z-10">Open the queue, consult patients, prescribe medicines, and bill — all from one place.</p>
                  
                  {/* Detailed Micro Mockup */}
                  <div className="w-full bg-slate-800/80 rounded-xl p-5 border border-slate-700 text-left relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Live Queue</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-[10px] text-slate-400 mb-1 font-medium">WAITING</div>
                        <div className="text-2xl font-bold text-white">12</div>
                      </div>
                      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-[10px] text-slate-400 mb-1 font-medium">COMPLETED</div>
                        <div className="text-2xl font-bold text-emerald-400">28</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-emerald-500 text-white rounded-lg py-2.5 text-[13px] font-bold text-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      Start Consultation
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ Split CTA & Guidelines Section ═══ */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left side: Guidelines & Trust */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                  Why top clinics choose us
                </h2>
                <p className="text-lg text-slate-500">
                  Built on modern infrastructure, Mednivo is designed to be the last clinic management system you'll ever need.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Shield, title: "100% Data Privacy", desc: "Your patient data is encrypted at rest and in transit. You own your data, always." },
                  { icon: Zap, title: "Zero Downtime Deployments", desc: "Our cloud infrastructure guarantees 99.9% uptime, so your clinic never stops." },
                  { icon: Headphones, title: "Dedicated Onboarding", desc: "Our team helps you migrate your existing data and trains your front desk for free." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right side: Compact CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Decorative glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[2.5rem] blur-2xl opacity-30" />

              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 sm:p-14 text-center text-white border border-slate-700/50 shadow-2xl">
                {/* Internal card glow */}
                <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                  Start your free trial
                </h3>
                <p className="text-slate-300 text-lg mb-8 max-w-sm mx-auto">
                  Experience the future of clinic management today. No credit card required.
                </p>

                <Link to="/login" className="block w-full">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full h-14 bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-2xl shadow-xl border-0 text-lg transition-all"
                    >
                      Create your account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>

                <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Takes only 2 minutes to setup
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 bg-slate-50 pt-20 pb-10 px-6 border-t border-slate-200/60 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center mb-6">
                <img
                  src="/logo.png?v=3"
                  alt="Mednivo Logo"
                  className="h-10 sm:h-12 w-auto"
                />
              </div>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-6">
                The modern operating system for independent clinics and polyclinics in India.
                Streamline your daily operations, empower your medical staff, and deliver an exceptional patient experience from booking to billing.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Security</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Contact Support</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Refund Policy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© 2026 Mednivo Technologies. All rights reserved.</p>
            <p>Made with <HeartPulse className="w-4 h-4 inline text-red-400 mx-1" /> in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
