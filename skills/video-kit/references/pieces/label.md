# Label

Short text in the world that always faces the camera. All 3D text goes through this: it holds the render until the text is typeset, which raw drei <Text> does not.

## Label

- `position` Vec3, required. Bottom-center of the text.
- `children` string, required. The text. Keep it to a few words.
- `size` number = 0.36. Text height in world units.
- `opacity` number 0–1 = 1

## Example

```tsx
<Label position={[0, 1.4, 0]}>Always faces you</Label>
```
