# Caption + Narration

Caption shows the words of the current beat and lights each one as it is spoken. Narration plays each beat's audio at its place on the timeline. Both read the same Timeline.

## Caption

- `wordsPerLine` number = 7. Words shown at once.

## Also

- `timeline` Timeline. From createTimeline(). Required by both.

## Example

```tsx
<World overlay={<><Narration timeline={t} /><Caption timeline={t} /></>}>
```
