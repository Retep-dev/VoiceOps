from abc import ABC, abstractmethod
from models.voice import ASRResponse


class BaseASRProvider(ABC):
    """Abstract Base Class for Automatic Speech Recognition (ASR) Providers."""

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> ASRResponse:
        """Converts audio bytes into a transcript with metadata."""
        pass
