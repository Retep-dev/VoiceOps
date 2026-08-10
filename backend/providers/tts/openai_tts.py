import time
import base64
import httpx
from providers.tts.base import BaseTTSProvider
from models.voice import TTSResponse, TTSMetadata
from core.config import get_settings


class OpenAITTSProvider(BaseTTSProvider):
    """OpenAI TTS Provider (tts-1 model)."""

    def __init__(self, api_key: str = None):
        settings = get_settings()
        self.api_key = api_key or settings.openai_api_key

    async def synthesize(self, text: str, voice_id: str = "alloy") -> TTSResponse:
        start_time = time.time()
        voice_name = voice_id if voice_id != "default" else "alloy"

        if not self.api_key or self.api_key == "your_openai_api_key_here":
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            mock_bytes = b'MPEG-OpenAI-TTS-Fallback'
            return TTSResponse(
                audio_base64=base64.b64encode(mock_bytes).decode("utf-8"),
                audio_format="mp3",
                metadata=TTSMetadata(
                    provider="openai-tts-fallback",
                    voice_id=voice_name,
                    audio_format="mp3",
                    processing_ms=elapsed_ms,
                )
            )

        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "tts-1",
            "input": text,
            "voice": voice_name
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            audio_bytes = res.content

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return TTSResponse(
            audio_base64=audio_b64,
            audio_format="mp3",
            metadata=TTSMetadata(
                provider="openai-tts",
                voice_id=voice_name,
                audio_format="mp3",
                processing_ms=elapsed_ms,
            )
        )
