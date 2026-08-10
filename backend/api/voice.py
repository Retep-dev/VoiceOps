from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional
import base64
from models.voice import (
    ASRResponse,
    TTSResponse,
    VoiceInteractionRequest,
    VoiceInteractionResponse,
)
from providers.asr.factory import get_asr_provider
from providers.tts.factory import get_tts_provider
from services.voice_service import voice_service

router = APIRouter()


@router.post("/transcribe", response_model=ASRResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    provider: Optional[str] = Query(None, description="ASR provider: mock, deepgram, whisper"),
):
    """Convert uploaded audio file into text transcript."""
    try:
        audio_bytes = await file.read()
        asr = get_asr_provider(provider)
        return await asr.transcribe(audio_bytes, filename=file.filename or "audio.wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ASR transcription failed: {str(e)}")


@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(
    text: str = Form(...),
    voice_id: str = Form("default"),
    provider: Optional[str] = Query(None, description="TTS provider: mock, elevenlabs, openai"),
):
    """Convert text string into synthesized speech audio (base64 MP3)."""
    try:
        tts = get_tts_provider(provider)
        return await tts.synthesize(text, voice_id=voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


@router.post("/interact", response_model=VoiceInteractionResponse)
async def voice_interaction(request: VoiceInteractionRequest):
    """End-to-end voice support interaction pipeline (Audio/Text -> ASR -> Agent LLM -> TTS)."""
    try:
        return await voice_service.process_voice_interaction(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice interaction pipeline failed: {str(e)}")


@router.post("/upload-interact", response_model=VoiceInteractionResponse)
async def voice_upload_interaction(
    file: UploadFile = File(...),
    customer_id: str = Form("cust_1001"),
    conversation_id: Optional[str] = Form(None),
    asr_provider: Optional[str] = Form(None),
    tts_provider: Optional[str] = Form(None),
):
    """Multipart audio file upload endpoint for voice interaction."""
    try:
        audio_bytes = await file.read()
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        req = VoiceInteractionRequest(
            audio_base64=audio_b64,
            customer_id=customer_id,
            conversation_id=conversation_id,
            asr_provider=asr_provider,
            tts_provider=tts_provider,
        )
        return await voice_service.process_voice_interaction(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio file voice interaction failed: {str(e)}")
