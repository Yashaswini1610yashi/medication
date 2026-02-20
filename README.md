# CareScan AI 🏥

CareScan AI is a full-stack, AI-powered healthcare application designed to digitalize handwritten prescriptions and provide comprehensive medication insights. It leverages the latest Vision-LLM technology (Gemini 2.5) to bridge the gap between doctor notes and patient understanding.

## 🌟 Key Features

- **Prescription OCR & Enhancement**: Advanced image processing (Sharp) for reading handwriting.
- **Manual Medicine Lookup**: Instant search for detailed medicine data without needing a scan.
- **Side Effect Analysis**: Automatic extraction of potential reactions.
- **Safety Warnings**: Critical flags for Heart Disease, Diabetes, and Pregnancy.
- **Age-Based Dosage**: Tailored dosage recommendations for Children, Adults, and the Elderly.
- **Digital Schedule**: Precise medication timing based on prescription frequency.

## 🧠 The "Dataset" (Google Gemini)

The application leverages the internal knowledge of **Google Gemini 2.5 Flash** as its core intelligence source. It does not rely on static local CSVs or JSONs for medical data, but instead uses the LLM's vast training on medical literature and handwriting.

- **Handwriting Recognition**: Gemini processes uploaded prescription images directly using its native vision capabilities.
- **Medical Validation**: The AI is programmed through specialized prompts to act as a "world-class pharmacist," cross-checking spellings, dosages, side effects, and precautions against its internal knowledge.

## 🖼️ Image Preprocessing (Powering the Input)

To maximize accuracy, the application uses the **Sharp** library to enhance "readability" on the fly:
- **Grayscale Conversion**: Removes color noise.
- **Sharpening**: Enhances edges of handwriting.
- **CLAHE**: Improves contrast for faint or faded prescriptions.
- **Normalization**: Ensures consistent brightness for the AI.

## 👤 Local Data & History (Personalization)

While medical knowledge is external, user context is stored locally for personalized insights:
- **Database**: Uses Prisma (configured for local SQLite/PostgreSQL).
- **Context**: Retrieves patient age and medical conditions to provide specifically tailored safety warnings.
- **History Tracking**: Every processed prescription is saved to the local database for timeline tracking.

## 🏗️ Tech Stack
- **Framework**: Next.js 16 (Turbopack)
- **AI**: Google Gemini 2.5 Flash
- **Image Processing**: Sharp (CLAHE, Sharpening, Grayscaling)
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: Prisma with SQLite (Local) / Support for PostgreSQL
- **Icons**: Lucide React

---
*Disclaimer: This tool is for informational purposes only. Always consult a healthcare professional before starting or stopping any medication.*
