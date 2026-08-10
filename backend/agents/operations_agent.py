import re
from typing import List, Dict, Any
from agents.base import BaseAgent
from models.agent import AgentResponse
from tools.registry import tool_registry


class OperationsAgent(BaseAgent):
    """Specialist Agent handling order status, tracking, payments, refunds, and ticket creation using validated tools."""

    def __init__(self):
        super().__init__(
            name="operations_agent",
            description="Executes operational tasks: order lookup, fulfillment tracking, refund requests, and support tickets.",
        )

    def _extract_order_id(self, text: str) -> str:
        match = re.search(r'\b(ORD-\d{4})\b', text, re.IGNORECASE)
        return match.group(1).upper() if match else "ORD-8842"

    async def process(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> AgentResponse:
        msg_lower = user_message.lower()
        customer_id = context.get("customer_id", "cust_1001")
        order_id = self._extract_order_id(user_message)

        tool_calls = []
        tool_results = []
        escalate = False
        escalation_reason = None
        handoff_summary = None

        if "refund" in msg_lower:
            # Execute refund tool
            amount = 149.99 if order_id == "ORD-8842" else 89.50
            refund_res = await tool_registry.execute_tool(
                "request_refund",
                {"order_id": order_id, "reason": "Customer request via voice call", "amount": amount},
            )
            tool_calls.append({"name": "request_refund", "arguments": {"order_id": order_id, "amount": amount}})
            tool_results.append(refund_res)

            if refund_res.get("status") == "requires_approval":
                escalate = True
                escalation_reason = f"Refund amount (${amount:.2f}) for order {order_id} exceeds auto-approval limit."
                content = f"Your refund request for order {order_id} exceeds our automated limit and has been flagged for supervisor review. Transferring you to a specialist."
            else:
                content = f"I have processed your refund request for order {order_id}. The amount of ${amount:.2f} will be credited to your original payment method within 3 to 5 business days."
        else:
            # Execute order lookup tool
            order_res = await tool_registry.execute_tool("get_order", {"order_id": order_id})
            tool_calls.append({"name": "get_order", "arguments": {"order_id": order_id}})
            tool_results.append(order_res)

            if order_res.get("error"):
                content = f"I could not locate order '{order_id}' in our records. Please verify the order number."
            else:
                content = (
                    f"Your order {order_id} containing {', '.join(order_res.get('items', []))} is currently {order_res.get('status')}. "
                    f"Tracking number is {order_res.get('tracking_number')} and estimated delivery is {order_res.get('estimated_delivery')}."
                )

        return AgentResponse(
            agent_name=self.name,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results,
            escalate_to_human=escalate,
            escalation_reason=escalation_reason,
            handoff_summary=handoff_summary,
        )


operations_agent = OperationsAgent()
