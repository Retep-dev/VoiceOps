# VoiceOps — Production-Grade AI Voice Support & Operations Platform

VoiceOps is a portfolio-grade AI engineering platform designed for real-world automated customer voice operations. It features modular Automatic Speech Recognition (ASR), Text-to-Speech (TTS), multi-stage enterprise RAG, multi-agent state orchestration, safe tool execution, human-in-the-loop escalation, full-stack observability, automated LLM evaluation, and real-time WebSocket audio streaming.

---

## 🚀 Quickstart Guide — How to Run the App

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the FastAPI Backend Server

Open a terminal window:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment (if not already created)
python -m venv venv

# 3. Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# 4. Install backend requirements
pip install -r requirements.txt

# 5. Start FastAPI server with live reload
uvicorn main:app --reload --port 8000
```

- **Backend API URL**: `http://localhost:8000`
- **Interactive OpenAPI Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### Step 2: Start the React Frontend Application

Open a **second terminal window**:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node packages
npm install

# 3. Launch Vite development server
npm run dev
```

- **Web Application URL**: Open browser at `http://localhost:5173`

---

### Step 3: Run the Automated Test Suite

To verify all ASR, TTS, RAG, Multi-Agent routing, Escalation, and Evaluation modules:

```bash
# From the repository root directory:
python -m pytest backend/tests
```

---

### Step 4: Run Fine-Tuning Intent Classifier Benchmark

To generate the synthetic intent dataset and execute the LoRA vs. Baseline benchmark comparison:

```bash
cd backend
python finetuning/generate_dataset.py
python finetuning/eval_finetuning.py
```

---

## 📁 Repository Structure

```text
VoiceOps/
├── backend/
│   ├── api/             # FastAPI REST & WebSocket routers (/api/voice, /api/knowledge, /api/escalations, /api/evaluations)
│   ├── core/            # Config, security, settings
│   ├── models/          # Pydantic domain models (Voice, Agent, Tool, RAG, Escalation, Eval)
│   ├── providers/       # Pluggable ASR (Deepgram/Whisper/Mock), TTS (ElevenLabs/OpenAI/Mock), LLM (NVIDIA LLaMA 3.1)
│   ├── services/        # Audio service, RAG engine, Memory service, Observability tracer, Eval runner
│   ├── agents/          # Supervisor Router, Knowledge RAG Agent, Customer CRM Agent, Operations Agent, Escalation Agent
│   ├── tools/           # Strict Pydantic Tool Registry (get_order, get_customer, request_refund, create_ticket)
│   ├── finetuning/      # Intent dataset generator & LoRA evaluation benchmark
│   ├── tests/           # 13 automated unit & integration test suites
│   ├── main.py          # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/            # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/  # VoiceConsole, KnowledgeManager, EscalationQueue, EvaluationDashboard, Navbar
│   │   ├── App.jsx
│   │   └── index.css    # Glassmorphic dark design system
│   ├── index.html
│   └── package.json
└── README.md
```
