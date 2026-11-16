/// <reference types="vite/client" />

// Remotion's staticFile() reads this. Under a sub-path (GitHub Pages serves the docs from /<repo>/) fonts and narration live there too.
window.remotion_staticBase = import.meta.env.BASE_URL.replace(/\/$/, "");

export {};
