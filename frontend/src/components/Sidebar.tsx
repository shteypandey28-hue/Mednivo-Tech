import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, Users, CalendarDays, ListOrdered,
  FileText, Pill, Receipt, BarChart3, Settings, LogOut,
  Stethoscope, ChevronLeft, ChevronRight, Menu, X,
  Activity, Search
} from "lucide-react";

const doctorNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: Users, label: "Patients", href: "/app/patients" },
  { icon: CalendarDays, label: "Appointments", href: "/app/appointments" },
  { icon: ListOrdered, label: "Queue", href: "/app/queue" },
  { icon: FileText, label: "Prescriptions", href: "/app/prescriptions" },
  { icon: Pill, label: "Medicines", href: "/app/medicines" },
  { icon: Receipt, label: "Billing", href: "/app/billing" },
  { icon: BarChart3, label: "Reports", href: "/app/reports" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

const receptionistNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app/reception" },
  { icon: Users, label: "Patients", href: "/app/patients" },
  { icon: CalendarDays, label: "Appointments", href: "/app/appointments" },
  { icon: ListOrdered, label: "Queue", href: "/app/queue" },
  { icon: Receipt, label: "Billing", href: "/app/billing" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'RECEPTIONIST' ? receptionistNav : doctorNav;

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className={cn("p-5 flex items-center", collapsed ? "justify-center" : "gap-3")}>
        {collapsed ? (
          <img src="/logo-icon.png" alt="Mednivo Icon" className="h-10 w-auto object-contain transition-all duration-300 mx-auto [clip-path:inset(0_8%_0_0)]" />
        ) : (
          <img src="/logo-white.png" alt="Mednivo Logo" className="h-14 max-w-full object-contain transition-all duration-300" />
        )}
      </div>

      {/* User Info */}
      {user && !collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mb-4 p-3 bg-white/5 rounded-xl border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/app' && item.href !== '/app/reception' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white shadow-lg shadow-emerald-900/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 rounded-xl"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10 flex-shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
              {!collapsed && (
                <span className="font-medium text-sm relative z-10">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle + Logout */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 h-screen w-[260px] bg-slate-950 border-r border-white/5 z-50"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:block h-screen bg-slate-950 border-r border-white/5 fixed left-0 top-0 z-30"
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
