from typing import List, Dict, Any
from models.agent import RouterDecision
from providers.llm.nvidia_llm import NvidiaLLMProvider
import json
import logging

logger = logging.getLogger(__name__)


class RouterAgent:
    """Supervisor Router Agent classifying user intent & urgency to route to specialist nodes."""

    def __init__(self):
        self.llm = NvidiaLLMProvider()

    async def route(
        self, user_message: str, conversation_history: List[Dict[str, str]]
    ) -> RouterDecision:
        msg_lower = user_message.lower()

        # Rule-based fast heuristic fallback for high confidence patterns
        if any(term in msg_lower for term in ["human", "representative", "agent", "supervisor", "speak to a person"]):
            return RouterDecision(
                selected_agent="escalation",
                intent="explicit_human_request",
                urgency="high",
                confidence=1.0,
                reasoning="Customer explicitly requested human agent.",
            )
        elif any(term in msg_lower for term in ["order", "refund", "track", "delivery", "ord-"]):
            return RouterDecision(
                selected_agent="operations",
                intent="order_ops",
                urgency="normal",
                confidence=0.95,
                reasoning="Detected order or refund operation keywords.",
            )
        elif any(term in msg_lower for term in ["account", "profile", "tier", "email", "cust-"]):
            return RouterDecision(
                selected_agent="customer",
                intent="customer_account",
                urgency="normal",
                confidence=0.92,
                reasoning="Detected customer account profile query.",
            )
        elif any(term in msg_lower for term in ["policy", "return", "warranty", "shipping", "how to"]):
            return RouterDecision(
                selected_agent="knowledge",
                intent="knowledge_rag",
                urgency="normal",
                confidence=0.90,
                reasoning="Detected company policy or product documentation question.",
            )

        # Default fallback to knowledge agent
        return RouterDecision(
            selected_agent="knowledge",
            intent="general_inquiry",
            urgency="normal",
            confidence=0.85,
            reasoning="Default routing to Knowledge Agent.",
        )


router_agent = RouterAgent()
