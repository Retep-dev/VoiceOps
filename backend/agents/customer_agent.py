from typing import List, Dict, Any
from agents.base import BaseAgent
from models.agent import AgentResponse
from tools.registry import tool_registry


class CustomerAgent(BaseAgent):
    """Specialist Agent handling customer account, tier status, and CRM lookups."""

    def __init__(self):
        super().__init__(
            name="customer_agent",
            description="Fetches customer account details, tier status, and open tickets.",
        )

    async def process(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> AgentResponse:
        customer_id = context.get("customer_id", "cust_1001")
        profile = await tool_registry.execute_tool("get_customer", {"customer_id": customer_id})

        system_prompt = (
            "You are the VoiceOps Customer Account Specialist. Help the customer with their profile, account tier, or subscription inquiries.\n"
            "Keep responses friendly, clear, and under 3 sentences for speech output.\n"
            f"Customer Profile Data: {profile}"
        )

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history[-4:] if conversation_history else [])
        messages.append({"role": "user", "content": user_message})

        llm_res = await self.llm.chat_completion(messages)
        content = llm_res.get("content", f"Hello {profile.get('name', 'Customer')}, your account status is active under the {profile.get('tier', 'Standard')} tier.")

        return AgentResponse(
            agent_name=self.name,
            content=content,
            tool_calls=[{"name": "get_customer", "arguments": {"customer_id": customer_id}}],
            tool_results=[profile],
            escalate_to_human=False,
        )


customer_agent = CustomerAgent()
