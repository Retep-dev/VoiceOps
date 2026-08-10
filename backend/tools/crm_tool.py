from typing import Dict, Any
from tools.base import BaseTool
from models.tools import CustomerProfile


# Realistic CRM database mock records
MOCK_CUSTOMERS: Dict[str, CustomerProfile] = {
    "cust_1001": CustomerProfile(
        customer_id="cust_1001",
        name="Alex Mercer",
        email="alex.mercer@example.com",
        tier="VIP Gold",
        open_tickets=0,
        recent_order_ids=["ORD-8842", "ORD-9921"],
    ),
    "cust_1002": CustomerProfile(
        customer_id="cust_1002",
        name="Sarah Connor",
        email="sarah.connor@example.com",
        tier="Standard",
        open_tickets=1,
        recent_order_ids=["ORD-3310"],
    ),
}


class GetCustomerTool(BaseTool):
    """Tool to fetch customer profile, tier status, and recent order IDs."""

    def __init__(self):
        super().__init__(
            name="get_customer",
            description="Fetches customer account profile, subscription tier, and recent order history by customer_id.",
            is_write_operation=False,
        )

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "customer_id": {
                    "type": "string",
                    "description": "Unique customer ID (e.g. cust_1001)",
                }
            },
            "required": ["customer_id"],
        }

    async def execute(self, customer_id: str = "cust_1001", **kwargs) -> Dict[str, Any]:
        profile = MOCK_CUSTOMERS.get(customer_id)
        if not profile:
            # Fallback customer default
            profile = CustomerProfile(
                customer_id=customer_id,
                name="Valued Customer",
                email=f"{customer_id}@example.com",
                tier="Standard",
                open_tickets=0,
                recent_order_ids=["ORD-8842"],
            )

        return profile.model_dump()
