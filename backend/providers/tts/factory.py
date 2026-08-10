from providers.tts.base import BaseTTSProvider
from providers.tts.mock_tts import MockTTSProvider
from providers.tts.elevenlabs_tts import ElevenLabsTTSProvider
from providers.tts.openai_tts import OpenAITTSProvider
from core.config import get_settings


def get_tts_provider(provider_name: str = None) -> BaseTTSProvider:
    """Factory method to return the selected TTS Provider instance."""
    settings = get_settings()
    name = (provider_name or settings.default_tts_provider).lower()

    if name == "elevenlabs":
        return ElevenLabsTTSProvider()
    elif name == "openai":
        return OpenAITTSProvider()
    else:
        return MockTTSProvider()
