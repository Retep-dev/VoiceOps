# VoiceOps — Production-Grade AI Voice Support & Operations Agent

VoiceOps is a portfolio-grade AI engineering platform designed for real-world automated customer voice operations. It features modular Automatic Speech Recognition (ASR), Text-to-Speech (TTS), multi-stage enterprise RAG, multi-agent state orchestration, safe tool execution, human-in-the-loop escalation, full-stack observability, and automated LLM evaluation.

---

## 🌟 Key Architecture & Capabilities

1. **Pluggable Audio Processing Layer (ASR & TTS)**:
   - Abstract interfaces for ASR (`Deepgram Nova-2`, `OpenAI Whisper`, `MockASRProvider`).
   - Abstract interfaces for TTS (`ElevenLabs`, `OpenAI TTS`, `MockTTSProvider`).
2. **NVIDIA LLaMA 3.1 70B LLM Integration**:
   - High-throughput open-weights instruction following, tool calling, and grounded context generation.
3. **Enterprise Multi-Stage RAG**:
   - Hybrid retrieval (Dense Vector Search with `pgvector` + Sparse BM25) with cross-encoder reranking.
4. **Multi-Agent State Orchestrator**:
   - Supervisor node routing requests to Knowledge, Customer CRM, Operations, and Escalation specialist agents.
5. **Typed Tool Registry**:
   - Strictly validated Pydantic tools (`get_customer`, `get_order`, `request_refund`, `create_ticket`).
6. **Human Escalation Engine**:
   - Confidence-based handoff with rich context summary dossier generation.
7. **Observability & Evaluation**:
   - End-to-end tracing via Langfuse.
   - Automated evaluation suite measuring ASR WER/CER, RAG Faithfulness/Recall, Tool Selection Accuracy, and Latency waterfalls.

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ (for React Frontend)
- PostgreSQL with `pgvector` (or Supabase)

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure environment variables in .env

uvicorn main:app --reload --port 8000
```

### Running Tests
```bash
pytest backend/tests
```

---

## 📁 Repository Structure

```text
VoiceOps/
├── backend/
│   ├── api/             # FastAPI REST & WebSocket routers
│   ├── core/            # Config, security, database connectors
│   ├── models/          # Pydantic schemas (Voice, Agent, Tool, RAG, Eval)
│   ├── providers/       # Pluggable ASR, TTS, LLM provider backends
│   ├── services/        # Audio, Agent, Memory, RAG, and Escalation services
│   ├── tests/           # Automated test suite
│   ├── main.py          # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/            # React 18 + Vite Web Application
└── README.md
```
