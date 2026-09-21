import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Phone, ChevronRight, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { patientsAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'MALE', phone: '', email: '', bloodGroup: '', address: '', allergies: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await patientsAPI.getAll(searchTerm);
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleRegister = async () => {
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : []
      };
      await patientsAPI.create(payload);
      setShowRegisterModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Failed to register patient', error);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-slate-500 mt-1">{patients.length} registered patients</p>
        </div>
        <Button
          onClick={() => setShowRegisterModal(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 gap-2"
        >
          <UserPlus className="w-4 h-4" /> Register Patient
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, Patient ID, or phone number..."
            className="pl-11 h-12 text-base bg-white border-slate-200 rounded-xl focus:border-emerald-300 focus:ring-emerald-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Patient List */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No patients found</h3>
            <p className="text-sm text-slate-500 mt-1">Try a different search term or register a new patient.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {patients.map((patient, idx) => (
              <Link key={patient.id} to={`/app/patients/${patient.id}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm flex-shrink-0">
                      {patient.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-emerald-600">{patient.patientUHID}</span>
                        <span>•</span>
                        <span>{patient.age}Y / {patient.gender === 'MALE' ? 'M' : 'F'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {patient.allergies && patient.allergies.length > 0 && (
                      <span className="hidden sm:inline text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 font-medium">
                        ⚠ {patient.allergies[0]}
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-1 bg-slate-50 rounded-full text-slate-600 border border-slate-100">{patient.bloodGroup || 'N/A'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowRegisterModal(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-slate-900">Register New Patient</h2>
                <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
                    <Input placeholder="Enter patient's full name" className="h-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Age *</label>
                    <Input type="number" placeholder="Age" className="h-11" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Gender *</label>
                    <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone *</label>
                    <Input placeholder="10-digit phone number" className="h-11" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <Input type="email" placeholder="Email address" className="h-11" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Blood Group</label>
                    <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Address</label>
                    <Input placeholder="Full address" className="h-11" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Allergies</label>
                    <Input placeholder="e.g. Penicillin, Sulfa drugs (comma separated)" className="h-11" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
                  <Button onClick={handleRegister} className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg gap-2">
                    <UserPlus className="w-4 h-4" /> Register Patient
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
