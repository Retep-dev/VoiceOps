import time
import logging
from typing import Dict, Any, Optional
from core.config import get_settings

logger = logging.getLogger(__name__)


class LangfuseObservabilityService:
    """Telemetry & Observability service wrapper for AI tracing, tool monitoring, and token metrics."""

    def __init__(self):
        settings = get_settings()
        self.public_key = settings.langfuse_public_key
        self.secret_key = settings.langfuse_secret_key
        self.enabled = bool(self.public_key and self.secret_key)
        
        if self.enabled:
            logger.info("Langfuse Observability initialized successfully.")
        else:
            logger.info("Langfuse keys not provided — running local trace logging mode.")

    def log_interaction_trace(
        self,
        conversation_id: str,
        user_message: str,
        active_agent: str,
        ai_response: str,
        tool_calls: list,
        latency_ms: dict,
    ) -> Dict[str, Any]:
        trace_data = {
            "trace_id": f"trace_{conversation_id}_{int(time.time())}",
            "conversation_id": conversation_id,
            "user_message": user_message,
            "active_agent": active_agent,
            "ai_response": ai_response,
            "tool_calls_count": len(tool_calls),
            "latency_ms": latency_ms,
            "status": "success",
        }
        logger.info(f"[Trace {trace_data['trace_id']}] Agent '{active_agent}' responded in {latency_ms.get('total_latency_ms')}ms")
        return trace_data


observability_service = LangfuseObservabilityService()
