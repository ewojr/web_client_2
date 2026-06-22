import { configureApi } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { getConfig } from '@/lib/config'

// The api/ layer must not depend on stores/ — this module is the single
// bridge that wires the two together at boot time.

function buildContext(): { serverOrigin: string; token: string | null } {
  const token = useAuthStore.getState().token
  const config = getConfig()
  if (config.bundled) {
    return { serverOrigin: '', token }
  }
  const conn = useConnectionStore.getState()
  if (!conn.serverAddress) {
    return { serverOrigin: '', token }
  }
  // Defense in depth: ServerFields sanitizes input, but block any address
  // containing a scheme separator, slash, or whitespace from ever producing
  // a non-HTTPS origin. fetch() would reject the malformed URL anyway —
  // failing here makes the contract explicit at the API boundary.
  if (/[\s/\\?#]/.test(conn.serverAddress) || conn.serverAddress.includes('://')) {
    throw new Error('Invalid server address: must be a hostname or IP only')
  }

  const addr = conn.serverAddress
  let host = addr
  let port = conn.serverPort
  if (addr.startsWith('[')) {
    // Already a bracketed IPv6 literal — use as-is.
    host = addr
  } else {
    const colons = (addr.match(/:/g) ?? []).length
    if (colons >= 2) {
      // Bare IPv6 literal — must be bracketed in a URL origin.
      host = `[${addr}]`
    } else if (colons === 1) {
      // A stray "host:port" that slipped past ServerFields — honor the
      // embedded port instead of building "https://host:port:port".
      const [h, p] = addr.split(':')
      host = h
      if (p) port = p
    }
  }
  return {
    serverOrigin: `https://${host}:${port}`,
    token,
  }
}

export function setupApiBindings(): void {
  configureApi({
    getContext: buildContext,
    onActivity: () => useAuthStore.getState().resetSessionTimer(),
    // A 401 means *this tab's* token is already dead: don't try to revoke it
    // again (would re-trigger this handler) and don't broadcast — other tabs
    // hold their own, possibly still-valid, sessions.
    onAuthFailure: () => useAuthStore.getState().logout({ broadcast: false, revoke: false }),
  })
}
