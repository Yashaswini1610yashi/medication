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
      
      MISSION: Provide BRIEF and FRIENDLY responses. Identify if the user is asking about a specific medication.
      
      STRICT GUIDELINES:
      1. BE CONCISE: Stick to 2-3 sentences max for the initial response.
      2. REFER TO SIDEBAR: Instead of listing all details, mention that the full 💊 Drug Info, 🥗 Diet, and 🏠 Home Remedies are available in the "Live Analysis" sidebar on the right.
      3. ACCURACY: Still use the database to identify the drug precisely.
      4. DISCLOSURE: End with a standard clinical disclaimer.
      
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
