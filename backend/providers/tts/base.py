from abc import ABC, abstractmethod
from models.voice import TTSResponse


class BaseTTSProvider(ABC):
    """Abstract Base Class for Text-to-Speech (TTS) Providers."""

    @abstractmethod
    async def synthesize(self, text: str, voice_id: str = "default") -> TTSResponse:
        """Converts text into audio bytes (returned as base64 string) with metadata."""
        pass
