# video-kit

A skill that lets a coding agent make narrated 3D explainer videos: of a pull request, a bug and its fix, a plan, or how a system works.

You ask in plain words. The agent writes the script, narrates it, builds the scene, checks its own frames and renders an MP4.

## Before and after

The same agent, given the same prompt: *make a short video that explains how a load balancer works.*

**Without video-kit**

https://github.com/user-attachments/assets/40afe786-2bb5-4c05-8c60-c47ad86cd426

**With video-kit**

https://github.com/user-attachments/assets/b242ed7c-387b-4977-92eb-8368facd47e8

## Install

Paste this to your agent:

```
Install the video-kit skill: clone https://github.com/ruanmartinelli/video-kit into ~/.claude/skills/video-kit and run `pnpm install` inside it.
```

Then ask for a video in whatever project you are working in:

```
Make a video that explains this pull request to its reviewer.
```

The narration text is sent to Microsoft's Edge text-to-speech service. Everything else runs on your machine.
