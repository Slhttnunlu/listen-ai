import io

import numpy as np
import soundfile as sf

from app.engine import ChatterboxEngine


class FakeTensor:
    def __init__(self, samples):
        self._samples = np.asarray(samples, dtype=np.float32)

    def detach(self):
        return self

    def cpu(self):
        return self

    def numpy(self):
        return self._samples


class FakeModel:
    sr = 1_000

    def __init__(self):
        self.requests = []

    def generate(self, text, **options):
        self.requests.append((text, options))
        return FakeTensor([0.1, 0.2, 0.3])


def test_engine_synthesizes_long_text_as_bounded_segments(monkeypatch):
    engine = ChatterboxEngine()
    model = FakeModel()
    monkeypatch.setattr(engine, "_load", lambda: model)
    monkeypatch.setenv("LOCAL_TTS_SEGMENT_CHARS", "32")

    audio = engine.synthesize("Birinci cümle burada. İkinci cümle de burada.")

    assert [request[0] for request in model.requests] == [
        "Birinci cümle burada.",
        "İkinci cümle de burada.",
    ]
    assert all(request[1] == {"language_id": "tr"} for request in model.requests)
    samples, sample_rate = sf.read(io.BytesIO(audio.content))
    assert sample_rate == 1_000
    assert len(samples) == 126  # two 3-sample clips plus a 120 ms pause
