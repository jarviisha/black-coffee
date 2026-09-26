const SAFE_PROTOCOLS = ["http:", "https:"]

/**
 * Normalises a user-supplied link, or returns null if it is not safe to render
 * as an href.
 *
 * `javascript:` and `data:` URLs execute in this origin when clicked, and
 * neither target="_blank" nor rel="noopener" blocks them — so a profile
 * website field would otherwise be a script injection anyone could publish.
 * A bare host is upgraded to https, which is what a user typing "example.com"
 * means.
 */
export function safeExternalUrl(input: string | undefined | null): string | null {
  const raw = input?.trim()
  if (!raw) return null

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return null
  }

  if (!SAFE_PROTOCOLS.includes(url.protocol)) return null
  if (!url.hostname) return null
  return candidate
}
