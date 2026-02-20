/**
 * Browser Notification Utility for Medication Reminders.
 */

export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function scheduleNotification(title: string, body: string, timeStr: string) {
    if (Notification.permission !== "granted") return;

    // Parse the time string (HH:mm)
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= now.getTime()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    console.log(`Scheduling notification for ${title} at ${scheduledTime.toLocaleTimeString()} (in ${Math.round(delay / 60000)} minutes)`);

    setTimeout(() => {
        new Notification(title, {
            body: body,
            icon: "/favicon.ico", // Ensure this exists or use a pill icon
            tag: "medication-reminder",
            requireInteraction: true
        });

        // Reschedule for next day
        scheduleNotification(title, body, timeStr);
    }, delay);
}

export function setupMedicationReminders(medicines: any[]) {
    medicines.forEach(med => {
        const schedule = Array.isArray(med.schedule) ? med.schedule : [];
        schedule.forEach((time: string) => {
            scheduleNotification(
                `Medication Reminder: ${med.name}`,
                `It's time for your ${med.dosage} dose.`,
                time
            );
        });
    });
}
