import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app
from services.memory_service import memory_service
from services.observability import observability_service

client = TestClient(app)


def test_conversational_memory_persistence():
    conv_id = "conv_test_mem_1"
    memory_service.add_message(conv_id, "user", "Hello, I am asking about order ORD-8842.")
    memory_service.add_message(conv_id, "assistant", "Sure, order ORD-8842 is processing.")

    history = memory_service.get_history(conv_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"


def test_escalation_api_workflow():
    # 1. Trigger human escalation via voice interaction
    payload = {
        "text_input": "I need to talk to a human supervisor immediately!",
        "customer_id": "cust_1001",
        "asr_provider": "mock",
        "tts_provider": "mock"
    }
    interact_res = client.post("/api/voice/interact", json=payload)
    assert interact_res.status_code == 200
    assert interact_res.json()["active_agent"] == "escalation_agent"

    # 2. List escalations via API
    list_res = client.get("/api/escalations")
    assert list_res.status_code == 200
    escalations = list_res.json()
    assert len(escalations) >= 1
    target_esc = escalations[0]
    esc_id = target_esc["escalation_id"]
    assert target_esc["status"] == "pending"

    # 3. Resolve escalation
    resolve_payload = {
        "human_agent_id": "human_rep_99",
        "notes": "Spoke directly with customer Alex Mercer and resolved order query."
    }
    res_resolve = client.post(f"/api/escalations/{esc_id}/resolve", json=resolve_payload)
    assert res_resolve.status_code == 200
    res_data = res_resolve.json()
    assert res_data["status"] == "resolved"
    assert res_data["human_notes"] == resolve_payload["notes"]


def test_observability_trace_logging():
    trace = observability_service.log_interaction_trace(
        conversation_id="conv_obs_1",
        user_message="Check order status",
        active_agent="operations_agent",
        ai_response="Order is processing",
        tool_calls=[{"name": "get_order"}],
        latency_ms={"total_latency_ms": 250.0},
    )
    assert trace["status"] == "success"
    assert trace["active_agent"] == "operations_agent"
