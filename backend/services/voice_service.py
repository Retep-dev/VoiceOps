import time
import base64
import uuid
from typing import Optional
from models.voice import (
    VoiceInteractionRequest,
    VoiceInteractionResponse,
    ASRResponse,
    TTSResponse,
)
from providers.asr.factory import get_asr_provider
from providers.tts.factory import get_tts_provider
from providers.llm.nvidia_llm import NvidiaLLMProvider


class VoiceService:
    """Orchestrates end-to-end audio ingestion, ASR transcription, LLM generation, and TTS synthesis."""

    def __init__(self):
        self.llm_provider = NvidiaLLMProvider()

    async def process_voice_interaction(self, request: VoiceInteractionRequest) -> VoiceInteractionResponse:
        total_start = time.time()
        conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:10]}"

        # Step 1: Obtain user text input directly or via ASR
        asr_start = time.time()
        if request.audio_base64:
            audio_bytes = base64.b64decode(request.audio_base64)
            asr_provider = get_asr_provider(request.asr_provider)
            asr_result: ASRResponse = await asr_provider.transcribe(audio_bytes)
            transcript_text = asr_result.transcript
            asr_metadata = asr_result.metadata
        elif request.text_input:
            transcript_text = request.text_input
            asr_metadata = {
                "provider": "direct-text",
                "language": "en-US",
                "confidence": 1.0,
                "duration_seconds": 0.0,
                "processing_ms": 0.0,
                "model": None,
            }
        else:
            transcript_text = "Hello, I need customer support assistance."
            asr_metadata = {
                "provider": "default-fallback",
                "language": "en-US",
                "confidence": 1.0,
                "duration_seconds": 0.0,
                "processing_ms": 0.0,
                "model": None,
            }

        asr_ms = round((time.time() - asr_start) * 1000, 2)

        # Step 2: LLM Reasoning
        llm_start = time.time()
        messages = [
            {
                "role": "system",
                "content": (
                    "You are VoiceOps, a helpful AI customer operations voice assistant. "
                    "Provide clear, concise, and professional spoken answers. Keep responses under 3 sentences for natural text-to-speech rendering."
                ),
            },
            {"role": "user", "content": transcript_text},
        ]
        llm_response = await self.llm_provider.chat_completion(messages)
        ai_response_text = llm_response.get("content", "Thank you for reaching out to VoiceOps support.")
        llm_ms = round((time.time() - llm_start) * 1000, 2)

        # Step 3: Text-to-Speech Synthesis
        tts_start = time.time()
        tts_provider = get_tts_provider(request.tts_provider)
        tts_result: TTSResponse = await tts_provider.synthesize(ai_response_text)
        tts_ms = round((time.time() - tts_start) * 1000, 2)

        total_ms = round((time.time() - total_start) * 1000, 2)

        return VoiceInteractionResponse(
            conversation_id=conv_id,
            transcript=transcript_text,
            ai_response_text=ai_response_text,
            audio_base64=tts_result.audio_base64,
            active_agent="voice_operations_agent",
            tool_calls=llm_response.get("tool_calls", []),
            asr_metadata=asr_metadata,
            tts_metadata=tts_result.metadata,
            latency_breakdown_ms={
                "asr_latency_ms": asr_ms,
                "llm_latency_ms": llm_ms,
                "tts_latency_ms": tts_ms,
                "total_latency_ms": total_ms,
            },
        )


voice_service = VoiceService()
