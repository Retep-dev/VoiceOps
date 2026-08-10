import time
import base64
import httpx
from providers.tts.base import BaseTTSProvider
from models.voice import TTSResponse, TTSMetadata
from core.config import get_settings


class ElevenLabsTTSProvider(BaseTTSProvider):
    """ElevenLabs TTS Provider using REST API."""

    def __init__(self, api_key: str = None, voice_id: str = None):
        settings = get_settings()
        self.api_key = api_key or settings.elevenlabs_api_key
        self.default_voice_id = voice_id or settings.elevenlabs_voice_id

    async def synthesize(self, text: str, voice_id: str = "default") -> TTSResponse:
        start_time = time.time()
        active_voice = voice_id if voice_id != "default" else self.default_voice_id

        if not self.api_key or self.api_key == "your_elevenlabs_api_key_here":
            # Fall back safely if API key missing
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            mock_mp3_bytes = b'MPEG-ElevenLabs-Fallback-Audio'
            return TTSResponse(
                audio_base64=base64.b64encode(mock_mp3_bytes).decode("utf-8"),
                audio_format="mp3",
                metadata=TTSMetadata(
                    provider="elevenlabs-fallback",
                    voice_id=active_voice,
                    audio_format="mp3",
                    processing_ms=elapsed_ms,
                )
            )

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{active_voice}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
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
                provider="elevenlabs",
                voice_id=active_voice,
                audio_format="mp3",
                processing_ms=elapsed_ms,
            )
        )
