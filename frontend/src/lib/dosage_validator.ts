/**
 * Dosage Validation Logic for 100% Accuracy Roadmap.
 * Compares extracted dosages against clinical safety ranges.
 */

interface DosageRange {
    maxSingleDoseMg: number;
    maxDailyDoseMg: number;
    typicalUnit: string;
}

const SAFETY_DATABASE: Record<string, DosageRange> = {
    // Paracetamol / Acetaminophen
    "paracetamol": { maxSingleDoseMg: 1000, maxDailyDoseMg: 4000, typicalUnit: "mg" },
    "acetaminophen": { maxSingleDoseMg: 1000, maxDailyDoseMg: 4000, typicalUnit: "mg" },
    "calpol": { maxSingleDoseMg: 1000, maxDailyDoseMg: 4000, typicalUnit: "mg" },
    "panadol": { maxSingleDoseMg: 1000, maxDailyDoseMg: 4000, typicalUnit: "mg" },
    "tylenol": { maxSingleDoseMg: 1000, maxDailyDoseMg: 4000, typicalUnit: "mg" },

    // Ibuprofen / NSAIDs
    "ibuprofen": { maxSingleDoseMg: 800, maxDailyDoseMg: 3200, typicalUnit: "mg" },
    "advil": { maxSingleDoseMg: 800, maxDailyDoseMg: 3200, typicalUnit: "mg" },
    "motrin": { maxSingleDoseMg: 800, maxDailyDoseMg: 3200, typicalUnit: "mg" },

    // Antibiotics
    "amoxicillin": { maxSingleDoseMg: 1000, maxDailyDoseMg: 3000, typicalUnit: "mg" },
    "amox": { maxSingleDoseMg: 1000, maxDailyDoseMg: 3000, typicalUnit: "mg" },
    "augmentin": { maxSingleDoseMg: 1000, maxDailyDoseMg: 2000, typicalUnit: "mg" },
    "azithromycin": { maxSingleDoseMg: 500, maxDailyDoseMg: 500, typicalUnit: "mg" },

    // Statins
    "atorvastatin": { maxSingleDoseMg: 80, maxDailyDoseMg: 80, typicalUnit: "mg" },
    "lipitor": { maxSingleDoseMg: 80, maxDailyDoseMg: 80, typicalUnit: "mg" },
};

export interface ValidationResult {
    isValid: boolean;
    warning?: string;
    extractedMg?: number;
}

export function validateDosage(drugName: string, dosageStr: string): ValidationResult {
    const normalizedName = drugName.toLowerCase().trim();
    const safetyRange = SAFETY_DATABASE[normalizedName];

    if (!safetyRange) {
        return { isValid: true }; // No data to validate against
    }

    // Extract numerical value from dosage string (e.g., "500mg" -> 500)
    const mgMatch = dosageStr.match(/(\d+(?:\.\d+)?)\s*mg/i);
    const mlMatch = dosageStr.match(/(\d+(?:\.\d+)?)\s*ml/i);

    if (mgMatch) {
        const mg = parseFloat(mgMatch[1]);
        if (mg > safetyRange.maxSingleDoseMg) {
            return {
                isValid: false,
                extractedMg: mg,
                warning: `Potential Overdose: This dose (${mg}mg) exceeds the typical maximum single dose (${safetyRange.maxSingleDoseMg}mg) for ${drugName}.`
            };
        }
        return { isValid: true, extractedMg: mg };
    }

    // If only ML is provided, we can't reliably check MG without concentration info,
    // so we return valid but could flag for manual check if ML is unusually high.
    if (mlMatch) {
        const ml = parseFloat(mlMatch[1]);
        if (ml > 50) { // Genetic high-volume flag
            return {
                isValid: false,
                warning: `High Volume Alert: ${ml}ml is an unusually large dose for oral medication. Confirm with a pharmacist.`
            };
        }
    }

    return { isValid: true };
}
