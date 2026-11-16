# video-kit

A skill for coding agents. It makes narrated 3D explainer videos.

Ask for one in plain words:

- a pull request
- a bug and its fix
- a plan
- how a system works

The agent writes the script, narrates it, builds the scene and renders an MP4.

## Install

Paste this to your agent:

```
Install the video-kit skill: clone https://github.com/ruanmartinelli/video-kit into ~/.claude/skills/video-kit and run `pnpm install` inside it.
```

Then ask for a video:

```
Make a video that explains this pull request to its reviewer.
```

> Narration text is sent to Microsoft's Edge text-to-speech service. Everything else stays on your machine.

## Before and after

Same agent, same prompt: *explain how a load balancer works.*

**Without video-kit**

https://github.com/user-attachments/assets/40afe786-2bb5-4c05-8c60-c47ad86cd426

**With video-kit**

https://github.com/user-attachments/assets/b242ed7c-387b-4977-92eb-8368facd47e8

## Numbers

Two jobs, each run once without the skill and once with it.

**A 28-file pull request, as a two-minute video**

| | Without | With | |
|---|---|---|---|
| Time | 77 min | 41 min | −46% |
| Tool calls | 199 | 122 | −39% |
| Tokens written | 113,875 | 71,507 | −37% |
| Frames looked at | 140 | 47 | −66% |
| Estimated cost | | | −35% |

**The load balancer video above**

| | Without | With | |
|---|---|---|---|
| Time | 5.8 min | 8.3 min | +43% |
| Tool calls | 32 | 37 | +16% |
| Tokens written | 29,283 | 18,440 | −37% |
| Estimated cost | | | about the same |

The skill pays off on bigger jobs. On a short video, working from scratch costs about the same.

<sub>One run each. Cost is estimated from token counts. Times are rough.</sub>
