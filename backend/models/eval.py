from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ASRMetrics(BaseModel):
    word_error_rate: float
    character_error_rate: float
    avg_transcription_ms: float
    total_samples: int


class RAGMetrics(BaseModel):
    retrieval_precision: float
    retrieval_recall: float
    context_relevance_score: float
    answer_faithfulness_score: float


class AgentMetrics(BaseModel):
    routing_accuracy: float
    tool_selection_accuracy: float
    tool_argument_accuracy: float
    escalation_accuracy: float


class VoiceMetrics(BaseModel):
    time_to_first_response_ms: float
    avg_total_latency_ms: float
    avg_asr_latency_ms: float
    avg_agent_latency_ms: float
    avg_tts_latency_ms: float


class EvalTestCase(BaseModel):
    case_id: str
    category: str  # asr, rag, agent, voice
    input_text: str
    expected_agent: str
    expected_tools: List[str] = Field(default_factory=list)
    ground_truth_context: Optional[str] = None


class EvalSuiteResult(BaseModel):
    eval_id: str
    executed_at: str
    total_cases: int
    asr: ASRMetrics
    rag: RAGMetrics
    agent: AgentMetrics
    voice: VoiceMetrics
    passed_cases: int
    failed_cases: int
