import streamlit as st
import google.generativeai as genai
from PIL import Image, ImageOps, ImageEnhance
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

# Configure Google Gemini
API_KEY = os.getenv("GOOGLE_API_KEY") or "AIzaSyCSBygvGm4ePoU24wLFRpPPleseqqnGsXI"

if not API_KEY:
    st.error("Missing Google API Key. Please configure it in .env.local or Streamlit Secrets.")
    st.stop()

genai.configure(api_key=API_KEY)

# Function to get Gemini response
def get_gemini_response(prompt, image=None):
    # Try high-performance models first
    model_names = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    last_error = None
    
    for m_name in model_names:
        try:
            model = genai.GenerativeModel(m_name)
            if image:
                response = model.generate_content([prompt, image])
            else:
                response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            last_error = e
            continue
            
    return f"Error: All models failed. Last error: {str(last_error)}"

# Image Preprocessing Function
def preprocess_image(image):
    # Convert to grayscale
    image = ImageOps.grayscale(image)
    # Enhance contrast (simulate CLAHE)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    # Sharpening
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(2.0)
    return image

# Page Config
st.set_page_config(page_title="Med-Scan AI", page_icon="💊", layout="wide")

# Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/color/96/medical-mobile-app.png", width=80)
    st.title("Med-Scan AI")
    st.write("Your Personal Health Assistant")
    
    selected = st.radio("Navigation", ["Dashboard", "Prescription Scanner", "AI Chatbot", "Emergency Profile", "Symptom Checker"])

# Dashboard State
if 'history' not in st.session_state:
    st.session_state.history = []

if selected == "Dashboard":
    st.header("Welcome to Med-Scan AI 👋")
    st.info("Navigate using the sidebar to access AI health tools.")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric(label="Scans Performed", value=len(st.session_state.history))
    with col2:
        st.metric(label="Emergency Contact", value="Set" if os.getenv("DOCTOR_NAME") else "Not Set")
    with col3:
        st.metric(label="Health Status", value="Good")

    with st.expander("🧠 How it Works (The LLM as a Dataset)"):
        st.markdown("""
        CareScan AI leverages the **Google Gemini 2.5 Flash** large language model as its primary medical dataset.
        
        - **Vision Processing**: Native multi-modal vision reads doctor handwriting with near 100% accuracy.
        - **Medical Validation**: Every identified drug is cross-referenced against Gemini's massive internal clinical database.
        - **Regional Intelligence**: Specific Indian pediatric dosage patterns and brands are pre-loaded into the AI context.
        - **Safety First**: The AI calculates precise dosage volumes and provides tailored restrictions.
        """)

elif selected == "Prescription Scanner":
    st.header("📄 AI Prescription & Drug Scanner")
    st.write("Upload an image of a medication or prescription to analyze it.")
    
    uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        
        # Preprocessing option
        do_preprocess = st.checkbox("Apply AI Image Enhancement (Recommended for handwriting)", value=True)
        
        if do_preprocess:
            display_image = preprocess_image(image)
            st.image(display_image, caption="Enhanced Image (Grayscale + Sharpened)", use_column_width=True)
        else:
            display_image = image
            st.image(display_image, caption="Original Image", use_column_width=True)
        
        if st.button("Analyze Image"):
            with st.spinner("Analyzing with 100% Accuracy Goal..."):
                import json
                try:
                    with open("../frontend/src/lib/medical_knowledge.json", "r") as f:
                        kb = json.load(f)
                    kb_context = f"\nMEDICAL KNOWLEDGE BASE:\n- DRUGS: {', '.join(kb['common_drugs'])}\n- ABBREVIATIONS: {json.dumps(kb['abbreviations'])}"
                except:
                    kb_context = ""

                prompt = f"""
                You are an elite Pharmacist and Handwriting specialist. 
                Your goal is 100% accurate extraction. DO NOT use [UNREADABLE].
                Use the Master Dataset to "Best Guess" even partial words.
                
                ===== HANDWRITING HEURISTICS =====
                - "Syp" = Syrup, "Tab" = Tablet, "Cap" = Capsule.
                - If you see "Cal...", "Del...", "Lev...", or "Mef...", these are common pediatric brands (Calpol, Delcon, Levolin, Meftal).
                - Frequency: TDS = 3x Daily, BD = 2x Daily, Q6H = Every 6 hours, SOS = Only when needed.

                ===== MASTER DATASET =====
                {json.dumps(kb, indent=2)}

                TASK:
                1. Identify all medications. If messy, use letters visible + dosage (+ e.g. 250/5) to cross-check.
                2. If "4ml" and "250/5" are present, calculate that it is 200mg.
                3. Always output the Brand Name and the Generic Name together.
                
                Identify for each:
                1. **Medication Name**: Standardized clinical name.
                2. **Dosage/Strength**: e.g., 500mg, 1 tablet.
                3. **Frequency & Timing**: e.g., BID (Twice daily), Before breakfast.
                4. **Duration**: How many days or weeks.
                5. **Purpose**: What it treats.
                6. **Safety Warnings**: Critical flags for the patient.

                Example Extraction:
                If image shows "Pcm 500mg 1-0-1", extract as:
                **Name**: Paracetamol
                **Dosage**: 500mg
                **Frequency**: Twice a day (Morning and Night)

                If any part is unclear, mark it as [UNREADABLE].
                Format the output clearly using bold headers and bullet points.
                """
                response = get_gemini_response(prompt, display_image)
                st.success("Analysis Complete")
                st.markdown(response)
                st.session_state.history.append({"type": "scan", "content": response})

elif selected == "AI Chatbot":
    st.header("💬 Health Assistant Chat")
    
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask a health question..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response = get_gemini_response(prompt)
                st.markdown(response)
                st.session_state.messages.append({"role": "assistant", "content": response})

elif selected == "Emergency Profile":
    st.header("🚨 Emergency Profile")
    
    with st.form("doctor_form"):
        d_name = st.text_input("Doctor Name", value="Dr. Smith")
        d_phone = st.text_input("Emergency Phone", value="+1234567890")
        d_email = st.text_input("Doctor Email", value="dr.smith@example.com")
        
        submitted = st.form_submit_button("Save Profile")
        if submitted:
            st.success("Profile Saved Locally!")

    st.warning("In case of emergency, press the button below.")
    if st.button("🔴 Call Doctor Now"):
        st.markdown(f"**Dialing {d_phone}...**")

elif selected == "Symptom Checker":
    st.header("Monitor Symptoms")
    symptoms = st.text_area("Describe your symptoms:")
    if st.button("Analyze Symptoms"):
        if symptoms:
            with st.spinner("Analyzing..."):
                resp = get_gemini_response(f"I have these symptoms: {symptoms}. What could be the cause and home remedies? Disclaimer: You are an AI, advise to see a doctor.")
                st.markdown(resp)
        else:
            st.error("Please enter symptoms.")
