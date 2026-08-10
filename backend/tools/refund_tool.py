import uuid
from typing import Dict, Any
from tools.base import BaseTool
from models.tools import RefundResult


class RequestRefundTool(BaseTool):
    """Tool to request order refunds with high-risk confirmation threshold."""

    def __init__(self):
        super().__init__(
            name="request_refund",
            description="Initiate a refund request for an order with specified reason and amount.",
            is_write_operation=True,
        )

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The order ID to refund (e.g., ORD-8842)",
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for the refund request",
                },
                "amount": {
                    "type": "number",
                    "description": "Dollar amount requested for refund",
                },
            },
            "required": ["order_id", "reason", "amount"],
        }

    async def execute(self, order_id: str, reason: str, amount: float, **kwargs) -> Dict[str, Any]:
        refund_id = f"ref_{uuid.uuid4().hex[:8]}"

        # High risk threshold check (e.g. refunds > $150 require human approval)
        if amount > 150.0:
            result = RefundResult(
                refund_id=refund_id,
                order_id=order_id,
                amount=amount,
                status="requires_approval",
                message=f"Refund request of ${amount:.2f} exceeds instant auto-approval limit ($150.00). Flagged for supervisor review.",
            )
        else:
            result = RefundResult(
                refund_id=refund_id,
                order_id=order_id,
                amount=amount,
                status="approved",
                message=f"Refund of ${amount:.2f} for order {order_id} approved. Funds will credit in 3-5 business days.",
            )

        return result.model_dump()
