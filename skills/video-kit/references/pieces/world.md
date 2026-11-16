# World

The one 3D space a video happens in: floor, lights, fog. 3D things go in as children, flat things go in `overlay`. A video is one World, never a series of scenes.

## Also

- `children` ReactNode. 3D content: actors and one CameraRig.
- `overlay` ReactNode. Flat content on top: Narration, Caption, CodePanel.

## Example

```tsx
<World overlay={<><Narration timeline={timeline} /><Caption timeline={timeline} /></>}>
  <CameraRig shots={shots} />
  <Graph3D graph={graph} />
</World>
```
