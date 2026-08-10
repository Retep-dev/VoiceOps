from typing import Dict, Any
from tools.base import BaseTool
from models.tools import OrderDetails


MOCK_ORDERS: Dict[str, OrderDetails] = {
    "ORD-8842": OrderDetails(
        order_id="ORD-8842",
        customer_id="cust_1001",
        status="Processing",
        total_amount=149.99,
        items=["Wireless Noise-Canceling Headphones"],
        tracking_number="TRK-9081234",
        estimated_delivery="Tomorrow by 5 PM",
    ),
    "ORD-9921": OrderDetails(
        order_id="ORD-9921",
        customer_id="cust_1001",
        status="Delivered",
        total_amount=89.50,
        items=["Smart Ergonomic Mouse Pad", "USB-C Fast Charger"],
        tracking_number="TRK-4410982",
        estimated_delivery="Delivered yesterday",
    ),
    "ORD-3310": OrderDetails(
        order_id="ORD-3310",
        customer_id="cust_1002",
        status="In Transit",
        total_amount=299.00,
        items=["4K Ultra HD Monitor Arm"],
        tracking_number="TRK-7712390",
        estimated_delivery="Friday, Aug 14",
    ),
}


class GetOrderTool(BaseTool):
    """Tool to fetch order status, line items, and tracking details."""

    def __init__(self):
        super().__init__(
            name="get_order",
            description="Lookup order details, fulfillment status, line items, and tracking info by order_id.",
            is_write_operation=False,
        )

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "Unique order identifier (e.g. ORD-8842)",
                }
            },
            "required": ["order_id"],
        }

    async def execute(self, order_id: str, **kwargs) -> Dict[str, Any]:
        order = MOCK_ORDERS.get(order_id)
        if not order:
            return {
                "error": True,
                "message": f"Order ID '{order_id}' was not found in the order database.",
                "order_id": order_id,
            }
        return order.model_dump()
