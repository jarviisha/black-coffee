import { defineConfig, type Plugin } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

import { cloudflare } from "@cloudflare/vite-plugin"
import { brand } from "./src/config/brand"

/**
 * Fills the %BRAND_*% placeholders in index.html from src/config/brand.ts, so
 * the brand name and favicon have exactly one source of truth. Runs "pre" to
 * land before Vite's own %VITE_*% env substitution.
 */
function brandHtml(): Plugin {
  return {
    name: "brand-html",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(/%BRAND_NAME%/g, brand.name).replace(/%BRAND_FAVICON%/g, brand.favicon),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), brandHtml()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
})
