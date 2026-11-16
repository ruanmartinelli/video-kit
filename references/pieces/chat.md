# Chat

Message bubbles that type, for anything where someone asks an assistant: a support bot, a coding agent, a prompt and its answer. Up to four messages. `pending` shows the assistant thinking before its text starts.

## Chat

- `messages` ({ from: "user" | "assistant"; text: string; typed: number 0–1; pending: boolean })[], required. The conversation, oldest first. One to four messages.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Message

- `from` "user" | "assistant", required. user sits on the right in a filled bubble, assistant on the left.
- `text` string, required. What is said. Long text wraps inside the bubble; keep it to two or three lines.
- `typed` number 0–1 = 1. How much of the text is in: 0 hides the message, values in between show that share of its characters. Drive with ease().
- `pending` boolean = false. Three dots in place of the text, for an assistant that is still thinking.

## Example

```tsx
const answers = t.at("answer");

<Chat
  messages={[
    { from: "user", text: "Why did order #1040 ship late?", typed: ease(frame, t.at("ask"), t.at("ask") + 30) },
    // `typed` 0 hides a message, so keep it just above 0 once the dots are replaced by text.
    { from: "assistant", text: "The stock job retried three times.", pending: frame < answers, typed: Math.max(0.01, ease(frame, answers, answers + 50)) },
  ]}
/>
```
