from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class EscalationDossier(BaseModel):
    escalation_id: str
    conversation_id: str
    customer_id: str
    created_at: str
    status: str = "pending"  # pending, in_progress, resolved
    reason: str
    intent: str
    urgency: str = "normal"
    customer_profile: Dict[str, Any] = Field(default_factory=dict)
    full_transcript: List[Dict[str, str]] = Field(default_factory=list)
    actions_performed: List[Dict[str, Any]] = Field(default_factory=list)
    retrieved_knowledge_sources: List[str] = Field(default_factory=list)
    human_notes: Optional[str] = None
    resolved_at: Optional[str] = None


class ResolveEscalationRequest(BaseModel):
    human_agent_id: str = "agent_human_1"
    notes: str
