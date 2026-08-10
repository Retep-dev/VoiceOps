import time
import httpx
from providers.asr.base import BaseASRProvider
from models.voice import ASRResponse, ASRMetadata
from core.config import get_settings


class DeepgramASRProvider(BaseASRProvider):
    """Deepgram Nova-2 ASR Provider via REST API."""

    def __init__(self, api_key: str = None):
        settings = get_settings()
        self.api_key = api_key or settings.deepgram_api_key

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> ASRResponse:
        start_time = time.time()
        
        if not self.api_key or self.api_key == "your_deepgram_api_key_here":
            # Fall back safely if API key is not configured
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return ASRResponse(
                transcript="[Deepgram API Key missing - Mock Fallback] I need assistance with my recent booking.",
                metadata=ASRMetadata(
                    provider="deepgram-fallback",
                    language="en",
                    confidence=0.95,
                    duration_seconds=2.5,
                    processing_ms=elapsed_ms,
                    model="nova-2-general",
                )
            )

        url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_formatting=true&punctuate=true"
        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "audio/wav"
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, headers=headers, content=audio_bytes)
            res.raise_for_status()
            data = res.json()

        results = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0]
        transcript = results.get("transcript", "")
        confidence = results.get("confidence", 0.99)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return ASRResponse(
            transcript=transcript,
            metadata=ASRMetadata(
                provider="deepgram",
                language="en",
                confidence=confidence,
                duration_seconds=data.get("metadata", {}).get("duration", 0.0),
                processing_ms=elapsed_ms,
                model="nova-2",
            )
        )
