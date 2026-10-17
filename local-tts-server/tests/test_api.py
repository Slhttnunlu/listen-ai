from fastapi.testclient import TestClient

from app.engine import SynthesizedAudio
from app.main import app, engine


client = TestClient(app)


def test_health_does_not_load_model():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["provider"] == "chatterbox-multilingual-v3"


def test_tts_returns_wave(monkeypatch):
    monkeypatch.setattr(
        engine,
        "synthesize",
        lambda text, language: SynthesizedAudio(b"RIFF-test", 24_000),
    )

    response = client.post("/v1/tts", json={"text": "Merhaba dünya."})

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
    assert response.headers["x-audio-sample-rate"] == "24000"
    assert response.content == b"RIFF-test"


def test_tts_rejects_empty_text():
    response = client.post("/v1/tts", json={"text": ""})

    assert response.status_code == 422
