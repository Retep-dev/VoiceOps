from typing import List, Dict, Any
from agents.base import BaseAgent
from models.agent import AgentResponse
from models.rag import RAGQueryRequest
from services.rag.retrieval import rag_store


class KnowledgeAgent(BaseAgent):
    """Specialist Agent handling enterprise policies, product FAQs, and documentation via RAG."""

    def __init__(self):
        super().__init__(
            name="knowledge_agent",
            description="Answers FAQs, policy questions, and product documentation using enterprise RAG context.",
        )

    async def process(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> AgentResponse:
        # Step 1: Query RAG engine for hybrid vector + BM25 context
        rag_request = RAGQueryRequest(query=user_message, top_k=3, rerank=True)
        rag_res = rag_store.query(rag_request)

        # Step 2: Build grounded LLM prompt
        system_prompt = (
            "You are the VoiceOps Knowledge Agent. Answer the customer's question strictly using the provided Enterprise Knowledge Context below.\n"
            "Keep your response concise, polite, and under 3 sentences for natural text-to-speech rendering.\n"
            "If the context does not contain the answer, politely state that you do not have that specific information and offer to connect them to a specialist.\n\n"
            f"--- ENTERPRISE KNOWLEDGE CONTEXT ---\n{rag_res.context_text}\n--- END CONTEXT ---"
        )

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history[-4:] if conversation_history else [])
        messages.append({"role": "user", "content": user_message})

        llm_res = await self.llm.chat_completion(messages)
        content = llm_res.get("content", "I searched our documentation but could not locate relevant details.")

        return AgentResponse(
            agent_name=self.name,
            content=content,
            tool_calls=[],
            tool_results=[{"rag_retrieval_ms": rag_res.retrieval_ms, "citations": [c.model_dump() for c in rag_res.citations]}],
            escalate_to_human=False,
        )


knowledge_agent = KnowledgeAgent()
