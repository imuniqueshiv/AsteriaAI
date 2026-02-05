🩺 Asteria AI

Offline-First Intelligent Health Screening & Clinical Triage System

Asteria AI is an offline-first, multi-stage health screening and risk-assessment system designed for low-resource and rural healthcare settings, especially in India.
It bridges the critical gap between early symptoms and formal clinical diagnosis using AI-assisted triage, not diagnosis.

⚠️ Medical Disclaimer

Asteria AI is a clinical decision-support & triage tool, NOT a diagnostic system.
It helps assess risk, guide next actions, and encourage timely medical consultation.

🎯 Problem Statement

In rural and semi-urban regions:

Doctors and radiologists are often hours away

Patients delay care due to cost, distance, or uncertainty

Symptoms are ignored until the disease becomes severe

Asteria AI enables early risk awareness — even without internet or imaging — and escalates care only when necessary.

✨ Key Features

📴 Offline-First Design (Works without internet)

🧠 GenAI-Powered Clinical Screening (Local LLM)

🫁 Chest X-ray AI (CNN-based)

🔥 Explainability with Grad-CAM

🔗 Fusion Model (Symptoms + Image)

⚠️ Uncertainty & Low-Confidence Handling

📄 Auto Referral Summary for Doctors

🌐 PWA-ready for field health workers

🧠 System Workflow (End-to-End)

graph TD;
    Patient/Health_Worker --> Stage1[Stage 1: Symptoms <br> Local LLM Conversational Triage];
    Stage1 --> Score[Symptom Risk Score <br> Low / Moderate / High];
    Score --> Path{Risk-Based Path};
    Path -- Low --> SelfCare[Self-care / Observe];
    Path -- Moderate/High --> Stage2[Stage 2: X-ray AI <br> CNN + Grad-CAM];
    Stage2 --> Prob[Image Probability <br> TB / Pneumonia / Normal];
    Prob --> Stage3[Stage 3: Fusion AI <br> Symptoms + Image];
    Stage3 --> Final[Final Risk + Action <br> Confidence Check <br> Referral Summary];


Note: If the diagram above does not render, please view the text representation below:

Patient / Health Worker
       │
       ▼
┌──────────────────────┐
│  Stage 1: Symptoms   │ (Local LLM)
│  AI Conversational   │
│       Triage         │
└─────────┬────────────┘
          │
          ▼
  Symptom Risk Score
(Low / Moderate / High)
          │
          ▼
   (Risk-Based Path)
          │
          ├── Low → Self-care / Observe
          │
          ├── Moderate → Doctor Visit
          │
          ▼
┌──────────────────────┐
│   Stage 2: X-ray AI  │ (If available)
│    CNN + Grad-CAM    │
└─────────┬────────────┘
          │
          ▼
   Image Probability
(TB / Pneumonia / Normal)
          │
          ▼
┌──────────────────────┐
│  Stage 3: Fusion AI  │
│   Symptoms + Image   │
└─────────┬────────────┘
          │
          ▼
 Final Risk + Action
   Confidence Check
   Referral Summary


🧩 Architecture Overview

Layer

Technology

Frontend

React.js, PWA, Tailwind CSS

Backend

Node.js, Express

LLM Engine

Ollama (Qwen / Llama)

ML Engine

Python, FastAPI

Deep Learning

PyTorch / TensorFlow

Explainability

Grad-CAM

Data Handling

Multer (X-ray uploads)

🧪 Disease Focus (Hackathon-Optimized)

Tuberculosis (TB)

Pneumonia

Normal

Chosen due to:

High public-health impact

X-ray availability

Clear clinical escalation paths

🔍 ML & AI Design Principles

1️⃣ Symptom Intelligence (Stage 1 - LLM)

Powered by Local LLM: Uses quantized models (e.g., Qwen/Llama) via Ollama for offline capability.

Conversational Interface: Conducts an empathetic, context-aware clinical interview in simple English.

Dynamic Logic: Adapts follow-up questions based on patient history (e.g., Demographics, previous answers).

Structured Extraction: Converts natural language conversation into structured medical risk data.

2️⃣ Imaging AI (CNN)

Transfer learning (ResNet / EfficientNet)

Trained on curated TB & Pneumonia datasets

Outputs probability + heatmap

3️⃣ Explainability (Grad-CAM)

Highlights lung regions

Prevents false trust

Helps doctors & health workers understand why

4️⃣ Fusion Engine (Core Innovation)

Combines:

Final Risk = f(Symptom Score + Image Probability)

More reliable than image-only AI

Context-aware decision making

5️⃣ Uncertainty Handling (Critical)

Low confidence → Safety warning

Prevents unsafe automation bias

🚀 Quick Start

Prerequisites

Node.js (v16+)

Python (3.8+)

Ollama (for LLM)

npm / yarn

Clone Repository

git clone [https://github.com/imuniqueshiv/AsteriaAI.git](https://github.com/imuniqueshiv/AsteriaAI.git)
cd AsteriaAI


Server Setup

cd server
npm install
nodemon server.js


Client Setup

cd client
npm install
npm run dev


🔐 Note: .env files are intentionally excluded. Contact repository owner for environment configuration.

📦 Key Dependencies

Client

react

react-dom

axios

tailwindcss

lucide-react

Server

express

nodemon

dotenv

cors

multer

ollama

🌍 Real-World Impact

🏥 Reduces unnecessary hospital visits

👩‍⚕️ Empowers ASHA & frontline workers

🕒 Enables early intervention

🌐 Designed for regional language adaptation

⚖️ Ethics & Safety

No automated diagnosis

Clear confidence thresholds

Explicit referral guidance

Human-in-the-loop philosophy

🌍 Why Asteria AI?

In rural India, the nearest radiologist might be hours away. Asteria AI empowers ASHA workers and frontline staff to:

Reduce unnecessary travel: Patients only travel to district hospitals if the risk is High.

Empower Health Workers: Provides a digital "second opinion" where no doctors exist.

Language Friendly: Designed to be adapted into regional languages for better accessibility.

📝 License & Ethics

This project is built for a hackathon.
It includes clear medical disclaimers.
It is designed to encourage professional consultation, not replace it.