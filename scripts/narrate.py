"""Turn src/videos/<name>/narration.txt into audio plus word timestamps.

Usage: pnpm narrate <name> [voice]

Writes public/narration/<name>.mp3 and src/videos/<name>/narration.json.
"""

import asyncio
import json
import pathlib
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
TICKS_PER_MS = 10_000
TAIL_MS = 600


async def narrate(name: str, voice: str) -> None:
    video_dir = ROOT / "src" / "videos" / name
    text = (video_dir / "narration.txt").read_text().strip()

    audio = bytearray()
    words = []
    async for chunk in edge_tts.Communicate(text, voice, boundary="WordBoundary").stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            start = chunk["offset"] / TICKS_PER_MS
            words.append(
                {
                    "text": chunk["text"],
                    "startMs": round(start),
                    "endMs": round(start + chunk["duration"] / TICKS_PER_MS),
                }
            )

    if not words:
        raise SystemExit("edge-tts returned no word boundaries")

    audio_path = ROOT / "public" / "narration" / f"{name}.mp3"
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    audio_path.write_bytes(audio)

    narration = {
        "voice": voice,
        "text": text,
        "durationMs": words[-1]["endMs"] + TAIL_MS,
        "words": words,
    }
    (video_dir / "narration.json").write_text(json.dumps(narration, indent=2) + "\n")
    print(f"{len(words)} words, {narration['durationMs']}ms -> {audio_path.relative_to(ROOT)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    asyncio.run(narrate(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "en-US-AndrewNeural"))
