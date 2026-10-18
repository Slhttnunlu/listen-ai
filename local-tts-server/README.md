# Listen AI local TTS server

This development-only service runs Chatterbox Multilingual V3 on the Mac and returns Turkish WAV audio. It is not a production backend and must not be exposed to the public internet.

## Setup

```bash
cd local-tts-server
uv sync
```

The first synthesis downloads the model into the Hugging Face cache outside this repository.

## Run

Simulator-only access:

```bash
uv run uvicorn app.main:app --host 127.0.0.1 --port 8765
```

For a physical iPhone on the same trusted Wi-Fi, set a temporary token and bind to the LAN. Do not use this mode on a public network.

```bash
LOCAL_TTS_API_TOKEN="choose-a-temporary-token" \
  uv run uvicorn app.main:app --host 0.0.0.0 --port 8765
```

Check the service:

```bash
curl http://127.0.0.1:8765/health
```

Generate Turkish speech:

```bash
curl -X POST http://127.0.0.1:8765/v1/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"Merhaba, bu yerel Türkçe ses denemesidir.","language":"tr"}' \
  --output /tmp/listen-ai-local-tts.wav
```

The endpoint accepts up to 20,000 characters. The service splits long input at
paragraph, sentence, and word boundaries before synthesis, then combines the
segments into one WAV response. `LOCAL_TTS_SEGMENT_CHARS` can override the
development default of 350 characters; values below 32 are rejected.

This synchronous behavior is only for the local POC. Production uses an
asynchronous job and segment manifest so playback can begin before the full text
has been generated; see `docs/ARCHITECTURE.md`.

## Security and privacy

- Request bodies are not logged by application code.
- Generated audio stays in memory and is not retained by this service.
- The development endpoint uses plain HTTP and is unsuitable for production.
- Reference voice cloning will only be added with an explicitly permitted recording.
