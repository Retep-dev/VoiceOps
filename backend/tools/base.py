from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseTool(ABC):
    """Abstract Base Class for VoiceOps Agent Tools with strict schema validation."""

    def __init__(self, name: str, description: str, is_write_operation: bool = False):
        self.name = name
        self.description = description
        self.is_write_operation = is_write_operation

    @property
    @abstractmethod
    def parameters_schema(self) -> Dict[str, Any]:
        """Returns OpenAI function tool JSON schema specification."""
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Executes the tool logic asynchronously and returns structured dictionary result."""
        pass

    def to_openai_tool(self) -> Dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters_schema,
            }
        }
