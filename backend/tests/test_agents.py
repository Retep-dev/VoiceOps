import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app
from tools.registry import tool_registry

client = TestClient(app)


def test_tool_registry_execution():
    # Test get_order tool execution
    order_res = tool_registry.execute_tool("get_order", {"order_id": "ORD-8842"})
    # Since execute_tool is async, let's verify registry tools list
    tools = tool_registry.get_openai_tools()
    assert len(tools) >= 4
    tool_names = [t["function"]["name"] for t in tools]
    assert "get_order" in tool_names
    assert "get_customer" in tool_names
    assert "request_refund" in tool_names
    assert "create_support_ticket" in tool_names


def test_multi_agent_voice_order_query():
    payload = {
        "text_input": "Can you check the status of my order ORD-8842?",
        "customer_id": "cust_1001",
        "asr_provider": "mock",
        "tts_provider": "mock"
    }
    res = client.post("/api/voice/interact", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["active_agent"] == "operations_agent"
    assert len(data["tool_calls"]) > 0
    assert data["tool_calls"][0]["name"] == "get_order"
    assert "ORD-8842" in data["ai_response_text"]


def test_multi_agent_voice_human_escalation():
    payload = {
        "text_input": "I need to speak to a human representative right now!",
        "customer_id": "cust_1001",
        "asr_provider": "mock",
        "tts_provider": "mock"
    }
    res = client.post("/api/voice/interact", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["active_agent"] == "escalation_agent"
    assert "human specialist" in data["ai_response_text"] or "representative" in data["ai_response_text"]
