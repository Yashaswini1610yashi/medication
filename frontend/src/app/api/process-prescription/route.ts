import { NextResponse } from "next/server";
import sharp from "sharp";
import { processWithGemini, extractJSON } from "@/lib/gemini";
import { fuzzyMatch } from "@/lib/fuzzy";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPrisma } from "@/lib/prisma";
import medicalKnowledge from "@/lib/medical_knowledge.json";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const prisma = await getPrisma();
        const userInfo = session?.user?.id ? await prisma.user.findUnique({
            where: { id: session.user.id }
        }) : null;

        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const medicineName = formData.get("medicineName") as string | null;
        const audio = formData.get("audio") as File | null;

        if (!image && !medicineName && !audio) {
            return NextResponse.json({ error: "Provide an image, medicine name, or audio note" }, { status: 400 });
        }

        let prompt = "";
        const personalizationContext = userInfo ? `
        PATIENT PROFILE:
        - Age: ${userInfo.age || "Not specified"}
        - Medical Conditions: ${userInfo.medicalHistory || "None documented"}
        Please tailor your explanations and safety warnings based on this profile.
        ` : "";

        if (image) {
            console.log("Processing image:", image.name, image.type);
            prompt = `
        ACT AS: A Clinical Pharmacist & Senior Forensic Handwriting Analyst.
        ROLE: You are the final safety checkpoint between a doctor's messy script and a patient's health.
        
        MISSION: Extract medications from the ATTACHED IMAGE using the "Industrial Accuracy Pipeline."
        
        INDUSTRY ALGORITHM:
        1. PREPROCESSING: Image has been Thresholded and Noise-Reduced for clarity.
        2. OCR PHASE: Record the literal visual characters (e.g., "D0l0", "C0fsil").
        3. NLP CORRECTION: Use the Master Dataset to resolve visual errors to the correct drug name.
        4. CLINICAL VALIDATION: Verify if the dosage/usage matches the identified drug.

        STRICT RULES:
        1. "raw_ocr": This field MUST contain only the messy, literal letters/symbols as they appear in the ink.
        2. "name": This field MUST contain the standardized drug name derived FROM the raw_ocr.
        3. CONFIDENCE: If you are internally certain of a drug brand (like "Amphogel" or "Belladonna") even if it is NOT in the Master Dataset below, you MUST provide the standardized name. DO NOT use [UNRESOLVED] unless it is truly illegible.
        4. NO SUMMARIZATION: Do not explain the drug until you have completed the raw_ocr.
        5. HANDLE LIGATURES: 'y' vs 'p' descenders, 'm' humps, 'r' vs 'v' valleys.

        ===== MASTER MEDICAL DATASET (Reference Only) =====
        - ABBREVIATION MAP: ${JSON.stringify(medicalKnowledge.abbreviations)}
        - DRUG DATABASE: ${JSON.stringify(medicalKnowledge.drug_database)}

        ${personalizationContext}

        FOR EVERY MEDICATION ON THE PAGE:
        - "raw_ocr": Literal transcription (e.g. "Syp Calp... 5ml").
        - "name": Standardized name (e.g. "Calpol (Paracetamol)").
        - "dosage": Exact strength/amount shown.
        - "frequency": Exact timing (1-0-1, TDS, etc).
        - "explanation": Plain-English purpose (Layperson terms).
        - "purpose": Clinical indication.
        - "sideEffects": Possible reactions.
        - "restrictions": Life-safety warnings.
        - "ageDosage": Age-specific guidance.
        - "schedule": Precise 24h clock array.
        
        CRITICAL: If you cannot find a drug name, keep "raw_ocr" as the literal ink and put "[UNRESOLVED]" in name.
        OUTPUT: Single JSON object with a 'medicines' array.
      `;
        }
        else if (audio) {
            console.log("Processing audio note:", audio.name, audio.type);
            prompt = `
        You are a pharmacist. Listen to this audio note where a user is asking about a medicine.
        Identify the medicine name and provide a detailed report.
        ${personalizationContext}

        For each medicine, return a JSON object with EXACTLY these keys in a 'medicines' array:
        - "name": Identified medicine name
        - "dosage": "See age-based recommendations"
        - "frequency": "As mentioned/Standard"
        - "duration": "As mentioned/Standard"
        - "explanation": Plain English explanation of what it does.
        - "purpose": Detailed medical purpose and use cases.
        - "sideEffects": Potential side effects.
        - "restrictions": Warnings for patients with conditions like diabetes, heart disease, pregnancy, etc.
        - "ageDosage": { "Children": "Consult doctor", "Adults": "Standard dose", "Elderly": "Use with caution" },
        - "schedule": ["08:00", "20:00"] (Example default schedule).
        - "dietaryPlan": "Standard nutrition advice for this medication type.",
        - "restrictedFoods": "Generic restrictions for this medication class.",
        - "homeRemedies": "General natural remedies for this condition."

        Format the output as a JSON object with a 'medicines' array.
        If the audio is unclear or no medicine is mentioned, return {"medicines": []}.
      `;
        } else {
            console.log("Processing text lookup:", medicineName);
            prompt = `
        You are a pharmacist. Provide detailed information for the medicine: "${medicineName}".
        ${personalizationContext}

        For each medicine, return a JSON object with EXACTLY these keys in a 'medicines' array:
        - "name": "${medicineName}"
        - "dosage": "See age-based recommendations"
        - "frequency": "Standard frequency"
        - "duration": "As prescribed"
        - "explanation": Plain English explanation of what it does.
        - "purpose": Detailed medical purpose and use cases.
        - "sideEffects": Potential side effects.
        - "restrictions": Warnings for patients (e.g., diabetes, heart disease, pregnancy).
        - "ageDosage": { "Children": "Consult doctor", "Adults": "Standard dose", "Elderly": "Use with caution" },
        - "schedule": ["08:00", "20:00"] (Example default schedule).
        - "dietaryPlan": "Specific food suggestions that complement this medicine.",
        - "restrictedFoods": "Foods that may negatively interact with this medicine.",
        - "homeRemedies": "Natural treatments often used alongside this medication."

        Format the output as a JSON object with a 'medicines' array.
        If "${medicineName}" is not a valid medicine, return {"medicines": []}.
      `;
        }

        let imageBase64 = "";
        if (image) {
            const imageBuffer = Buffer.from(await image.arrayBuffer());
            const processedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 2000, fit: 'inside', withoutEnlargement: true })
                .grayscale()
                .sharpen()
                .clahe({ width: 50, height: 50 })
                .normalize()
                .toFormat('png')
                .toBuffer();
            imageBase64 = processedImageBuffer.toString("base64");
        }

        let audioBase64 = "";
        let audioMimeType = "";
        if (audio) {
            const audioBuffer = Buffer.from(await audio.arrayBuffer());
            audioBase64 = audioBuffer.toString("base64");
            audioMimeType = audio.type;
        }

        const response = await processWithGemini(prompt, imageBase64, audioBase64, audioMimeType);
        const text = response.text();
        const data = extractJSON(text);

        // Step 3 & 4: Industrial Resolution (Fuzzy Matching)
        if (data.medicines && Array.isArray(data.medicines)) {
            const drugChoices = medicalKnowledge.drug_database.map(d => d.name);
            const brandChoices = medicalKnowledge.drug_database.map(d => d.brand);
            const allChoices = [...new Set([...drugChoices, ...brandChoices])];

            data.medicines = data.medicines.map((med: any) => {
                if (med.name === "[UNRESOLVED]" || med.name === "[UNREADABLE]" || med.raw_ocr) {
                    const inputStr = med.raw_ocr || med.name;
                    let bestMatch = null;
                    let maxSimilarity = 0;

                    for (const choice of allChoices) {
                        const cleanInput = inputStr.trim().toLowerCase();
                        const cleanChoice = choice.trim().toLowerCase();

                        // We'll calculate similarity directly to keep the map clean
                        const distance = (function (a, b) {
                            const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
                            for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
                            for (let i = 1; i <= a.length; i++) {
                                for (let j = 1; j <= b.length; j++) {
                                    const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
                                    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
                                }
                            }
                            return matrix[a.length][b.length];
                        })(cleanInput, cleanChoice);

                        const similarity = 1 - distance / Math.max(cleanInput.length, cleanChoice.length);

                        if (similarity > maxSimilarity) {
                            maxSimilarity = similarity;
                            bestMatch = choice;
                        }
                    }

                    if (bestMatch && maxSimilarity >= 0.65) {
                        med.name = bestMatch;
                        med.confidence = Math.round(maxSimilarity * 100);
                        const drugInfo = medicalKnowledge.drug_database.find(d => d.name === bestMatch || d.brand === bestMatch);
                        if (drugInfo) {
                            med.purpose = drugInfo.usage;
                            med.restrictions = drugInfo.restrictions;
                        }
                    }
                }
                return med;
            });
        }

        // Phase 1: openFDA Verification & Enrichment
        if (data.medicines && data.medicines.length > 0) {
            const { verifyDrug } = await import("@/lib/fda");

            for (let i = 0; i < data.medicines.length; i++) {
                const med = data.medicines[i];
                const fdaInfo = await verifyDrug(med.name);

                if (fdaInfo) {
                    // Enrich with Ground Truth from FDA
                    data.medicines[i] = {
                        ...med,
                        name: fdaInfo.brand_name || med.name,
                        genericName: fdaInfo.generic_name,
                        // Append FDA warnings if they exist
                        restrictions: med.restrictions + (fdaInfo.warnings ? `\n(FDA Warning: ${fdaInfo.warnings.substring(0, 500)}...)` : ""),
                        purpose: med.purpose || fdaInfo.purpose || fdaInfo.indications_and_usage,
                        fdaVerified: true
                    };
                } else {
                    data.medicines[i].fdaVerified = false;
                }
            }
        }

        // Save to database if user is logged in
        if (userInfo) {
            const prisma = await getPrisma();
            await prisma.prescription.create({
                data: {
                    userId: userInfo.id,
                    data: JSON.stringify(data),
                }
            });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Processing failed", details: error.message }, { status: 500 });
    }
}
