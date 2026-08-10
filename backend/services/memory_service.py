from typing import List, Dict, Any, Optional
import datetime


class ConversationalMemoryService:
    """Manages short-term conversation context and customer long-term interaction history."""

    def __init__(self):
        # In-memory storage for active conversations
        self.conversations: Dict[str, List[Dict[str, str]]] = {}
        self.customer_memory_facts: Dict[str, List[str]] = {
            "cust_1001": [
                "Customer prefers email updates for tracking.",
                "Previous order ORD-8842 had delayed delivery inquiry.",
            ]
        }

    def add_message(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        self.conversations[conversation_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

    def get_history(self, conversation_id: str, limit: int = 6) -> List[Dict[str, str]]:
        history = self.conversations.get(conversation_id, [])
        # Return sliding window of recent formatted turns
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in history[-limit:]
        ]

    def get_long_term_facts(self, customer_id: str) -> List[str]:
        return self.customer_memory_facts.get(customer_id, [])

    def add_long_term_fact(self, customer_id: str, fact: str):
        if customer_id not in self.customer_memory_facts:
            self.customer_memory_facts[customer_id] = []
        self.customer_memory_facts[customer_id].append(fact)


memory_service = ConversationalMemoryService()
