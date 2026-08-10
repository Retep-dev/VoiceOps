"""FastAPI Application Entry Point — VoiceOps Backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from api import voice


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="VoiceOps API",
        description="Production-Grade AI Voice Support & Operations Platform API",
        version="1.0.0",
    )

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(voice.router, prefix="/api/voice", tags=["Voice Engine"])

    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "VoiceOps Backend Platform",
            "environment": settings.app_env,
            "providers": {
                "default_asr": settings.default_asr_provider,
                "default_tts": settings.default_tts_provider,
                "default_llm": settings.default_llm_provider,
            },
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run("main:app", host="0.0.0.0", port=settings.app_port, reload=True)
