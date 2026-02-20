import { Pill, AlertCircle, Info, Clock, AlertTriangle, UserRound, BookOpen, ShieldCheck, FileText, Apple } from "lucide-react";
import { motion } from "framer-motion";

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    explanation: string;
    purpose: string;
    sideEffects: string;
    restrictions: string;
    ageDosage: string;
    schedule: string[];
    raw_ocr?: string;
    confidence?: number;
    fdaVerified?: boolean;
    isSafe?: boolean;
    dosageWarning?: string;
    genericName?: string;
    dietaryPlan?: string;
    homeRemedies?: string;
}

interface MedicineDetailsProps {
    medicines: Medicine[];
}

export default function MedicineDetails({ medicines }: MedicineDetailsProps) {
    return (
        <div className="grid grid-cols-1 gap-8 p-6">
            {medicines.map((med, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden group"
                >
                    {/* Decorative Background Icon */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Pill className="w-48 h-48 -rotate-12" />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{med.name}</h3>
                                    {med.fdaVerified ? (
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" />
                                            FDA Verified
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-zinc-100">
                                            AI Identified
                                        </span>
                                    )}
                                    {med.isSafe === false && (
                                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-1.5 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" />
                                            Dosage High
                                        </span>
                                    )}
                                </div>
                                {med.genericName && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Generic: {med.genericName}</p>
                                )}
                                <p className="text-zinc-500 text-lg font-medium">{med.explanation}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-semibold text-zinc-600">{med.frequency}</span>
                                </div>
                                <div className="px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-semibold text-zinc-600">{med.duration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Raw Visual Evidence (Literal Transcription) */}
                        {med.raw_ocr && (
                            <div className="mb-8 p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <FileText className="w-24 h-24" />
                                </div>
                                <div className="relative space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Visual Evidence</span>
                                        </div>
                                        {med.confidence !== undefined && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                                                <div className={`w-1.5 h-1.5 rounded-full ${med.confidence > 85 ? 'bg-emerald-500' : med.confidence > 70 ? 'bg-orange-500' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                                                    Match: {med.confidence}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-mono text-white tracking-widest leading-none drop-shadow-sm">
                                            {med.raw_ocr}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                                            Literal characters decoded from ink evidence
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Detailed Purpose */}
                            <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 space-y-3">
                                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    <h4>Medical Purpose</h4>
                                </div>
                                <p className="text-sm text-zinc-600 leading-relaxed">{med.purpose}</p>
                            </div>

                            {/* Side Effects */}
                            <div className="bg-orange-50/30 rounded-3xl p-6 border border-orange-100/50 space-y-3">
                                <div className="flex items-center gap-2 text-orange-900 font-bold">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    <h4>Side Effects</h4>
                                </div>
                                <p className="text-sm text-orange-800/80 leading-relaxed">{med.sideEffects}</p>
                            </div>

                            {/* Safety Restrictions */}
                            <div className="bg-red-50/30 rounded-3xl p-6 border border-red-100/50 space-y-3 text-red-900">
                                <div className="flex items-center gap-2 font-bold">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <h4>Restricted Patients</h4>
                                </div>
                                <p className="text-sm text-red-800/80 leading-relaxed">
                                    {med.restrictions}
                                </p>
                            </div>

                            {/* Dietary Advice */}
                            <div className="bg-green-50/30 rounded-3xl p-6 border border-green-100/50 space-y-3">
                                <div className="flex items-center gap-2 text-green-900 font-bold">
                                    <Apple className="w-5 h-5 text-green-600" />
                                    <h4>Dietary Advice</h4>
                                </div>
                                <p className="text-sm text-green-800/80 leading-relaxed italic">
                                    "{med.dietaryPlan || "No specific dietary restrictions."}"
                                </p>
                            </div>

                            {/* Home Remedies */}
                            <div className="bg-amber-50/30 rounded-3xl p-6 border border-amber-100/50 space-y-3">
                                <div className="flex items-center gap-2 text-amber-900 font-bold">
                                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                                    <h4>Home Remedies</h4>
                                </div>
                                <p className="text-sm text-amber-800/80 leading-relaxed italic">
                                    "{med.homeRemedies || "Gentle rest recommended."}"
                                </p>
                            </div>
                        </div>

                        {/* Phase 2: Dosage Warning Alert */}
                        {med.isSafe === false && med.dosageWarning && (
                            <div className="p-6 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-200 border-4 border-white flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h5 className="font-black uppercase tracking-widest text-xs">Critical Dosage Alert</h5>
                                    <p className="text-sm font-bold leading-relaxed">{med.dosageWarning}</p>
                                    <p className="text-[10px] opacity-80 pt-2 font-medium">Please re-scan the prescription or contact your doctor to verify the "mg" dosage before administration.</p>
                                </div>
                            </div>
                        )}

                        {/* Age-Based Dosage Footer */}
                        <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex items-center gap-2 text-zinc-900 font-bold min-w-fit mt-3">
                                <UserRound className="w-5 h-5 text-zinc-400" />
                                <span className="text-sm uppercase tracking-widest">Recommended Dosage</span>
                            </div>
                            <div className="bg-blue-600/5 text-blue-700 px-6 py-4 rounded-2xl border border-blue-100/50 text-sm font-medium w-full">
                                {typeof med.ageDosage === 'object' && med.ageDosage !== null ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {Object.entries(med.ageDosage).map(([age, dose]) => (
                                            <div key={age} className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">{age}</span>
                                                <p className="text-blue-900">{String(dose)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="italic">{String(med.ageDosage)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
