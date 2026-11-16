import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // Shared with Remotion so staticFile() resolves the same assets.
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  plugins: [react()],
  server: { port: 5199 },
});
