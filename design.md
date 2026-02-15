# Design Document: Asteria AI

## 1. System Architecture
Asteria AI follows a multi-layered architecture designed to run on low-resource hardware.

| Layer | Technology Stack | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (PWA), Tailwind CSS | [cite_start]Offline-capable Progressive Web App for universal access[cite: 145]. |
| **Backend** | Node.js, Express | [cite_start]Handles API requests and local logic orchestration[cite: 148]. |
| **ML Engine** | Python, FastAPI | [cite_start]Serves the AI models to the application[cite: 153]. |
| **Deep Learning** | PyTorch / TensorFlow | [cite_start]Powers the CNN models for image analysis[cite: 155]. |
| **LLM Engine** | Ollama (Qwen / Llama) | [cite_start]Provides natural language reasoning for symptom analysis[cite: 151]. |
| **Explainability** | Grad-CAM | [cite_start]Visualizes heatmaps on X-rays to show affected areas[cite: 158]. |

## 2. Data Flow & Logic

### Stage 1: Symptom-Only Mode (Zero Connectivity)
* **Input:** Patient BMI, Symptoms ($s_i$), Duration ($t_j$).
* **Logic:**
    $$\text{SymptomScore} = \sum (w_i \cdot s_i) + \sum (d_j \cdot t_j) + \text{Bonus}$$
    * *Weights ($w_i$):* Assigned to specific symptoms (e.g., cough, fever).
    * [cite_start]*Duration ($d_j$):* Multipliers for chronic issues (e.g., Cough > 14 days for TB)[cite: 79, 82].
* **Output:** Baseline Risk Score (0-100%).

### Stage 2: Hybrid Mode (With X-ray)
* [cite_start]**Input:** Chest X-ray image (uploaded via Multer)[cite: 160].
* [cite_start]**Model:** CNN (ResNet/EfficientNet) using Transfer Learning[cite: 99].
* **Logic:**
    $$\text{FinalRisk} = 0.4 \times \text{SymptomScore} + 0.6 \times \text{X-rayRisk}$$
    * [cite_start]*X-rayRisk* = Max probability of (TB, Pneumonia, Severe Abnormality)[cite: 133].

### Stage 3: Decision & Output
The Fusion Engine maps the Final Risk to a triage category:
1.  **Low Risk:** Guidance for self-care.
2.  **Moderate Risk:** Generate referral summary for doctor.
3.  [cite_start]**High Risk / Emergency:** Immediate alert (e.g., if Hypoxia detected)[cite: 136].

## 3. Explainability Features
To ensure trust, the system does not function as a "black box":
* [cite_start]**Visuals:** Grad-CAM overlays highlight the exact regions in the lungs that triggered the AI's detection[cite: 124].
* **Context:** The referral summary explicitly lists *why* a patient was flagged (e.g., "High fever + abnormal lung opacity").

## 4. Deployment Strategy
* [cite_start]**Platform:** Android mobile devices or low-cost laptops used by ASHA workers[cite: 169].
* **Connectivity:** "Offline-First" design ensures core functionality works without any data connection, syncing only when convenient.