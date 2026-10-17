from __future__ import annotations

import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from .engine import ChatterboxEngine


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2_000)
    language: str = Field(default="tr", pattern="^tr$")


engine = ChatterboxEngine()
app = FastAPI(title="Listen AI Local TTS", version="0.1.0")


def require_api_token(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    expected = os.getenv("LOCAL_TTS_API_TOKEN")
    if expected and authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="invalid local API token")


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "provider": "chatterbox-multilingual-v3",
        "model_loaded": engine.loaded,
    }


@app.post("/v1/tts", dependencies=[Depends(require_api_token)])
def synthesize(request: SpeechRequest) -> Response:
    try:
        audio = engine.synthesize(request.text.strip(), language=request.language)
    except Exception as error:
        raise HTTPException(status_code=503, detail="local TTS generation failed") from error

    return Response(
        content=audio.content,
        media_type="audio/wav",
        headers={
            "Cache-Control": "no-store",
            "X-TTS-Provider": "chatterbox-multilingual-v3",
            "X-Audio-Sample-Rate": str(audio.sample_rate),
        },
    )
