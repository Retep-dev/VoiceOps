import datetime
from typing import List, Dict, Any
from agents.base import BaseAgent
from models.agent import AgentResponse


class EscalationAgent(BaseAgent):
    """Specialist Agent handling human transfers and generating structured handoff summaries."""

    def __init__(self):
        super().__init__(
            name="escalation_agent",
            description="Prepares structured customer handoff dossiers for human support team transfer.",
        )

    async def process(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> AgentResponse:
        customer_id = context.get("customer_id", "cust_1001")
        conv_id = context.get("conversation_id", "conv_unknown")
        reason = context.get("escalation_reason", "Customer request or high-complexity case.")
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Build comprehensive structured handoff dossier
        handoff_dossier = {
            "conversation_id": conv_id,
            "customer_id": customer_id,
            "escalated_at": now_iso,
            "reason": reason,
            "latest_user_speech": user_message,
            "conversation_length": len(conversation_history) + 1,
            "suggested_human_action": "Review order history and speak directly with customer regarding issue.",
        }

        content = "I understand you need assistance from a human specialist. I have created a priority transfer ticket with your conversation summary and am routing your call to the next available representative."

        return AgentResponse(
            agent_name=self.name,
            content=content,
            tool_calls=[],
            tool_results=[],
            escalate_to_human=True,
            escalation_reason=reason,
            handoff_summary=handoff_dossier,
        )


escalation_agent = EscalationAgent()
