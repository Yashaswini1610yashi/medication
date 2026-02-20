import { NextResponse } from "next/server";
import { processWithGemini } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPrisma } from "@/lib/prisma";
import medicalKnowledge from "@/lib/medical_knowledge.json";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { message, history } = await req.json();

        const prisma = await getPrisma();
        const userInfo = session?.user?.id ? await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { prescriptions: { orderBy: { createdAt: 'desc' }, take: 3 } }
        }) : null;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const personalizationContext = userInfo ? `
      PATIENT PROFILE:
      - Name: ${userInfo.username}
      - Age: ${userInfo.age || "Not specified"}
      - Medical Conditions: ${userInfo.medicalHistory || "None documented"}
      - Recent Prescriptions: ${userInfo.prescriptions.map((p: any) => p.data).join(", ")}
    ` : "";

        const systemPrompt = `
      ACT AS: A Clinical Pharmacist & Senior Forensic Medical Assistant.
      ${personalizationContext}

      ===== MEDICAL KNOWLEDGE BASE (Reference for Accuracy) =====
      - ABBREVIATIONS: ${JSON.stringify(medicalKnowledge.abbreviations)}
      - FULL DRUG DATABASE: ${JSON.stringify(medicalKnowledge.drug_database)}
      
      MISSION: Provide "Bits of Information" in a conversational markdown format.
      
      STRICT GUIDELINES:
      1. DO NOT return raw JSON like {"response": "..."}. ONLY return clean Markdown text.
      2. BE CONVERSATIONAL: Start with a friendly summary, then provide details in bits.
      3. REQUIRED SECTIONS (Use Markdown Headers) for EVERY drug mentioned:
         - ### 💊 Drug Information
           (Brand Name, Chemical Purpose, Pharmacological Type)
         - ### 🩺 Health Analysis
           (Analyze based on the patient's Age (${userInfo?.age || "N/A"}) and specific conditions)
         - ### 🥗 Nutrients & Diet
           (EXACT details from the 'diet' field in the knowledge base)
         - ### 🏠 Home Remedies
           (EXACT details from the 'home_remedies' field in the knowledge base)
      4. DISCLOSURE: End with a standard clinical disclaimer.
      5. ACCURACY: If the drug is recognized (e.g., "Nimcet", "Omes P"), use the specific Diet/Remedy info from the database provided.
      
      User Message: ${message}
      
      Previous Chat History: ${history ? history.slice(-3).map((m: any) => `${m.role}: ${m.content}`).join("\n") : "None"}
    `;

        const response = await processWithGemini(systemPrompt);
        let text = response.text();

        // Defensive Parsing: If AI hallucinations JSON, extract the content
        try {
            if (text.trim().startsWith('{')) {
                const parsed = JSON.parse(text);
                text = parsed.response || parsed.reply || text;
            }
        } catch (e) {
            // Not JSON, continue with raw text
        }

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process chat", details: error.message }, { status: 500 });
    }
}
