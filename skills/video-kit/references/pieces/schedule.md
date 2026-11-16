# Schedule

When a job runs, as ticks on a strip of time. Put the old and the new interval on the same clock and a schedule change stops being two numbers: it is six runs against seventy-two.

## Schedule

- `rows` ({ label: string; everyMinutes: number; tone: "neutral" | "added" | "changed" | "removed"; progress: number 0–1 })[], required. One strip per schedule, on the same clock. Two rows compare before and after.
- `windowMinutes` number = 360. How much time the strips cover. Pick one where the sparsest row still shows a few runs: 6 hours for hourly against every five minutes.
- `title` string. The schedule entry's name, as it is written in the code.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Row

- `label` string, required. Which schedule this is: `before`, `after`, a job name.
- `everyMinutes` number, required. Minutes between runs. 60 is hourly, 1440 is daily.
- `tone` "neutral" | "added" | "changed" | "removed" = "neutral". neutral for the schedule as it was; the rest mark what the PR did.
- `progress` number 0–1 = 1. How much of the window has played, left to right. Drive with ease(); the run count climbs with it.

## Example

```tsx
<Schedule
  title="sync_usage"
  rows={[
    { label: "before", everyMinutes: 60, progress: ease(frame, t.at("schedule", "hour") - 20, t.at("schedule", "hour") + 20) },
    { label: "after", everyMinutes: 5, tone: "changed", progress: ease(frame, t.at("schedule", "five"), t.at("schedule", "five") + 50) },
  ]}
/>
```
