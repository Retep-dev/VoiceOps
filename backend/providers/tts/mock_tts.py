import time
import base64
import struct
import math
from providers.tts.base import BaseTTSProvider
from models.voice import TTSResponse, TTSMetadata


def _generate_audible_wav(duration_s: float = 1.5, freq: float = 440.0, sample_rate: int = 22050) -> bytes:
    """Generates a valid audible 16-bit PCM WAV audio sequence for offline mock TTS rendering."""
    num_samples = int(duration_s * sample_rate)
    data_size = num_samples * 2
    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        36 + data_size,
        b'WAVE',
        b'fmt ',
        16,
        1,  # PCM
        1,  # Mono
        sample_rate,
        sample_rate * 2,
        2,  # Block align
        16,  # Bits per sample
        b'data',
        data_size,
    )
    samples = [struct.pack('<h', int(12000 * math.sin(2 * math.pi * freq * (i / sample_rate)))) for i in range(num_samples)]
    return header + b''.join(samples)


class MockTTSProvider(BaseTTSProvider):
    """Offline/Testing TTS Provider returning valid audible WAV audio bytes."""

    async def synthesize(self, text: str, voice_id: str = "default") -> TTSResponse:
        start_time = time.time()
        
        wav_bytes = _generate_audible_wav(duration_s=1.5, freq=480.0)
        audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")
        
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return TTSResponse(
            audio_base64=audio_b64,
            audio_format="wav",
            metadata=TTSMetadata(
                provider="mock",
                voice_id=voice_id,
                audio_format="wav",
                processing_ms=elapsed_ms,
            )
        )

