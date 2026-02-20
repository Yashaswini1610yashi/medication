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

## 🌐 Production Deployment

### Frontend (Dashboard) - [Vercel]
1. Connect GitHub repo `medication`.
2. Set Root Directory to `frontend`.
3. Add Environment Variables: `GOOGLE_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

### Backend (AI Hub) - [Streamlit Cloud]
1. Connect repo to `share.streamlit.io`.
2. Main file: `backend/streamlit_app.py`.
3. Add `GOOGLE_API_KEY` to app secrets.

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
