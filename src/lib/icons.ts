import { getServerOrigin } from '@/api/client'

/** Pattern matching standard PD icons: ico0.svg, ico1.svg, ..., ico134.svg */
const STANDARD_ICON_RE = /^ico(\d+)\.svg$/

/**
 * Highest standard icon bundled under public/icons (ico0.svg – ico134.svg).
 * Icons above this index aren't bundled and must be fetched from the server
 * /file/ endpoint instead of resolving to a 404 local path.
 */
const MAX_BUNDLED_ICON = 134

/** True if `icon` is a standard PD icon that ships with the web client. */
function isBundledStandardIcon(icon: string): boolean {
  const match = STANDARD_ICON_RE.exec(icon)
  if (!match) return false
  return Number(match[1]) <= MAX_BUNDLED_ICON
}

/**
 * Resolve a PD icon filename to a URL.
 *
 * - Standard icons (ico0.svg – ico134.svg) are bundled with the web client
 *   and served from /icons/ — no server request needed.
 * - Custom icons (favicons, etc.) are loaded from the PD Server at /file/<name>.
 *
 * Returns undefined if no icon name is provided.
 */
export function getIconUrl(icon: string | undefined): string | undefined {
  if (!icon) return undefined

  // Standard icons are bundled locally
  if (isBundledStandardIcon(icon)) {
    return `${import.meta.env.BASE_URL}icons/${icon}`
  }

  // Custom icons — load from the PD Server
  if (import.meta.env.DEV) {
    return `/file/${icon}`
  }

  const origin = getServerOrigin()
  return `${origin}/file/${icon}`
}
