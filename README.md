# CareScan AI: Industrial Prescription Digitalizer 🏥

CareScan AI is a professional healthcare platform that leverages **Gemini 2.5 Flash** and advanced image preprocessing to bridge the gap between handwritten prescriptions and patient safety.

## 📁 Project Structure

The project is segregated into two core modules for maximum scalability and maintainability:

```bash
med-scan/
├── frontend/             # Next.js Dashboard (React, Tailwind, Prisma, SQLite)
│   ├── src/              # Application logic and UI components
│   ├── prisma/           # Database schema and local medical records
│   └── package.json      # Frontend dependencies
├── backend/              # AI Health Hub (Python, Streamlit, OpenCV)
│   ├── streamlit_app.py  # AI Health Scanner & Resource Hub
│   └── requirements.txt  # Python dependencies (Gemini, OpenCV, FuzzyWuzzy)
└── README.md             # This master architecture guide
```

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+
- Python 3.9+
- Google Gemini API Key

### 2. Setup Frontend (Dashboard)
```bash
cd frontend
npm install
# Configure .env.local with GOOGLE_API_KEY
npx prisma db push
npm run dev
```
Visit: `http://localhost:3000`

### 3. Setup Backend (AI Health Hub)
```bash
cd backend
pip install -r requirements.txt
# Configure .env with GOOGLE_API_KEY
python -m streamlit run streamlit_app.py --server.port 8502
```
Visit: `http://localhost:8502`

## 🌐 Professional Cloud Deployment (Zero-Config)

To make this app work **forever** in 10 seconds, click these buttons. No database or technical setup is required!

### 1. Instant Dashboard (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYashaswini1610yashi%2Fmedication&root-directory=frontend&env=GOOGLE_API_KEY,NEXTAUTH_SECRET&envDescription=Paste%20your%20Gemini%20API%20key%20below&project-name=med-scan-ai)

*   **Step**: Just paste your Gemini API Key when asked.
*   **Result**: You get a permanent `https://...` link that works on any phone!

### 2. Instant AI Hub (Vision Backend)
[![Deploy to Streamlit](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://share.streamlit.io/deploy?repository=Yashaswini1610yashi/medication&branch=main&main_module_path=backend/streamlit_app.py)

*   **Step**: Go to "Advanced Settings" on the deploy page and paste your `GOOGLE_API_KEY`.

## 🧠 The Industrial Vision Pipeline
1. **Preprocessing**: Grayscale → Adaptive Thresholding → Noise Reduction.
2. **OCR Phase**: Literal character extraction from ink evidence.
3. **NLP Correction**: Fuzzy matching against the `medical_knowledge.json` master dataset.
4. **Clinical Validation**: Cross-referencing identified drugs with patient history and safety rules.

## 🛠️ Tech Stack
- **Dashboard**: Next.js 16 (Turbopack), Framer Motion, Lucide.
- **AI Backend**: Streamlit, Google Generative AI (Gemini Flash/Pro).
- **Core Intelligence**: OpenCV, Python-Levenshtein, Sharp.
- **Data Persistence**: Prisma ORM with local SQLite.

---
*Disclaimer: This tool is for informational purposes only. Always consult a healthcare professional before starting or stopping any medication.*
