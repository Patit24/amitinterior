import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/amitinterior/" : "/",
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        about: resolve(root, "about/index.html"),
        services: resolve(root, "services/index.html"),
        portfolio: resolve(root, "portfolio/index.html"),
        contact: resolve(root, "contact/index.html"),
      },
    },
  },
});
