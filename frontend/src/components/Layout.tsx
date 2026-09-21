import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Search, Bell, Command } from "lucide-react";

export function Layout() {
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* Main content area */}
      <div className="lg:ml-[260px] min-h-screen transition-all duration-200">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl ml-12 lg:ml-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 w-full h-10 px-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-white transition-all text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search patients, medicines, prescriptions...</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  <Command className="w-3 h-3" /> K
                </div>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-4">
              {/* Notifications */}
              <button className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white transition-colors">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
              </button>

              {/* User */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'M'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                placeholder="Search patients, medicines, invoices..."
                className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
              />
              <kbd className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">ESC</kbd>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-500 text-center py-8">Start typing to search across all records...</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
