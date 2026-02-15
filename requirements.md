# Requirements: Asteria AI
**Offline-First Intelligent Health Screening & Clinical Triage System**

## 1. Problem Statement
[cite_start]Rural communities in India face a critical "decision gap" in healthcare[cite: 26].
* [cite_start]**Scarcity of Experts:** Doctors and radiologists are rare in remote villages[cite: 10].
* [cite_start]**Infrastructure Gaps:** X-ray machines exist only at district hospitals, often miles away[cite: 11].
* [cite_start]**Barriers to Care:** Patients delay visits due to travel costs and wage loss[cite: 12].
* [cite_start]**Lack of Tools:** Frontline workers (ASHA) lack decision-support tools to triage patients effectively[cite: 13].

## 2. Project Scope
[cite_start]Asteria AI is an offline-first system designed to screen for high-impact respiratory conditions (Tuberculosis, Pneumonia) and provide actionable triage advice[cite: 36, 103]. It bridges the gap between symptom uncertainty and clinical care.

## 3. Functional Requirements

### A. Symptom-Based Screening (Stage 1)
* [cite_start]**Offline Operation:** The system must function entirely on edge devices without internet connectivity[cite: 38, 59].
* [cite_start]**Structured Questionnaire:** Must support a fully offline questionnaire covering BMI check, binary symptoms, and symptom duration[cite: 49, 74].
* [cite_start]**Risk Calculation:** Calculate a `SymptomScore` based on weighted symptoms, duration (acute vs. chronic), and red flags (e.g., Hemoptysis, Chest Pain)[cite: 72, 79].
* [cite_start]**Language Support:** Interface must be adaptable for local languages to aid low-literacy contexts[cite: 65].

### B. AI Imaging Analysis (Stage 2 - Optional)
* [cite_start]**Image Upload:** Allow upload of Chest X-rays if available[cite: 52].
* [cite_start]**Disease Detection:** Use CNN models to analyze X-rays for specific pathologies: Tuberculosis, Pneumonia, and Severe Abnormalities[cite: 101].
* [cite_start]**Smart Activation:** This stage should only trigger if an X-ray image is actually provided[cite: 100].

### C. Fusion & Triage (Stage 3)
* [cite_start]**Hybrid Scoring:** Combine clinical symptom risk (40%) and X-ray risk (60%) into a final confidence score[cite: 133].
* **Actionable Output:** Instead of just percentages, provide clear next steps:
    * [cite_start]**Low Risk:** Self-care/Observation[cite: 91].
    * [cite_start]**Moderate Risk:** Doctor consultation recommended[cite: 93].
    * [cite_start]**High Risk:** Immediate referral/Imaging[cite: 95].

### D. Safety Protocols
* **Critical Overrides:**
    * [cite_start]Hypoxia or Emergency signs must force Risk ≥ 95% (Immediate Referral)[cite: 136].
    * [cite_start]Critical Red Flags must force Risk ≥ 80%[cite: 137].
    * [cite_start]High-confidence X-ray results (>95%) override mild symptoms[cite: 139].

## 4. Non-Functional Requirements
* **Privacy:** Data processing happens locally on the device (Edge AI).
* [cite_start]**Accessibility:** Designed for use by ASHA workers and frontline staff[cite: 166].
* [cite_start]**Explainability:** Must provide "Why" the decision was made (e.g., "Cough > 14 days increases TB risk")[cite: 82].