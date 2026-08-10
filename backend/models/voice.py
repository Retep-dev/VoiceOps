from pydantic import BaseModel, Field
from typing import Optional, List


class ASRMetadata(BaseModel):
    provider: str
    language: str = "en-US"
    confidence: float = 1.0
    duration_seconds: float = 0.0
    processing_ms: float = 0.0
    model: Optional[str] = None


class ASRResponse(BaseModel):
    transcript: str
    metadata: ASRMetadata


class TTSMetadata(BaseModel):
    provider: str
    voice_id: str = "default"
    audio_format: str = "mp3"
    processing_ms: float = 0.0


class TTSResponse(BaseModel):
    audio_base64: str
    audio_format: str = "mp3"
    metadata: TTSMetadata


class VoiceInteractionRequest(BaseModel):
    audio_base64: Optional[str] = None
    text_input: Optional[str] = None
    customer_id: Optional[str] = "cust_1001"
    conversation_id: Optional[str] = None
    asr_provider: Optional[str] = None
    tts_provider: Optional[str] = None


class VoiceInteractionResponse(BaseModel):
    conversation_id: str
    transcript: str
    ai_response_text: str
    audio_base64: str
    active_agent: str
    tool_calls: List[dict] = Field(default_factory=list)
    asr_metadata: ASRMetadata
    tts_metadata: TTSMetadata
    latency_breakdown_ms: dict = Field(default_factory=dict)
