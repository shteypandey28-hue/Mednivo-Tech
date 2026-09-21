import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Printer, UserPlus, Pill, Beaker, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicineAutocomplete } from "@/components/MedicineAutocomplete";
import { MedicineList } from "@/components/MedicineList";
import { PrescriptionPreview, AutoScaledPreview } from "@/components/PrescriptionPreview";
import { usePrescriptionStore } from "@/store/prescriptionStore";
import api from "@/lib/api";

export function CreatePrescription() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [template, setTemplate] = useState<any>(null);

  const { 
    patient, setPatient,
    medicines, addMedicine, removeMedicine, updateMedicine,
    diagnosis, setDiagnosis,
    notes, setNotes,
    reset 
  } = usePrescriptionStore();

  useEffect(() => {
    // Fetch default template for preview layout editing
    const fetchDefaultTemplate = async () => {
        try {
            const { data } = await api.get('/clinic/print-templates');
            const defaultTpl = data.find((t: any) => t.isDefault) || data[0];
            if (defaultTpl) setTemplate(defaultTpl);
        } catch (e) {
            console.error("Failed to fetch templates", e);
        }
    };
    fetchDefaultTemplate();
  }, []);

  const handleSaveLayout = async () => {
    if (!template) return;
    try {
      await api.patch(`/clinic/print-templates/${template.id}`, {
        margins: template.margins
      });
      setIsEditingLayout(false);
      // Show some temporary success state if needed
    } catch (e) {
      console.error("Failed to save layout", e);
    }
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      resetPrescription();
      navigate('/app/prescriptions');
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Prescription</h1>
            <p className="text-sm text-slate-500">Create and print a digital prescription.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Preview PDF
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col lg:flex-row overflow-hidden"
            >
              {/* Left Column - Patient & Details */}
              <div className="w-full lg:w-[400px] border-r border-slate-100 flex flex-col overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-600" /> Patient Details</h3>
                    <div className="space-y-3">
                      <Input 
                        placeholder="Patient Name" 
                        onChange={(e) => setPatient({ name: e.target.value })}
                        className="h-11 bg-slate-50"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Age (e.g. 32)" 
                          onChange={(e) => setPatient({ age: e.target.value })}
                          className="h-11 bg-slate-50"
                        />
                        <select 
                          className="flex h-11 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-600"
                          onChange={(e) => setPatient({ gender: e.target.value })}
                        >
                          <option value="">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-slate-100" />
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Beaker className="w-4 h-4 text-emerald-600" /> Diagnosis</h3>
                    <Input 
                      placeholder="e.g. Viral Fever, Hypertension..." 
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="h-11 bg-slate-50"
                    />
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" /> Advice & Notes</h3>
                    <div className="space-y-3">
                      <textarea 
                        className="w-full h-24 p-3 bg-slate-50 border border-input rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                        placeholder="General advice..."
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                      <textarea 
                        className="w-full h-24 p-3 bg-slate-50 border border-input rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                        placeholder="Clinical notes (optional)..."
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Medicines */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                <div className="p-6 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-emerald-600" /> Prescribe Medicines</h3>
                  <MedicineAutocomplete 
                    value=""
                    onChange={(val, med) => {
                      if (med) {
                        let defaultDosage = med.strength || '1';
                        let defaultFreq = '1-0-1';
                        let defaultDuration = '5 days';
                        let defaultInstruction = 'After Food';
                        
                        const form = (med.dosageForm || '').toLowerCase();
                        if (form.includes('syrup') || form.includes('suspension')) {
                          defaultDosage = '5 ml';
                        } else if (form.includes('cream') || form.includes('ointment') || form.includes('gel')) {
                          defaultDosage = 'Apply locally';
                          defaultInstruction = 'Clean area before applying';
                        } else if (form.includes('drop')) {
                          defaultDosage = '2 drops';
                        } else if (form.includes('inhaler') || form.includes('spray')) {
                          defaultDosage = '2 puffs';
                        } else if (form.includes('tablet') || form.includes('capsule')) {
                          defaultDosage = '1 Tab';
                        }

                        usePrescriptionStore.getState().addMedicine({
                          id: med.id || Math.random().toString(),
                          sourceId: med.sourceId,
                          source: med.source,
                          name: med.brandName || med.name,
                          genericName: med.genericName,
                          composition: med.composition,
                          strength: med.strength,
                          dosageForm: med.dosageForm,
                          route: med.route,
                          dosage: defaultDosage,
                          frequency: defaultFreq,
                          duration: defaultDuration,
                          instruction: defaultInstruction
                        });
                      }
                    }}
                    placeholder="Search medicine (e.g. Augmentin, Paracetamol)..." 
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <MedicineList />
                </div>
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                  <Button variant="outline">Clear All</Button>
                  <Button onClick={() => setActiveTab('preview')} className="bg-slate-900 text-white hover:bg-slate-800">
                    Preview Prescription
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col lg:flex-row bg-slate-100 min-h-0 overflow-hidden"
            >
              {/* Preview Area (Left/Center) */}
              <div className="flex-1 p-4 lg:p-8 flex items-center justify-center overflow-hidden">
                {/* Constrain by height so it fits on screen, preserving A4 aspect ratio */}
                <div className={`h-full w-full max-h-[85vh] shadow-2xl rounded-sm overflow-hidden bg-white relative ${isEditingLayout ? 'ring-4 ring-emerald-500' : ''}`}>
                  {isEditingLayout && (
                    <div className="absolute top-4 left-4 z-50 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                      DRAG BLOCKS TO POSITION
                    </div>
                  )}
                  <AutoScaledPreview 
                    overrideTemplate={template} 
                    onUpdateBlocks={isEditingLayout ? (blocks: any) => {
                      setTemplate({ ...template, margins: { ...template.margins, blocks } });
                    } : undefined}
                  />
                </div>
              </div>
              
              {/* Actions Sidebar (Right) */}
              <div className="w-full lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col gap-4 flex-shrink-0 z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-lg">Final Steps</h3>
                  <p className="text-sm text-slate-500 mb-4">Review layout before finishing.</p>
                </div>

                {/* Layout Editing Toggle */}
                {template && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                    <p className="text-xs text-slate-500 font-semibold mb-2">Layout Settings</p>
                    {isEditingLayout ? (
                      <Button onClick={handleSaveLayout} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm">
                        Save Layout Changes
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditingLayout(true)} variant="outline" className="w-full h-9 text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        Customize Drag & Drop Layout
                      </Button>
                    )}
                  </div>
                )}
                
                <Button onClick={handleSave} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white gap-2 text-base shadow-md hover:shadow-lg transition-all" disabled={isEditingLayout}>
                  <Save className="w-5 h-5" /> Save Prescription
                </Button>
                <Button variant="outline" className="w-full h-12 gap-2 text-slate-700 bg-slate-50 hover:bg-slate-100">
                  <Printer className="w-5 h-5" /> Print
                </Button>
                
                <hr className="my-2 border-slate-100" />
                
                <Button variant="outline" onClick={() => setActiveTab('edit')} className="w-full h-12 text-slate-600">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editor
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Prescription Saved!</h3>
                <p className="text-slate-500">Redirecting to prescriptions list...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
