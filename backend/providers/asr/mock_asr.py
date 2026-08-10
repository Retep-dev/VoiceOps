import time
from providers.asr.base import BaseASRProvider
from models.voice import ASRResponse, ASRMetadata


class MockASRProvider(BaseASRProvider):
    """Offline/Testing ASR Provider returning realistic deterministic transcripts."""

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> ASRResponse:
        start_time = time.time()
        
        # Deterministic sample transcript for testing & demo purposes
        sample_transcript = "I was charged for my order ORD-8842 but it is not showing up in my account."
        
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return ASRResponse(
            transcript=sample_transcript,
            metadata=ASRMetadata(
                provider="mock",
                language="en-US",
                confidence=0.98,
                duration_seconds=3.2,
                processing_ms=elapsed_ms,
                model="mock-asr-v1",
            )
        )
