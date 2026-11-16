"""Turn src/videos/<name>/script.json into per-beat audio plus word timestamps.

Usage: pnpm narrate <name>

script.json: {"voice": "en-US-AndrewNeural", "beats": [{"id": "problem", "text": "..."}]}

Writes public/narration/<name>/<beat id>.mp3 and src/videos/<name>/narration.json.
A beat whose text and voice are unchanged is not synthesized again.
"""

import asyncio
import hashlib
import json
import pathlib
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
TICKS_PER_MS = 10_000
# Room after the last word so the voice is not cut mid-breath.
BEAT_TAIL_MS = 250
# The endpoint is unofficial and throttles bursts: space requests out, and
# wait when one comes back empty. A short probe sentence can get through while
# a real beat is still throttled, so there is no cheap way to tell the two apart.
WAITS = [5, 15, 45, 90, 120]
PAUSE_SECONDS = 1.5


async def synthesize(text: str, voice: str, audio_path: pathlib.Path) -> list[dict]:
    """The service throttles after a burst of requests and answers with no audio. Waiting is the fix, so wait here."""
    for attempt, wait in enumerate([*WAITS, None], start=1):
        try:
            return await synthesize_once(text, voice, audio_path)
        except edge_tts.exceptions.NoAudioReceived:
            if wait is None:
                raise SystemExit(
                    f"edge-tts returned no audio for: {text}\n"
                    f"It was asked {attempt} times over {sum(WAITS) // 60} minutes. The service throttles for longer than that when it is busy: "
                    "run this again in a few minutes; finished beats are kept. Reword the beat only if it alone keeps failing while the beats after it go through."
                )
            print(f"  no audio, waiting {wait}s ({attempt}/{len(WAITS)})", flush=True)
            await asyncio.sleep(wait)
    raise AssertionError("unreachable")


async def synthesize_once(text: str, voice: str, audio_path: pathlib.Path) -> list[dict]:
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
        raise SystemExit(f"edge-tts returned no word boundaries for: {text}")
    audio_path.write_bytes(audio)
    return words


async def narrate(name: str) -> None:
    video_dir = ROOT / "src" / "videos" / name
    script = json.loads((video_dir / "script.json").read_text())
    voice = script["voice"]

    ids = [beat["id"] for beat in script["beats"]]
    if len(ids) != len(set(ids)):
        raise SystemExit("Beat ids must be unique")

    audio_dir = ROOT / "public" / "narration" / name
    audio_dir.mkdir(parents=True, exist_ok=True)

    narration_path = video_dir / "narration.json"
    previous = {}
    if narration_path.exists():
        previous = {beat["id"]: beat for beat in json.loads(narration_path.read_text())["beats"]}

    def save(beats: list[dict]) -> None:
        narration_path.write_text(json.dumps({"voice": voice, "beats": beats}, indent=2) + "\n")

    beats = []
    for beat in script["beats"]:
        audio_path = audio_dir / f"{beat['id']}.mp3"
        digest = hashlib.sha256(f"{voice}\n{beat['text']}".encode()).hexdigest()[:12]
        cached = previous.get(beat["id"])
        if cached and cached.get("hash") == digest and audio_path.exists():
            beats.append(cached)
            print(f"  cached  {beat['id']}")
            continue
        words = await synthesize(beat["text"], voice, audio_path)
        beats.append(
            {
                "id": beat["id"],
                "text": beat["text"],
                "hash": digest,
                "audio": f"narration/{name}/{beat['id']}.mp3",
                "durationMs": words[-1]["endMs"] + BEAT_TAIL_MS,
                "words": words,
            }
        )
        save(beats)
        await asyncio.sleep(PAUSE_SECONDS)
        print(f"  spoken  {beat['id']}  {beats[-1]['durationMs']}ms")

    for stale in audio_dir.glob("*.mp3"):
        if stale.stem not in ids:
            stale.unlink()

    save(beats)
    print(f"{len(beats)} beats, {sum(b['durationMs'] for b in beats)}ms of speech")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    asyncio.run(narrate(sys.argv[1]))
