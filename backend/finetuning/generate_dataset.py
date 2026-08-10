import json
from pathlib import Path
from typing import List, Dict


INTENT_DATASET_SAMPLES: List[Dict[str, str]] = [
    {"text": "I was charged for my order but it is not showing up in my account.", "intent": "payment_issue"},
    {"text": "Why was my card billed twice for order ORD-8842?", "intent": "payment_issue"},
    {"text": "Where is my package? The tracking link isn't updating.", "intent": "order_tracking"},
    {"text": "Can you check the delivery status of order ORD-9921?", "intent": "order_tracking"},
    {"text": "I want a full refund for my damaged item.", "intent": "refund_request"},
    {"text": "How do I return this headphones for a refund?", "intent": "refund_request"},
    {"text": "What is your return policy window for items?", "intent": "policy_inquiry"},
    {"text": "Are software licenses eligible for warranty coverage?", "intent": "policy_inquiry"},
    {"text": "Let me speak to a human representative right away.", "intent": "human_escalation"},
    {"text": "Connect me to a supervisor, your bot isn't helping.", "intent": "human_escalation"},
]


def generate_synthetic_intent_dataset(output_file: str = "intent_dataset.json") -> str:
    """Generates a structured JSON dataset for fine-tuning specialized intent classification models."""
    out_path = Path(__file__).parent / output_file
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(INTENT_DATASET_SAMPLES, f, indent=2)
    return str(out_path)


if __name__ == "__main__":
    path = generate_synthetic_intent_dataset()
    print(f"Generated synthetic intent dataset at: {path}")
