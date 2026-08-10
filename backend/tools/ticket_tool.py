import uuid
import datetime
from typing import Dict, Any
from tools.base import BaseTool
from models.tools import TicketResult


class CreateTicketTool(BaseTool):
    """Tool to create support tickets when escalation or offline follow-up is needed."""

    def __init__(self):
        super().__init__(
            name="create_support_ticket",
            description="Creates a new customer support ticket in the support queue.",
            is_write_operation=True,
        )

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "customer_id": {
                    "type": "string",
                    "description": "Customer ID associated with the ticket",
                },
                "subject": {
                    "type": "string",
                    "description": "Brief subject of the support issue",
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the customer request",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "normal", "high", "urgent"],
                    "description": "Urgency priority level",
                },
            },
            "required": ["customer_id", "subject", "description"],
        }

    async def execute(
        self, customer_id: str, subject: str, description: str, priority: str = "normal", **kwargs
    ) -> Dict[str, Any]:
        ticket_id = f"TCK-{uuid.uuid4().hex[:6].upper()}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        ticket = TicketResult(
            ticket_id=ticket_id,
            customer_id=customer_id,
            subject=subject,
            priority=priority,
            status="open",
            created_at=now_iso,
        )

        return ticket.model_dump()
