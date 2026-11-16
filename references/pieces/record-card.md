# RecordCard

One record as a card whose field flips from its old value to its new one. Also the payload an event carries. Flip the field on the frame the packet that writes it lands. Tables is for schema and many rows; this is for the one row the story follows.

## RecordCard

- `title` string, required. Which record: `order 1042`.
- `caption` string. Small text above the title that says what kind of thing it is: `record`, `event payload`.
- `fields` ({ name: string; value: string; was: string; flip: number 0–1; lit: number 0–1 })[], required. The fields the narration talks about, not the whole row. Six or fewer.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Field

- `name` string, required. The field as the code spells it: `status`, `reserved_at`.
- `value` string, required. Its value now. With `was` set, the value it changes to.
- `was` string. The value before the change. Set it on the field that changes; leave it off on the rest.
- `flip` number 0–1 = 1. With `was` set: 0 shows the old value, 1 shows it struck through with the new value beside it in the changed colour. Drive with ease().
- `lit` number 0–1 = 0. Highlights the row: the field a query reads or a check looks at. Drive with pulse().

## Example

```tsx
<RecordCard
  caption="record"
  title="order 1042"
  fields={[
    { name: "id", value: "1042" },
    { name: "status", value: "reserved", was: "pending", flip: ease(frame, lands, lands + 16), lit: pulse(frame, lands, 40) },
  ]}
/>
```
