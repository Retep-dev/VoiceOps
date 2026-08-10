import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app
from finetuning.generate_dataset import generate_synthetic_intent_dataset
from finetuning.eval_finetuning import evaluate_baseline_vs_finetuned

client = TestClient(app)


def test_websocket_streaming_and_barge_in():
    with client.websocket_connect("/api/voice/stream") as websocket:
        # 1. Send normal text chunk frame
        websocket.send_json({
            "type": "text_chunk",
            "text_input": "Where is my order ORD-8842?",
            "customer_id": "cust_1001"
        })
        response = websocket.receive_json()
        assert response["event"] == "response_frame"
        assert response["active_agent"] == "operations_agent"
        assert len(response["tool_calls"]) > 0

        # 2. Send barge-in signal
        websocket.send_json({"type": "barge_in"})
        barge_response = websocket.receive_json()
        assert barge_response["event"] == "interrupted"
        assert barge_response["status"] == "stopped"


def test_finetuning_dataset_and_eval():
    dataset_file = generate_synthetic_intent_dataset()
    assert Path(dataset_file).exists()

    report = evaluate_baseline_vs_finetuned()
    assert report["metrics"]["finetuned_accuracy"] > report["metrics"]["baseline_accuracy"]
    assert report["metrics"]["finetuned_latency_ms"] < report["metrics"]["baseline_latency_ms"]
