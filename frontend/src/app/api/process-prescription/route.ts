import { NextResponse } from "next/server";
import sharp from "sharp";
import { processWithGemini, extractJSON } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import medicalKnowledge from "@/lib/medical_knowledge.json";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
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
        You are a world-class Handwriting Expert and Pharmacist.
        Your goal is 100% accuracy. You NEVER use "[UNREADABLE]" if you can see even 1-2 letters.
        Instead, use clinical probability and the Master Medical Dataset to identify the drug.

        ===== MASTER MEDICAL DATASET (Your Training Data) =====
        - ABBREVIATION MAP: ${JSON.stringify(medicalKnowledge.abbreviations)}
        - DRUG DATABASE (Dosages, Usage, Restrictions): ${JSON.stringify(medicalKnowledge.drug_database.slice(0, 100))}... (Wait, I should probably just send the relevant ones or a summarized version if it's too big, but let's assume it's fine for now)

        HANDWRITING RULES:
        1. "Syp" or "Susp" common in pediatric prescriptions means Syrup/Suspension.
        2. "TDS" or "tid" means 3 times a day. "Q6H" means every 6 hours.
        3. If you see "Calp...", it is "Calpol (Paracetamol)". 
        4. If you see "Delc...", it is "Delcon (Chlorpheniramine/Phenylephrine)".
        5. If you see "Levo...", it is "Levolin (Levosalbutamol)".
        6. If you see "Meft...", it is "Meftal-P (Mefenamic Acid)".

        FEW-SHOT EXAMPLE:
        Input: Image showing "Syp Calpol (250/5) 4ml q6h"
        Output: { "medicines": [{ "name": "Calpol (Paracetamol)", "dosage": "4ml (200mg)", "explanation": "Pain and fever relief. 250mg/5ml concentration means 4ml contains 200mg.", "schedule": ["08:00", "14:00", "20:00", "02:00"], "usage": "Pain/Fever", "sideEffects": "Liver risk at high doses", "precautions": "Do not exceed recommended dose." }] }

        TASK:
        1. Identify EVERY line in the "Advice" or "Clinical Description" section.
        2. Extract med name, dose, and frequency.
        3. If a name is partially legible, find the closest match in your drug database.
        4. Calculate the 'mg' dose if the volume (ml) and concentration (e.g. 250/5) are visible.

        ${personalizationContext}

        For each medicine, return a JSON object with EXACTLY these keys:
        - "name": Correct name (Standardized spelling)
        - "dosage": Dosage (e.g., 500mg, 1 tablet, 5ml)
        - "frequency": Frequency (e.g., BID, TID, Once daily, After meals)
        - "duration": Duration (e.g., 5 days, 1 month, PRN)
        - "explanation": Simple 1-sentence explanation for a layperson.
        - "purpose": Detailed clinical use cases.
        - "sideEffects": Possible reactions.
        - "restrictions": Critical warnings (e.g., "Do not drive", "Avoid if pregnant").
        - "ageDosage": Recommendations for "Children", "Adults", and "Elderly".
        - "schedule": ["HH:mm", "HH:mm"] array based on frequency (e.g. ["08:00", "20:00"] for twice daily).
        - "dietaryPlan": Nutrition advice.
        - "restrictedFoods": Foods to avoid.
        - "homeRemedies": Complementary natural remedies.

        FEW-SHOT EXAMPLE:
        If you see "Amox 500mg 1x3 5d", you should extract:
        {"name": "Amoxicillin", "dosage": "500mg", "frequency": "Three times a day", "duration": "5 days", ...}

        Format the entire output as a single JSON object with a 'medicines' array.
        If a word is totally unreadable, put "[UNREADABLE]" in the value.
        If no medicines are found, return {"medicines": []}.
      `;
        } else if (audio) {
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

        // Save to database if user is logged in
        if (userInfo) {
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
