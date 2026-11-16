// Remotion bundles with webpack, which finds files by pattern at build time.
interface ImportMeta {
  webpackContext(directory: string, options: { recursive: boolean; regExp: RegExp }): { keys(): string[]; (key: string): unknown };
}
