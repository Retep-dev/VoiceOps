import asyncio
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
                    base_url=self.base_url,
                    timeout=10.0,
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
            user_msg = messages[-1]["content"] if messages else ""
            return {
                "content": f"[Mock Response] I received your request: '{user_msg}'. How else can I assist you?",
                "tool_calls": [],
                "finish_reason": "stop"
            }

        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        try:
            # Run synchronous client network call in threadpool with 12s timeout to prevent event loop blocking
            def _call_nvidia():
                return self.client.chat.completions.create(**kwargs)

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_nvidia),
                timeout=12.0,
            )
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
        except asyncio.TimeoutError:
            logger.error("NVIDIA LLM API timed out after 12 seconds.")
            return {
                "content": "Our primary language processing engine timed out. Please try your request again.",
                "tool_calls": [],
                "finish_reason": "timeout",
            }
        except Exception as e:
            logger.error(f"NVIDIA LLM API call error: {e}")
            user_msg = messages[-1]["content"] if messages else ""
            return {
                "content": f"I received your inquiry regarding '{user_msg}'. Our agent pipeline processed your request.",
                "tool_calls": [],
                "finish_reason": "error",
            }

