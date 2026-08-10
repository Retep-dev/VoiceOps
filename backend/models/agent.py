from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class RouterDecision(BaseModel):
    selected_agent: str  # knowledge, customer, operations, escalation
    intent: str
    urgency: str = "normal"  # normal, high, critical
    confidence: float = 1.0
    reasoning: str


class AgentResponse(BaseModel):
    agent_name: str
    content: str
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    tool_results: List[Dict[str, Any]] = Field(default_factory=list)
    escalate_to_human: bool = False
    escalation_reason: Optional[str] = None
    handoff_summary: Optional[Dict[str, Any]] = None
