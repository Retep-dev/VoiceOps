import time
import httpx
from providers.asr.base import BaseASRProvider
from models.voice import ASRResponse, ASRMetadata
from core.config import get_settings


class WhisperASRProvider(BaseASRProvider):
    """OpenAI Whisper ASR Provider."""

    def __init__(self, api_key: str = None):
        settings = get_settings()
        self.api_key = api_key or settings.openai_api_key

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> ASRResponse:
        start_time = time.time()

        if not self.api_key or self.api_key == "your_openai_api_key_here":
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return ASRResponse(
                transcript="[OpenAI Whisper API Key missing - Mock Fallback] Where is my order refund?",
                metadata=ASRMetadata(
                    provider="whisper-fallback",
                    language="en",
                    confidence=0.96,
                    duration_seconds=2.0,
                    processing_ms=elapsed_ms,
                    model="whisper-1",
                )
            )

        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        files = {"file": (filename, audio_bytes, "audio/wav")}
        data = {"model": "whisper-1"}

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=headers, files=files, data=data)
            res.raise_for_status()
            res_json = res.json()

        transcript = res_json.get("text", "")
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return ASRResponse(
            transcript=transcript,
            metadata=ASRMetadata(
                provider="whisper",
                language="en",
                confidence=0.99,
                duration_seconds=0.0,
                processing_ms=elapsed_ms,
                model="whisper-1",
            )
        )
