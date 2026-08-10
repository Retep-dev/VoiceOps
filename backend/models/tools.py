from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class CustomerProfile(BaseModel):
    customer_id: str
    name: str
    email: str
    tier: str = "Standard"
    open_tickets: int = 0
    recent_order_ids: List[str] = Field(default_factory=list)


class OrderDetails(BaseModel):
    order_id: str
    customer_id: str
    status: str
    total_amount: float
    items: List[str]
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[str] = None


class RefundResult(BaseModel):
    refund_id: str
    order_id: str
    amount: float
    status: str  # approved, requires_approval, rejected
    message: str


class TicketResult(BaseModel):
    ticket_id: str
    customer_id: str
    subject: str
    priority: str
    status: str = "open"
    created_at: str


class ToolExecutionLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]
    execution_ms: float
    is_write: bool
    status: str = "success"
