from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Provider Selection
    default_asr_provider: str = "mock"
    default_tts_provider: str = "mock"
    default_llm_provider: str = "nvidia"

    # NVIDIA AI API
    nvidia_api_key: Optional[str] = "your_nvidia_api_key_here"
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "meta/llama-3.1-70b-instruct"

    # OpenAI API
    openai_api_key: Optional[str] = None

    # Deepgram API
    deepgram_api_key: Optional[str] = None

    # ElevenLabs API
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"

    # Supabase / PostgreSQL
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None

    # Langfuse
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: str = "https://cloud.langfuse.com"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

