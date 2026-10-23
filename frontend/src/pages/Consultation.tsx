import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, ClipboardList, Pill, Microscope, FileText, 
  Stethoscope, Clock, Check, Mic, Save, FileSignature
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { patientsAPI, consultationsAPI, queueAPI, aiAPI } from "@/lib/api";
import { Loader2, Sparkles } from "lucide-react";
import { usePrescriptionStore } from "@/store/prescriptionStore";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Consultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('vitals');
  
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [vitals, setVitals] = useState({
    temperature: '', systolic: '', diastolic: '', pulse: '', spo2: '', weight: '', height: ''
  });
  const [notes, setNotes] = useState({ complaints: '', examination: '', advice: '' });
  const [diagnosis, setDiagnosis] = useState('');

  useEffect(() => {
    const initConsultation = async () => {
      try {
        if (!id) return;
        setLoading(true);
        // Fetch patient
        const pRes = await patientsAPI.getOne(id);
        setPatient(pRes.data);
        
        // Start consultation in backend
        const cRes = await consultationsAPI.create({ patientId: id });
        setConsultationId(cRes.data.id);

        // Fetch AI Summary
        try {
          const summaryRes = await aiAPI.summarizeHistory(id);
          setAiSummary(summaryRes.data);
        } catch (e) {
          console.error("AI Summary error", e);
        }
      } catch (error) {
        console.error("Failed to initialize consultation", error);
      } finally {
        setLoading(false);
      }
    };
    initConsultation();
  }, [id]);

  const num = (v: string) => (v === '' || v == null ? undefined : Number(v));

  // Persist everything the doctor entered before closing the consultation.
  const saveConsultation = async () => {
    if (!consultationId) return;
    await consultationsAPI.update(consultationId, {
      chiefComplaint: notes.complaints || undefined,
      examination: notes.examination || undefined,
      advice: notes.advice || undefined,
    });
    const v = {
      temperature: num(vitals.temperature), systolicBP: num(vitals.systolic), diastolicBP: num(vitals.diastolic),
      pulse: num(vitals.pulse), spo2: num(vitals.spo2), weight: num(vitals.weight), height: num(vitals.height),
    };
    if (Object.values(v).some((x) => x !== undefined && !Number.isNaN(x))) {
      await consultationsAPI.addVitals(consultationId, v);
    }
    if (diagnosis.trim()) {
      await consultationsAPI.addDiagnosis(consultationId, { name: diagnosis.trim() });
    }
  };

  const handleComplete = async () => {
    if (!consultationId || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveConsultation();
      await consultationsAPI.complete(consultationId);
      navigate('/app/queue');
    } catch (error) {
      console.error("Failed to complete consultation", error);
      setSaveError("Couldn't save this consultation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const sections = [
    { id: 'vitals', label: 'Vitals & BMI', icon: Activity },
    { id: 'complaints', label: 'Chief Complaints', icon: ClipboardList },
    { id: 'examination', label: 'Examination', icon: Stethoscope },
    { id: 'diagnosis', label: 'Diagnosis', icon: Microscope },
    { id: 'prescription', label: 'Prescription', icon: Pill },
    { id: 'advice', label: 'Advice & Follow-up', icon: FileText },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/app/queue" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{patient?.name || 'Loading...'}</h1>
              <span className="text-xs font-mono px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">{patient?.patientUHID || ''}</span>
            </div>
            <p className="text-sm text-slate-500">{patient?.age}Y / {patient?.gender} • In consultation</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-slate-600 bg-white">
            <Clock className="w-4 h-4" /> History
          </Button>
          {saveError && <span className="self-center text-sm text-red-600">{saveError}</span>}
          <button onClick={handleComplete} disabled={saving || !consultationId} className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {saving ? 'Saving…' : 'Complete Consultation'}
          </button>
        </div>
      </motion.div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar (Sections) */}
        <motion.div variants={item} className="w-64 flex flex-col gap-2 flex-shrink-0 overflow-y-auto pr-2 scrollbar-hide">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 w-full p-3.5 rounded-xl font-medium transition-all text-left ${
                activeSection === section.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-emerald-100' : 'text-slate-400'}`} />
              {section.label}
              {activeSection === section.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}

          {/* AI Voice Assistant Button */}
          <div className="mt-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">AI Assistant</div>
            <button
              disabled
              title="Voice notes are coming soon"
              className="w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
                <Mic className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <span className="font-semibold block">Voice to Notes</span>
                <span className="text-xs opacity-70 mt-1">Coming soon</span>
              </div>
            </button>
          </div>

          {/* AI Summary Sidebar Card */}
          {aiSummary && (
            <div className="mt-4 p-4 rounded-xl border border-violet-100 bg-violet-50/50">
              <div className="flex items-center gap-2 mb-2 text-violet-700 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> AI Summary
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {aiSummary.summary}
              </p>
              {aiSummary.keyPoints && (
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  {aiSummary.keyPoints.map((kp: string, idx: number) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Content Area */}
        <motion.div variants={item} className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Save className="w-3 h-3" /> Auto-saved just now
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'vitals' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Temperature (°F)</label>
                  <Input placeholder="98.6" className="h-12 text-lg" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Blood Pressure</label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="120" className="h-12 text-lg text-center" value={vitals.systolic} onChange={e => setVitals({...vitals, systolic: e.target.value})} />
                    <span className="text-slate-400 font-bold">/</span>
                    <Input placeholder="80" className="h-12 text-lg text-center" value={vitals.diastolic} onChange={e => setVitals({...vitals, diastolic: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Pulse (bpm)</label>
                  <Input placeholder="72" className="h-12 text-lg" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">SpO2 (%)</label>
                  <Input placeholder="98" className="h-12 text-lg" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Weight (kg)</label>
                  <Input placeholder="65" className="h-12 text-lg" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Height (cm)</label>
                  <Input placeholder="165" className="h-12 text-lg" value={vitals.height} onChange={e => setVitals({...vitals, height: e.target.value})} />
                </div>
                <div className="col-span-full mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Calculated BMI</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {(vitals.weight && vitals.height) ? (parseFloat(vitals.weight) / ((parseFloat(vitals.height)/100) * (parseFloat(vitals.height)/100))).toFixed(1) : '--'}
                      {vitals.weight && vitals.height && <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded ml-2">Calc</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'complaints' && (
              <div className="h-full flex flex-col">
                <textarea 
                  className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
                  placeholder="Type patient's chief complaints here..."
                  value={notes.complaints}
                  onChange={e => setNotes({...notes, complaints: e.target.value})}
                ></textarea>
              </div>
            )}

            {activeSection === 'prescription' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <FileSignature className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Create Prescription</h3>
                <p className="text-slate-500 max-w-md mb-8">Use the full-screen prescription editor to search medicines, add dosages, and generate a printable PDF.</p>
                <Link to="/app/prescriptions/new" onClick={() => {
                  usePrescriptionStore.getState().resetPrescription();
                  usePrescriptionStore.getState().setConsultationId(consultationId ?? undefined);
                  usePrescriptionStore.getState().setPatient({
                    id: patient?.id,
                    patientUHID: patient?.patientUHID,
                    name: patient?.name || '',
                    age: patient?.age || '',
                    gender: patient?.gender || 'Male',
                    weight: vitals.weight || ''
                  });
                  usePrescriptionStore.getState().setDiagnosis(diagnosis);
                  usePrescriptionStore.getState().setAdvice(notes.advice);
                }}>
                  <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                    Open Prescription Editor
                  </Button>
                </Link>
              </div>
            )}
            
            {['examination', 'diagnosis', 'advice'].includes(activeSection) && (
               <div className="h-full flex flex-col">
               <textarea 
                 className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
                 placeholder={`Type ${activeSection} notes here...`}
                 value={activeSection === 'diagnosis' ? diagnosis : activeSection === 'examination' ? notes.examination : notes.advice}
                 onChange={e => {
                   if (activeSection === 'diagnosis') setDiagnosis(e.target.value);
                   else if (activeSection === 'examination') setNotes({...notes, examination: e.target.value});
                   else if (activeSection === 'advice') setNotes({...notes, advice: e.target.value});
                 }}
               ></textarea>
             </div>
            )}

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
