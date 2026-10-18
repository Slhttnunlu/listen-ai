from unittest.mock import Mock

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

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "validation_failed"
    assert "input" not in response.text


def test_tts_rejects_blank_text_without_calling_engine(monkeypatch):
    synthesize = Mock()
    monkeypatch.setattr(engine, "synthesize", synthesize)

    response = client.post("/v1/tts", json={"text": "   \n"})

    assert response.status_code == 400
    synthesize.assert_not_called()


def test_tts_accepts_text_longer_than_the_old_limit(monkeypatch):
    received = {}

    def synthesize(text, language):
        received["text"] = text
        return SynthesizedAudio(b"RIFF-long", 24_000)

    monkeypatch.setattr(engine, "synthesize", synthesize)
    text = "Uzun metin. " * 200

    response = client.post("/v1/tts", json={"text": text})

    assert response.status_code == 200
    assert received["text"] == text.strip()


def test_validation_error_does_not_echo_long_user_text():
    private_text = "özel kullanıcı metni " * 1_100

    response = client.post("/v1/tts", json={"text": private_text})

    assert response.status_code == 400
    assert private_text not in response.text
