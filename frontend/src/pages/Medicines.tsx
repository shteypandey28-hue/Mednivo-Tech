import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MEDICINES_MOCK } from "@/lib/mockData";
import { Plus, Search, Pill, Tablet, Trash2, Edit, Syringe, Droplet } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function Medicines() {
    const [searchTerm, setSearchTerm] = useState("");
    const [medicines, setMedicines] = useState(MEDICINES_MOCK);

    const filteredMedicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'tablet': return <Tablet className="w-6 h-6" />;
            case 'capsule': return <Pill className="w-6 h-6" />;
            case 'injection': return <Syringe className="w-6 h-6" />;
            case 'syrup': return <Droplet className="w-6 h-6" />;
            default: return <Pill className="w-6 h-6" />;
        }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Medicine Directory</h2>
                    <p className="text-slate-500 mt-1">Manage your pharmacy database and inventory.</p>
                </div>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg gap-2">
                    <Plus className="w-4 h-4" /> Add New Medicine
                </Button>
            </motion.div>

            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search medicines by name, generic, or brand..."
                        className="pl-10 text-base h-11 bg-slate-50 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl whitespace-nowrap">
                    {filteredMedicines.length} items found
                </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedicines.map((med, idx) => (
                    <motion.div 
                        key={med.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                    >
                        <Card className="hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group border-slate-200">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                                        {getIcon(med.type)}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 truncate" title={med.name}>{med.name}</h3>
                                    <p className="text-sm font-medium text-emerald-600 mb-4">{med.type}</p>

                                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 pt-3">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Dose</span>
                                            <span className="font-semibold text-slate-700">{med.defaultDosage}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</span>
                                            <span className="font-semibold text-slate-700">{med.defaultFreq}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
