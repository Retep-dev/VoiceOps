import time
import base64
from providers.tts.base import BaseTTSProvider
from models.voice import TTSResponse, TTSMetadata


class MockTTSProvider(BaseTTSProvider):
    """Offline/Testing TTS Provider returning mock silent MP3 audio bytes."""

    async def synthesize(self, text: str, voice_id: str = "default") -> TTSResponse:
        start_time = time.time()
        
        # A tiny valid 1-frame silent MP3 audio header byte sequence
        mock_mp3_bytes = (
            b'\xff\xe3\x18\xc4\x00\x00\x00\x03\x48\x00\x00\x00\x00'
            b'MPEG-Mock-Audio-Bytes-VoiceOps-Demo'
        )
        audio_b64 = base64.b64encode(mock_mp3_bytes).decode("utf-8")
        
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return TTSResponse(
            audio_base64=audio_b64,
            audio_format="mp3",
            metadata=TTSMetadata(
                provider="mock",
                voice_id=voice_id,
                audio_format="mp3",
                processing_ms=elapsed_ms,
            )
        )
