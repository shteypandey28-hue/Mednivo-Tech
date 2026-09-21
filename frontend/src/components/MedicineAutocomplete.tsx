import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export interface MedicineResult {
  id?: string;
  sourceId?: string;
  source?: string;
  name: string;
  brandName?: string;
  genericName?: string;
  composition?: string;
  strength?: string;
  dosageForm?: string;
  route?: string;
  manufacturer?: string;
  packSize?: string;
  mrp?: string;
}

interface Props {
  value: string;
  onChange: (value: string, medicine?: MedicineResult) => void;
  placeholder?: string;
  className?: string;
}

export function MedicineAutocomplete({ value, onChange, placeholder = "Search medicine (e.g. Augmentin, Paracetamol)...", className = "" }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<MedicineResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2 && query !== value) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/medicines?q=${encodeURIComponent(query)}`);
          setResults(response.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Failed to fetch medicines", error);
          setError("Failed to fetch medicines");
        } finally {
          setIsLoading(false);
        }
      } else if (query.length <= 2) {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value, isOpen, query]);

  const handleSelect = (med: MedicineResult) => {
    setQuery(med.name);
    onChange(med.name, med);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full h-11 px-3 pl-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${className}`}
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-80 overflow-y-auto overflow-x-hidden p-2">
          {error && <div className="p-3 text-center text-sm text-red-500">{error}</div>}
          {!isLoading && results.length === 0 && !error && (
            <div className="p-4 text-center text-sm text-slate-500">No medicine found.</div>
          )}
          {results.map((med, idx) => (
            <div
              key={med.id || idx}
              onClick={() => handleSelect(med)}
              className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg border-b border-slate-50 last:border-0 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[15px] font-semibold text-slate-900 truncate">
                      {med.brandName || med.name}
                    </h4>
                    {med.dosageForm && (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">
                        {med.dosageForm}
                      </span>
                    )}
                  </div>
                  {(med.composition || med.genericName) && (
                    <p className="text-xs text-slate-500 truncate mb-1">
                      {med.composition || med.genericName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    {med.strength && <span className="font-medium text-slate-600">{med.strength}</span>}
                    {med.route && <span className="truncate flex-1">• {med.route}</span>}
                  </div>
                </div>
                {med.source === 'drugsetu' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50/50 text-blue-500 rounded border border-blue-100 whitespace-nowrap shrink-0">
                    Verified
                  </span>
                )}
              </div>
              {med.manufacturer && (
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide truncate border-t border-slate-100 pt-1.5">
                  {med.manufacturer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
