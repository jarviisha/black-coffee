/**
 * Profile URLs use a leading `@` (e.g. `/@jarviis`). On a hard load both the
 * Vite dev server and Cloudflare's static-asset server answer `/@name` with a
 * 307 to the percent-encoded `/%40name`, so the address bar ends up showing
 * `%40` after a reload. The route still matches — React Router decodes params —
 * but the URL is ugly, so the app rewrites it back client-side.
 *
 * Returns the decoded path when `pathname` is an encoded profile path, or null
 * when there is nothing to rewrite.
 */
export function decodedProfilePath(pathname: string): string | null {
  if (!pathname.toLowerCase().startsWith("/%40")) return null
  const username = pathname.slice("/%40".length)
  if (!username || username.includes("/")) return null
  return `/@${username}`
}
