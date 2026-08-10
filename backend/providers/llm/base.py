from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any


class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Providers."""

    @abstractmethod
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Generates chat completion with tool calling support."""
        pass
