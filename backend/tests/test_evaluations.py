import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app

client = TestClient(app)


def test_evaluations_run_and_fetch():
    # 1. Run Evaluation Benchmark Suite
    run_res = client.post("/api/evaluations/run")
    assert run_res.status_code == 200
    data = run_res.json()

    assert "eval_id" in data
    assert data["total_cases"] >= 4
    assert "asr" in data
    assert "rag" in data
    assert "agent" in data
    assert "voice" in data
    assert data["asr"]["word_error_rate"] >= 0.0
    assert data["agent"]["routing_accuracy"] > 0.5

    # 2. Fetch Latest Evaluation Report
    latest_res = client.get("/api/evaluations/latest")
    assert latest_res.status_code == 200
    latest_data = latest_res.json()
    assert latest_data["eval_id"] == data["eval_id"]
