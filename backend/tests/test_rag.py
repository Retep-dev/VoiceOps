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


def test_rag_ingest_and_query():
    # 1. Ingest sample policy document
    sample_policy_content = (
        "VoiceOps Enterprise Return Policy:\n"
        "Customers can return eligible items within 30 days of delivery for a full refund.\n"
        "To initiate a return, contact support with your order ID (e.g., ORD-9921).\n"
        "Refunds are processed to the original payment method within 3 to 5 business days.\n"
        "Customized or digital software items are non-refundable under standard policy terms."
    )

    files = {
        "file": ("return_policy.txt", sample_policy_content.encode("utf-8"), "text/plain")
    }

    ingest_res = client.post("/api/knowledge/upload", files=files)
    assert ingest_res.status_code == 200
    ingest_data = ingest_res.json()
    assert ingest_data["status"] == "success"
    assert ingest_data["filename"] == "return_policy.txt"
    assert ingest_data["total_chunks"] >= 1
    doc_id = ingest_data["document_id"]

    # 2. Query Knowledge Base
    query_payload = {
        "query": "What is the return policy window for items and how long do refunds take?",
        "top_k": 2,
        "rerank": True
    }

    query_res = client.post("/api/knowledge/query", json=query_payload)
    assert query_res.status_code == 200
    query_data = query_res.json()
    assert len(query_data["retrieved_chunks"]) > 0
    assert "30 days" in query_data["context_text"] or "refund" in query_data["context_text"]
    assert len(query_data["citations"]) > 0
    assert query_data["citations"][0]["filename"] == "return_policy.txt"

    # 3. List Documents
    list_res = client.get("/api/knowledge/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["document_id"] == doc_id for d in docs)

    # 4. Delete Document
    del_res = client.delete(f"/api/knowledge/documents/{doc_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
