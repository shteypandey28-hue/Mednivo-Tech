import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin, AlertTriangle, Stethoscope, FileText, Calendar, DollarSign, FlaskConical, FolderOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: 'overview', label: 'Overview', icon: Stethoscope },
  { id: 'consultations', label: 'Consultations', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'investigations', label: 'Investigations', icon: FlaskConical },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'followups', label: 'Follow-ups', icon: Clock },
];

// Demo patient data
const patient = {
  name: 'Rahul Sharma', patientUHID: 'MED-000124', age: 32, gender: 'MALE',
  phone: '9876543210', email: 'rahul@email.com', address: '42 MG Road, Pune, Maharashtra 411001',
  bloodGroup: 'B+', allergies: ['Penicillin', 'Sulfa drugs'], existingConditions: ['Hypertension'],
  currentMedications: ['Amlodipine 5mg', 'Metformin 500mg'], weight: 78, height: 175,
};

export function PatientProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/patients" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <span className="text-xs font-mono px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">{patient.patientUHID}</span>
          </div>
          <p className="text-sm text-slate-500">{patient.age}Y / {patient.gender === 'MALE' ? 'Male' : 'Female'} • {patient.bloodGroup}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Phone className="w-4 h-4" /> Call</Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 gap-2"><Stethoscope className="w-4 h-4" /> Start Consultation</Button>
        </div>
      </div>

      {/* Patient Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" /> {patient.phone}</div>
          <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" /> {patient.email}</div>
          <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" /> <span className="truncate">{patient.address}</span></div>
          <div className="text-slate-600">Wt: {patient.weight}kg • Ht: {patient.height}cm</div>
        </div>
        {patient.allergies.length > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">Allergies: {patient.allergies.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Current Conditions</h3>
              <div className="space-y-2">
                {patient.existingConditions.map((c, i) => (
                  <div key={i} className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800">{c}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Current Medications</h3>
              <div className="space-y-2">
                {patient.currentMedications.map((m, i) => (
                  <div key={i} className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">{m}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {[
              { date: 'Sep 7, 2026', doctor: 'Dr. Arjun Mehta', complaint: 'Fever and body ache', diagnosis: 'Viral Fever' },
              { date: 'Aug 20, 2026', doctor: 'Dr. Arjun Mehta', complaint: 'Routine checkup', diagnosis: 'Hypertension - Controlled' },
            ].map((c, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{c.complaint}</p>
                    <p className="text-sm text-slate-500 mt-1">Diagnosis: {c.diagnosis}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{c.date}</p>
                    <p className="text-xs">{c.doctor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab !== 'overview' && activeTab !== 'consultations' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900">No {activeTab} yet</h3>
            <p className="text-sm text-slate-500 mt-1">Records will appear here as they are created.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
