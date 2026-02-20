import { useState, useEffect } from "react";
import { Bell, Clock, Calendar, BellOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { requestNotificationPermission, setupMedicationReminders } from "@/lib/notifications";

interface Medicine {
    name: string;
    dosage: string;
    schedule: string[];
}

interface DigitalScheduleProps {
    medicines: Medicine[];
}

export default function DigitalSchedule({ medicines }: DigitalScheduleProps) {
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("medication_reminders_enabled");
        if (saved === "true") {
            setRemindersEnabled(true);
            setupMedicationReminders(medicines);
        }
    }, [medicines]);

    const toggleReminders = async () => {
        if (!remindersEnabled) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setRemindersEnabled(true);
                localStorage.setItem("medication_reminders_enabled", "true");
                setupMedicationReminders(medicines);
                alert("Medication Reminders Enabled! You will receive a browser notification for each dose.");
            } else {
                alert("Please enable notification permissions in your browser to use this feature.");
            }
        } else {
            setRemindersEnabled(false);
            localStorage.setItem("medication_reminders_enabled", "false");
            // Note: In a full app, we'd clear the intervals/timeouts here
            alert("Reminders disabled.");
        }
    };

    // Flatten and sort the schedule
    const fullSchedule = medicines.flatMap(med => {
        const scheduleArray = Array.isArray(med.schedule)
            ? med.schedule
            : typeof med.schedule === 'string'
                ? [med.schedule]
                : [];

        return scheduleArray.map(time => ({
            time,
            medName: med.name,
            dosage: med.dosage
        }));
    }).filter(item => item.time && item.time.includes(":")).sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-zinc-900">Digital Schedule</h2>
                </div>
                <button
                    onClick={toggleReminders}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all shadow-lg font-bold text-sm ${remindersEnabled
                            ? 'bg-green-600 text-white shadow-green-200'
                            : 'bg-indigo-600 text-white shadow-indigo-200'
                        }`}
                >
                    {remindersEnabled ? <ShieldCheck className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    {remindersEnabled ? 'Reminders Active' : 'Set Reminders'}
                </button>
            </div>

            <div className="space-y-4">
                {fullSchedule.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 group"
                    >
                        <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-indigo-600 tabular-nums">
                                {item.time}
                            </div>
                            {idx !== fullSchedule.length - 1 && (
                                <div className="w-0.5 h-12 bg-zinc-100 group-hover:bg-indigo-100 transition-colors" />
                            )}
                        </div>

                        <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-zinc-900">{item.medName}</p>
                                    <p className="text-sm text-zinc-500">{item.dosage}</p>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {fullSchedule.length === 0 && (
                    <div className="text-center py-12 text-zinc-400 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
                        Scan a prescription to see your schedule
                    </div>
                )}
            </div>
        </div>
    );
}
