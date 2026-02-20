"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pill, Activity, Apple, FileText, ChevronRight, ExternalLink, Sparkles, Info, ShieldCheck, AlertCircle } from "lucide-react";

export default function HealthResources({
    onDrugInfoClick,
    onEmergencyClick,
    onSymptomClick,
    onDietClick,
    onArticleClick,
    activeMedication
}: {
    onDrugInfoClick?: () => void,
    onEmergencyClick?: () => void,
    onSymptomClick?: () => void,
    onDietClick?: () => void,
    onArticleClick?: () => void,
    activeMedication?: any
}) {
    const resources = [
        { title: "Drug Information", desc: "Detailed breakdown of 10k+ meds", icon: Pill, color: "bg-blue-50 text-blue-600", onClick: onDrugInfoClick },
        { title: "Symptom Checker", desc: "AI-driven wellness analysis", icon: Activity, color: "bg-purple-50 text-purple-600", onClick: onSymptomClick },
        { title: "Diet & Nutrition", desc: "Patient-specific diet plans", icon: Apple, color: "bg-green-50 text-green-600", onClick: onDietClick },
        { title: "Health Articles", desc: "Verified medical research", icon: FileText, color: "bg-amber-50 text-amber-600", onClick: onArticleClick },
    ];

    return (
        <aside className="w-80 bg-zinc-50 border-l border-zinc-100 p-8 space-y-10 h-full sticky top-0 overflow-y-auto hidden xl:block">
            {/* Live Medical Analysis Area */}
            <AnimatePresence>
                {activeMedication && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="p-6 bg-white rounded-[2.5rem] border-2 border-blue-500/10 shadow-xl shadow-blue-900/5 space-y-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-12 h-12 text-blue-500 animate-pulse" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-blue-50">
                                <Pill className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tighter">Live Analysis</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-blink" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Bot Sync Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-zinc-900">{activeMedication.name}</h4>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest leading-none">{activeMedication.purpose}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2 group-hover:bg-blue-50/30 transition-colors">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Apple className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Dietary Advice</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-700 leading-relaxed italic">
                                        "{activeMedication.dietaryPlan || "No specific dietary restrictions."}"
                                    </p>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2 group-hover:bg-amber-50/30 transition-colors">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Home Remedy</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-700 leading-relaxed italic">
                                        "{activeMedication.homeRemedies || "Gentle rest recommended."}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={onDrugInfoClick}
                                    className="py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-1"
                                >
                                    <Info className="w-3 h-3" />
                                    Details
                                </button>
                                <button
                                    onClick={onDietClick}
                                    className="py-2.5 bg-green-600 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-1"
                                >
                                    <Apple className="w-3 h-3" />
                                    Diet
                                </button>
                            </div>

                            <button
                                onClick={onDrugInfoClick}
                                className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                            >
                                Full Analysis Report
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Health Resources</h3>
                <div className="space-y-4">
                    {resources.map((res, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 4 }}
                            onClick={res.onClick}
                            className={`p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${res.onClick ? 'active:scale-95' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${res.color}`}>
                                    <res.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-zinc-900 mb-1">{res.title}</h4>
                                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{res.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 mt-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div
                onClick={onEmergencyClick}
                className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-100 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                </div>
                <h4 className="font-bold">Medical Emergency?</h4>
                <p className="text-xs text-blue-50 opacity-80 leading-relaxed">
                    If you are experiencing a medical emergency, please contact your local emergency services immediately (911).
                </p>
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    Emergency Protocols
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900">AI Health Hub</h4>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Access our dedicated vision scanner and clinical resource hub for advanced medical analysis.
                </p>
                <a
                    href={process.env.NEXT_PUBLIC_STREAMLIT_URL || "https://share.streamlit.io/"}
                    target="_blank"
                    className="w-full py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                    Open Health Hub
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-900 mb-4">Daily Wellness Tip</h4>
                <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    "Drinking a glass of water before every meal helps in better digestion and metabolic regulation."
                </p>
            </div>
        </aside>
    );
}
