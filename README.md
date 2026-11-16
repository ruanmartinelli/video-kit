# video-kit

A skill that lets coding agents make narrated 3D explainer videos. Ask in plain words for a video of a pull request, a bug and its fix, a plan, or how a system works. The agent writes the script, narrates it, builds the scene and renders an MP4.

## Install

Paste this to your agent:

```
Install the video-kit skill: clone https://github.com/ruanmartinelli/video-kit into ~/.claude/skills/video-kit
```

Then ask for a video:

```
Make a video that explains this pull request to its reviewer.
```

## Before and after

Same agent, same prompt: *explain how a load balancer works.*

| Without video-kit | With video-kit |
|---|---|
| https://github.com/user-attachments/assets/40afe786-2bb5-4c05-8c60-c47ad86cd426 | https://github.com/user-attachments/assets/b242ed7c-387b-4977-92eb-8368facd47e8 |

## Numbers

One job, run once without the skill and once with it: a 28-file pull request, as a two-minute video.

| | Without | With | |
|---|---|---|---|
| Time | 77 min | 41 min | −46% |
| Tool calls | 199 | 122 | −39% |
| Tokens written | 113,875 | 71,507 | −37% |
| Frames looked at | 140 | 47 | −66% |
| Estimated cost | | | −35% |

<sub>One run each. Cost is estimated from token counts. Times are rough.</sub>

## License

[MIT](LICENSE)
