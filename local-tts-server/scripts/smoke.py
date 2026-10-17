from pathlib import Path
from time import perf_counter

from app.engine import ChatterboxEngine


TEXT = "Merhaba. Bu, Listen AI için MacBook üzerinde çalışan Türkçe ses denemesidir."


def main() -> None:
    output_path = Path("output/chatterbox-tr-smoke.wav")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    started_at = perf_counter()
    audio = ChatterboxEngine().synthesize(TEXT, language="tr")
    output_path.write_bytes(audio.content)
    elapsed = perf_counter() - started_at

    print(f"output={output_path.resolve()}")
    print(f"sample_rate={audio.sample_rate}")
    print(f"bytes={len(audio.content)}")
    print(f"elapsed_seconds={elapsed:.2f}")


if __name__ == "__main__":
    main()
