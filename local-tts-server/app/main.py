from __future__ import annotations

import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from .engine import ChatterboxEngine


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)
    language: str = Field(default="tr", pattern="^tr$")


engine = ChatterboxEngine()
app = FastAPI(title="Listen AI Local TTS", version="0.1.0")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _request: Request, _error: RequestValidationError
) -> JSONResponse:
    # FastAPI's default response can echo rejected input. Keep user text out of errors.
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "validation_failed",
                "message": "İstek alanları geçerli değil.",
            }
        },
    )


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
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be blank")
    try:
        audio = engine.synthesize(text, language=request.language)
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
