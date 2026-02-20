"use client";

import { useState } from "react";
import { Upload, Camera, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrescriptionScannerProps {
    onDataExtracted: (data: any) => void;
    compact?: boolean;
}

export default function PrescriptionScanner({ onDataExtracted, compact }: PrescriptionScannerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/process-prescription", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || "Failed to process prescription");
            }

            const data = await response.json();
            if (data) {
                onDataExtracted(data);
            }
        } catch (err: any) {
            setError(err.message || "We couldn't read the prescription properly. Please try a clearer photo.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="p-6 space-y-4">
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={loading}
                    />
                    <div className={`
                        relative border-2 border-dashed rounded-2xl p-8 transition-all
                        ${loading ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-blue-100 hover:border-blue-400'}
                        flex flex-col items-center justify-center text-center space-y-3
                    `}>
                        {preview ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                {loading && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-blue-500" />
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-zinc-900">Upload Prescription</p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">JPG, PNG, WEBP</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Prescription Digitalizer
                </h2>
                <p className="text-zinc-500 text-lg">
                    Upload your handwritten prescription to get a digital schedule and clear explanations.
                </p>
            </div>

            <div className="relative group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />

                <div className={`
          relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300
          ${loading ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-blue-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10'}
          ${error ? 'border-red-200 bg-red-50/30' : ''}
          flex flex-col items-center justify-center text-center space-y-4
        `}>
                    {preview ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
                        >
                            <img src={preview} alt="Prescription preview" className="w-full h-full object-contain" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                                    <p className="font-medium animate-pulse">Our AI is reading your doctor's handwriting...</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                <Camera className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-zinc-900">Click to upload or drag & drop</p>
                                <p className="text-zinc-500">Supports JPG, PNG, WEBP</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">How the AI Works</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-zinc-900">🧠 LLM as Dataset</p>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            Leverages Gemini 2.5 Flash's internal medical knowledge base for validation.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-zinc-900">🖼️ Sharp Vision</p>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            Uses CLAHE and sharpening to make doctor handwriting readable for AI.
                        </p>
                    </div>
                </div>

                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter pt-4 border-t border-zinc-100">
                    Propelled by Google Gemini 2.5 Flash • High Accuracy Extraction
                </p>
            </div>
        </div>
    );
}
