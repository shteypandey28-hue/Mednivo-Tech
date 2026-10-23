import { create } from 'zustand';

interface Patient {
    id?: string;
    patientUHID?: string;
    phone?: string;
    name: string;
    age: number | string;
    gender: string;
    weight?: string;
}

interface Medicine {
    id: string;
    sourceId?: string;
    source?: string;
    name: string;
    brandName?: string;
    genericName?: string;
    composition?: string;
    strength?: string;
    dosageForm?: string;
    route?: string;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
}

interface PrescriptionState {
    patient: Patient;
    medicines: Medicine[];
    diagnosis: string;
    advice: string;
    notes: string;
    consultationId?: string;
    searchQuery: string;
    template: 'default' | 'modern' | 'classic';

    setPatient: (patient: Partial<Patient>) => void;
    setDiagnosis: (diagnosis: string) => void;
    setAdvice: (advice: string) => void;
    setNotes: (notes: string) => void;
    setConsultationId: (id?: string) => void;
    addMedicine: (medicine: Medicine) => void;
    removeMedicine: (id: string) => void;
    updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
    setSearchQuery: (query: string) => void;
    setTemplate: (template: 'default' | 'modern' | 'classic') => void;
    resetPrescription: () => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
    patient: { name: '', age: '', gender: 'Male' },
    medicines: [],
    diagnosis: '',
    advice: '',
    notes: '',
    consultationId: undefined,
    searchQuery: '',
    template: 'default',

    setPatient: (patient) => set((state) => ({ patient: { ...state.patient, ...patient } })),
    setDiagnosis: (diagnosis) => set({ diagnosis }),
    setAdvice: (advice) => set({ advice }),
    setNotes: (notes) => set({ notes }),
    setConsultationId: (consultationId) => set({ consultationId }),

    addMedicine: (medicine) => set((state) => ({
        medicines: [...state.medicines, medicine],
        searchQuery: '' // Reset search after adding
    })),

    removeMedicine: (id) => set((state) => ({
        medicines: state.medicines.filter((m) => m.id !== id)
    })),

    updateMedicine: (id, updated) => set((state) => ({
        medicines: state.medicines.map((m) => m.id === id ? { ...m, ...updated } : m)
    })),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setTemplate: (template) => set({ template }),

    resetPrescription: () => set({
        patient: { name: '', age: '', gender: 'Male' },
        medicines: [],
        diagnosis: '',
        advice: '',
        notes: '',
        consultationId: undefined,
        searchQuery: ''
    })
}));
