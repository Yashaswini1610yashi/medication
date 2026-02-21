# MediScan AI: Presentation Script & Technical Brief

## 🎙️ Presentation Script
(Use this script for your demo or presentation)

### 1. Introduction (30 Seconds)
"Good morning/afternoon everyone. Today I am presenting **MediScan AI**—a professional healthcare platform designed to solve a critical problem in the medical industry: **Handwritten Prescription Errors.** Statistics show that thousands of medical errors occur due to illegible handwriting. Our app provides a 'Forensic Handwriting Intelligence' pipeline to ensure patient safety."

### 2. The Problem (30 Seconds)
"Doctors are busy, and their handwriting is often slurred and full of medical abbreviations like 'ac', 'bid', or 'qd'. For a patient, these aren't just letters—they are instructions for their life. MediScan AI acts as a **Virtual Pharmacist** that bridges the gap between the doctor’s ink and the patient’s understanding."

### 3. The Technology (1 Minute)
"We built this using a two-core architecture:
- **Next.js Dashboard**: A premium, state-of-the-art interface that gives users a ChatGPT-like conversational experience for their health.
- **AI Health Hub**: A dedicated Python/Streamlit backend powered by **Google Gemini 2.5 Flash**. We use OpenCV for industrial-grade image preprocessing and fuzzy matching logic to achieve near 100% accuracy in drug identification."

### 4. The Data & Tags (1 Minute)
"Our 'proprietary' knowledge base is the heart of the app. We don't just extract text; we perform **Contextual Resolution**. 
- We use a **Custom Medical Dataset** containing dozens of drugs with their verified brands, restricted diets, and even home remedies.
- We utilize **Semantic Tagging**: The AI looks for specific data points like `raw_ocr` (the literal ink), `resolved_name`, `frequency`, and `safety_restrictions` to build a complete digital health profile."

### 5. Conclusion (30 Seconds)
"To make this truly accessible, we've implemented a **Guest Mode** for zero-config entry and a global **One-Click Cloud Deployment**. MediScan AI isn't just a scanner; it's a 24/7 medical assistant in your pocket. Thank you!"

---

## 📊 Dataset & Technical Tags

### 1. The Dataset (`medical_knowledge.json`)
Our dataset is structured to give the AI "Medical Ground Truth":
- **Drug Registry**: Includes generic names (e.g., Paracetamol) and branding (e.g., Dolo 650).
- **Abbreviation Map**: Decodes Latin medical terms (e.g., *qd* -> Every day, *tid* -> 3x daily).
- **Handwriting Wisdom**: Contains specific visual rules for the AI (e.g., 'Check for 650 to confirm a looped D is actually Dolo').

### 2. Core Text Tags (JSON Semantic Schema)
When the AI "scans," it tags the data using these specific identifiers:
| Tag | Description |
| :--- | :--- |
| `raw_ocr` | The messy, literal letters as written by the doctor (e.g., "D0l0"). |
| `name` | The resolved, standardized drug name (e.g., "Dolo 650"). |
| `dosage` | The strength or volume (e.g., "500mg" or "5ml"). |
| `frequency` | The timing instructions (e.g., "1-0-1" or "TDS"). |
| `purpose` | The clinical reason for the drug (e.g., "Fever Control"). |
| `restrictions` | High-priority safety warnings (e.g., "Avoid Alcohol"). |
| `diet` | Nutritional guidance for the medication period. |
| `home_remedies` | Natural treatments suggested alongside the medicine. |
