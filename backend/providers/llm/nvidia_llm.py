from openai import OpenAI
from providers.llm.base import BaseLLMProvider
from core.config import get_settings
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class NvidiaLLMProvider(BaseLLMProvider):
    """NVIDIA AI API Provider using OpenAI-compatible client (LLaMA 3.1 70B Instruct)."""

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.nvidia_api_key
        self.base_url = settings.nvidia_base_url
        self.model = settings.nvidia_model
        
        self.client = None
        if self.api_key and self.api_key != "your_nvidia_api_key_here":
            try:
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except Exception as e:
                logger.error(f"Failed to initialize NVIDIA OpenAI client: {e}")

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        if not self.client:
            # Fallback mock response for offline/keyless local development
            user_msg = messages[-1]["content"] if messages else ""
            return {
                "content": f"[NVIDIA API Key missing - Mock Response] I received your request: '{user_msg}'. How else can I assist you with your account?",
                "tool_calls": [],
                "finish_reason": "stop"
            }

        try:
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = "auto"

            response = self.client.chat.completions.create(**kwargs)
            choice = response.choices[0]

            tool_calls = []
            if choice.message.tool_calls:
                tool_calls = [
                    {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    }
                    for tc in choice.message.tool_calls
                ]

            return {
                "content": choice.message.content or "",
                "tool_calls": tool_calls,
                "finish_reason": choice.finish_reason,
            }
        except Exception as e:
            logger.error(f"NVIDIA LLM API call error: {e}")
            return {
                "content": f"I apologize, I am experiencing a temporary technical issue connecting to our language processing system.",
                "tool_calls": [],
                "finish_reason": "error",
            }
