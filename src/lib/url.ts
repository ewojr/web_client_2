// Reject javascript:, data:, vbscript:, file:, etc. — anything that isn't a
// plain web/ftp URL must not be turned into a clickable href or window.open
// target. An attacker who can store entry data could otherwise plant
// `javascript:fetch(...)` and execute it in the victim's session.
const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'ftp:', 'ftps:'])

export function getSafeHref(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  // Treat the input as already-schemed only when a scheme is followed by "//"
  // (e.g. "https://example.com", "file:///etc/passwd"). Everything else is
  // upgraded to https so that scheme-less input ("example.com/path") and
  // scheme-less host:port URLs ("intranet:8714", "localhost:3000/admin",
  // "example.com:8080/path", "192.168.1.1:8080") resolve to real hosts instead
  // of being misparsed as a bogus custom scheme. Pseudo-schemes that carry a
  // colon but no "//" ("mailto:", "javascript:", "data:", "tel:") are NOT
  // host:port forms, so we leave them un-prefixed and let the URL parser /
  // protocol allow-list reject them below.
  const hasSchemeSeparator = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
  const isHostPort = /^[a-z0-9.-]+:\d+(?:[/?#]|$)/i.test(trimmed)
  const hasColon = trimmed.includes(':')
  const candidate =
    hasSchemeSeparator || (hasColon && !isHostPort) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    return SAFE_URL_PROTOCOLS.has(parsed.protocol.toLowerCase()) ? parsed.toString() : null
  } catch {
    return null
  }
}

export function openSafeUrl(value: string | null | undefined): void {
  const href = getSafeHref(value)
  if (href) window.open(href, '_blank', 'noopener,noreferrer')
}
