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
from agents.orchestrator import orchestrator
from models.agent import AgentResponse


class VoiceService:
    """Orchestrates end-to-end audio ingestion, ASR transcription, Multi-Agent execution, and TTS synthesis."""

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

        # Step 2: Multi-Agent Orchestrator (Supervisor -> Specialist Agent -> Tools -> Grounded Response)
        agent_start = time.time()
        agent_res: AgentResponse = await orchestrator.process_user_message(
            user_message=transcript_text,
            conversation_history=[],
            customer_id=request.customer_id or "cust_1001",
            conversation_id=conv_id,
        )
        ai_response_text = agent_res.content
        agent_ms = round((time.time() - agent_start) * 1000, 2)

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
            active_agent=agent_res.agent_name,
            tool_calls=agent_res.tool_calls,
            asr_metadata=asr_metadata,
            tts_metadata=tts_result.metadata,
            latency_breakdown_ms={
                "asr_latency_ms": asr_ms,
                "agent_latency_ms": agent_ms,
                "tts_latency_ms": tts_ms,
                "total_latency_ms": total_ms,
            },
        )



voice_service = VoiceService()
