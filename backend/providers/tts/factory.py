from providers.tts.base import BaseTTSProvider
from providers.tts.mock_tts import MockTTSProvider
from providers.tts.elevenlabs_tts import ElevenLabsTTSProvider
from providers.tts.openai_tts import OpenAITTSProvider
from core.config import get_settings


def get_tts_provider(provider_name: str = None) -> BaseTTSProvider:
    """Factory method to return the selected TTS Provider instance."""
    settings = get_settings()
    name = (provider_name or settings.default_tts_provider).lower()

    # Automatically prioritize real ElevenLabs or OpenAI TTS if API key is present in .env
    if name == "elevenlabs" or (settings.elevenlabs_api_key and len(settings.elevenlabs_api_key) > 20 and not settings.elevenlabs_api_key.startswith("your_")):
        return ElevenLabsTTSProvider()
    elif name == "openai" or (settings.openai_api_key and len(settings.openai_api_key) > 20 and not settings.openai_api_key.startswith("your_")):
        return OpenAITTSProvider()
    else:
        return MockTTSProvider()

