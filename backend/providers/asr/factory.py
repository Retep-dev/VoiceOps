from providers.asr.base import BaseASRProvider
from providers.asr.mock_asr import MockASRProvider
from providers.asr.deepgram_asr import DeepgramASRProvider
from providers.asr.whisper_asr import WhisperASRProvider
from core.config import get_settings


def get_asr_provider(provider_name: str = None) -> BaseASRProvider:
    """Factory method to return the selected ASR Provider instance."""
    settings = get_settings()
    name = (provider_name or settings.default_asr_provider).lower()

    if name == "deepgram":
        return DeepgramASRProvider()
    elif name == "whisper":
        return WhisperASRProvider()
    else:
        return MockASRProvider()
