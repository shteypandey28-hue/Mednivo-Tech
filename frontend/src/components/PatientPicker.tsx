import { useEffect, useRef, useState } from "react";
import { Loader2, Search, UserCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { patientsAPI } from "@/lib/api";
import { usePrescriptionStore } from "@/store/prescriptionStore";

/**
 * Pick an existing patient (search by name / phone / UHID) or type details for a new one.
 * A new patient is registered when the prescription is saved.
 */
export function PatientPicker() {
  const { patient, setPatient } = usePrescriptionStore();
  const [query, setQuery] = useState(patient.name || "");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patient.id || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await patientsAPI.getAll(query.trim());
        setResults(res.data.slice(0, 6));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, patient.id]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (p: any) => {
    setPatient({
      id: p.id,
      patientUHID: p.patientUHID,
      phone: p.phone || "",
      name: p.name,
      age: p.age ?? "",
      gender: p.gender ? p.gender.charAt(0) + p.gender.slice(1).toLowerCase() : "Male",
      weight: p.weight ? String(p.weight) : "",
    });
    setQuery(p.name);
    setOpen(false);
  };

  const clear = () => {
    setPatient({ id: undefined, patientUHID: undefined, phone: "", name: "", age: "", gender: "Male", weight: "" });
    setQuery("");
  };

  if (patient.id) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {[patient.patientUHID, patient.age && `${patient.age} yrs`, patient.gender, patient.phone].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <button onClick={clear} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white" aria-label="Change patient">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search patient by name, phone or ID — or type a new name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPatient({ name: e.target.value });
          }}
          onFocus={() => results.length && setOpen(true)}
          className="h-11 bg-slate-50 pl-9"
        />
        {loading && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-slate-400" />}
        {open && results.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => choose(p)}
                className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 border-b border-slate-100 last:border-0"
              >
                <p className="text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {[p.patientUHID, p.age && `${p.age} yrs`, p.phone].filter(Boolean).join(" · ")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {query.trim().length >= 2 && (
        <>
          <p className="text-xs text-slate-500">New patient — they'll be registered when you save.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Age (e.g. 32)"
              value={patient.age}
              onChange={(e) => setPatient({ age: e.target.value })}
              className="h-11 bg-slate-50"
              inputMode="numeric"
            />
            <select
              className="flex h-11 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-600"
              value={patient.gender}
              onChange={(e) => setPatient({ gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            placeholder="Phone (optional)"
            value={patient.phone || ""}
            onChange={(e) => setPatient({ phone: e.target.value })}
            className="h-11 bg-slate-50"
            inputMode="tel"
          />
        </>
      )}
    </div>
  );
}
