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


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "providers" in data


def test_voice_interact_text_input():
    payload = {
        "text_input": "Where is my recent order ORD-9921?",
        "customer_id": "cust_test_1",
        "asr_provider": "mock",
        "tts_provider": "mock"
    }
    response = client.post("/api/voice/interact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "conversation_id" in data
    assert data["transcript"] == "Where is my recent order ORD-9921?"
    assert len(data["ai_response_text"]) > 0
    assert len(data["audio_base64"]) > 0
    assert "latency_breakdown_ms" in data


def test_voice_interact_audio_input():
    import base64
    mock_audio = base64.b64encode(b"RIFF-mock-wav-header-data").decode("utf-8")
    payload = {
        "audio_base64": mock_audio,
        "customer_id": "cust_test_2",
        "asr_provider": "mock",
        "tts_provider": "mock"
    }
    response = client.post("/api/voice/interact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["asr_metadata"]["provider"] == "mock"
    assert data["tts_metadata"]["provider"] == "mock"
