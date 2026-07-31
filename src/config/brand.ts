// Imported from the generated name list rather than Icon.tsx: vite.config.ts
// pulls this file in, and its tsconfig has no JSX support.
import type { IconName } from "@/components/ui/icon-names"

interface Brand {
  /** Displayed in the sidebar, on auth screens, and as the browser tab title */
  name: string
  /** Icon from the sprite — add the SVG to `src/icons/` and run `npm run icons` */
  logo: IconName
  /** Path under `public/` */
  favicon: string
}

/**
 * Single source of truth for brand identity.
 *
 * `name` and `favicon` are also injected into index.html at build time by the
 * `brand-html` plugin in vite.config.ts, so no env var is involved.
 *
 * Deliberately not here: colours and fonts live in `src/styles/` (`themes/*.css`
 * plus the `@theme inline` block in `main.css`), and the names in
 * `wrangler.jsonc` / `package.json` are deployment identifiers, not display names.
 */
export const brand: Brand = {
  name: "Black Coffee",
  logo: "coffee",
  favicon: "/brand/favicon.svg",
}
