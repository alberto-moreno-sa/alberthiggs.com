import { defineConfig } from "vite";

/**
 * Identifies this build. Baked into the HTML cache key in src/server.ts so a
 * deploy starts from a cold cache — otherwise a code change would sit behind
 * up to an hour of stale entries.
 */
const BUILD_ID = Date.now().toString(36);
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  resolve: { tsconfigPaths: true },
  plugins: [
    // Order matters: the Cloudflare environment has to exist before Start
    // builds against it.
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
