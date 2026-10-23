import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { medicinesAPI } from "@/lib/api";
import { Search, Pill, Tablet, Syringe, Droplet, Loader2, ChevronLeft, ChevronRight, Factory, Package } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const PAGE_SIZE = 24;

type Medicine = {
    id: string;
    name: string;
    genericName?: string | null;
    type: string;
    manufacturer?: string | null;
    packSize?: string | null;
    mrp?: number | null;
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function Medicines() {
    const [searchTerm, setSearchTerm] = useState("");
    const [query, setQuery] = useState("");
    const [form, setForm] = useState("");
    const [page, setPage] = useState(1);
    const [forms, setForms] = useState<{ form: string; count: number }[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        medicinesAPI.forms().then(({ data }) => setForms(data.slice(0, 10))).catch(() => {});
    }, []);

    // Debounce typing so we don't query on every keystroke.
    useEffect(() => {
        const t = setTimeout(() => { setQuery(searchTerm.trim()); setPage(1); }, 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        medicinesAPI.directory({ q: query || undefined, form: form || undefined, page, limit: PAGE_SIZE })
            .then(({ data }) => {
                if (cancelled) return;
                setMedicines(data.items);
                setTotal(data.total);
                setPages(Math.max(data.pages, 1));
            })
            .catch(() => !cancelled && setError("Couldn't load medicines. Please try again."))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [query, form, page]);

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'tablet': return <Tablet className="w-5 h-5" />;
            case 'capsule': return <Pill className="w-5 h-5" />;
            case 'injection': return <Syringe className="w-5 h-5" />;
            case 'syrup':
            case 'suspension':
            case 'drops': return <Droplet className="w-5 h-5" />;
            default: return <Pill className="w-5 h-5" />;
        }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Medicine Directory</h2>
                <p className="text-slate-500 mt-1">Search India's medicine catalogue by brand name or composition.</p>
            </motion.div>

            <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search e.g. Dolo 650, Augmentin, Pantoprazole..."
                            className="pl-10 text-base h-11 bg-slate-50 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl whitespace-nowrap">
                        {loading ? "Searching…" : `${total.toLocaleString("en-IN")} medicines`}
                    </div>
                </div>
                {forms.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {[{ form: "", count: 0 }, ...forms].map((f) => (
                            <button
                                key={f.form || "all"}
                                onClick={() => { setForm(f.form); setPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                                    form === f.form
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                                }`}
                            >
                                {f.form || "All"}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

            {loading && medicines.length === 0 ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity ${loading ? "opacity-50" : ""}`}>
                    {medicines.map((med) => (
                        <Card key={med.id} className="hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200 border-slate-200">
                            <CardContent className="p-5 h-full flex flex-col">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        {getIcon(med.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2" title={med.name}>{med.name}</h3>
                                        <p className="text-xs font-medium text-emerald-600 mt-0.5">{med.type}</p>
                                    </div>
                                </div>
                                {med.genericName && (
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3" title={med.genericName}>{med.genericName}</p>
                                )}
                                <div className="mt-auto space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                    {med.manufacturer && (
                                        <p className="flex items-center gap-1.5 truncate" title={med.manufacturer}>
                                            <Factory className="w-3.5 h-3.5 flex-shrink-0" /> {med.manufacturer}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                        {med.packSize && (
                                            <span className="flex items-center gap-1.5 truncate"><Package className="w-3.5 h-3.5 flex-shrink-0" /> {med.packSize}</span>
                                        )}
                                        {med.mrp != null && (
                                            <span className="font-semibold text-slate-800 whitespace-nowrap">MRP {formatINR(med.mrp)}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && medicines.length === 0 && !error && (
                <div className="text-center py-16">
                    <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">No medicines found</h3>
                    <p className="text-sm text-slate-500 mt-1">Try the brand name or the salt, e.g. "paracetamol".</p>
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1">
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </Button>
                    <span className="text-sm text-slate-500">
                        Page {page.toLocaleString("en-IN")} of {pages.toLocaleString("en-IN")}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
