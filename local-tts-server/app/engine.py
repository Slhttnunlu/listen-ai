from __future__ import annotations

import io
import threading
from dataclasses import dataclass


@dataclass(frozen=True)
class SynthesizedAudio:
    content: bytes
    sample_rate: int


class ChatterboxEngine:
    """Lazily loads the model so health checks do not allocate model memory."""

    def __init__(self) -> None:
        self._model = None
        self._lock = threading.Lock()

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def _load(self):
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is not None:
                return self._model

            import torch
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS

            device = "mps" if torch.backends.mps.is_available() else "cpu"
            map_location = torch.device(device)
            original_torch_load = torch.load

            def patched_torch_load(*args, **kwargs):
                kwargs.setdefault("map_location", map_location)
                return original_torch_load(*args, **kwargs)

            torch.load = patched_torch_load
            try:
                self._model = ChatterboxMultilingualTTS.from_pretrained(
                    device=device,
                    t3_model="v3",
                )
            finally:
                torch.load = original_torch_load

        return self._model

    def synthesize(
        self,
        text: str,
        *,
        language: str = "tr",
        reference_audio: str | None = None,
    ) -> SynthesizedAudio:
        import soundfile as sf

        model = self._load()
        options = {"language_id": language}
        if reference_audio:
            options["audio_prompt_path"] = reference_audio

        with self._lock:
            waveform = model.generate(text, **options)

        samples = waveform.detach().cpu().numpy().squeeze()
        output = io.BytesIO()
        sf.write(output, samples, model.sr, format="WAV", subtype="PCM_16")
        return SynthesizedAudio(content=output.getvalue(), sample_rate=model.sr)
