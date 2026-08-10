import json
import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.voice_service import voice_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/stream")
async def voice_stream_endpoint(websocket: WebSocket):
    """Bidirectional WebSocket streaming endpoint for low-latency real-time voice interactions & barge-in handling."""
    await websocket.accept()
    logger.info("WebSocket voice streaming connection established.")

    is_interrupted = False

    try:
        while True:
            raw_message = await websocket.receive_text()
            try:
                data = json.loads(raw_message)
            except Exception:
                await websocket.send_json({"error": "Invalid JSON frame received."})
                continue

            msg_type = data.get("type", "audio_chunk")

            if msg_type == "barge_in":
                # Handle user interruption / barge-in
                is_interrupted = True
                logger.info("Barge-in signal received — cancelling current speech audio synthesis.")
                await websocket.send_json({
                    "event": "interrupted",
                    "status": "stopped",
                    "message": "Playback cancelled due to user speech barge-in."
                })
                continue

            elif msg_type == "audio_chunk" or msg_type == "text_chunk":
                is_interrupted = False
                text_input = data.get("text_input") or data.get("chunk")
                customer_id = data.get("customer_id", "cust_1001")
                conv_id = data.get("conversation_id", "conv_stream_1")

                # Process voice interaction through pipeline
                response = await voice_service.process_voice_interaction(
                    type("Req", (), {
                        "audio_base64": data.get("audio_base64"),
                        "text_input": text_input,
                        "customer_id": customer_id,
                        "conversation_id": conv_id,
                        "asr_provider": "mock",
                        "tts_provider": "mock",
                    })()
                )

                if is_interrupted:
                    continue

                # Stream response frames back to client
                await websocket.send_json({
                    "event": "response_frame",
                    "conversation_id": response.conversation_id,
                    "transcript": response.transcript,
                    "ai_response_text": response.ai_response_text,
                    "audio_base64": response.audio_base64,
                    "active_agent": response.active_agent,
                    "tool_calls": response.tool_calls,
                    "latency_ms": response.latency_breakdown_ms,
                })

    except WebSocketDisconnect:
        logger.info("WebSocket voice stream disconnected cleanly.")
    except Exception as e:
        logger.error(f"WebSocket voice stream error: {e}")
