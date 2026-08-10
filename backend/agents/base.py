from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models.agent import AgentResponse
from providers.llm.nvidia_llm import NvidiaLLMProvider


class BaseAgent(ABC):
    """Abstract Base Class for VoiceOps Specialist Agents."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.llm = NvidiaLLMProvider()

    @abstractmethod
    async def process(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> AgentResponse:
        """Processes user input within conversation context and returns AgentResponse."""
        pass
