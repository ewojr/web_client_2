import type { OidcProvider } from '@/api/types'

/** Generate a random string for state/nonce parameters */
function randomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Cache for discovered authorization endpoints (keyed by discovery URL) */
const authEndpointCache = new Map<string, string>()

/**
 * How long to wait for an OIDC discovery response before giving up. Without
 * this, a misconfigured IdP whose discovery URL hangs would freeze the Sign-In
 * spinner indefinitely — browsers don't apply a default fetch timeout.
 */
const DISCOVERY_TIMEOUT_MS = 10_000

/** Fetch the OIDC discovery document and extract the authorization_endpoint */
async function getAuthorizationEndpoint(discoveryUrl: string): Promise<string> {
  const cached = authEndpointCache.get(discoveryUrl)
  if (cached) return cached

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(discoveryUrl, { signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `OIDC discovery timed out after ${DISCOVERY_TIMEOUT_MS / 1000}s. Check the provider's discovery URL and that this device can reach it.`,
      )
    }
    throw new Error(
      `Could not reach the OIDC discovery endpoint. Verify the provider is configured correctly and reachable from this device.`,
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`OIDC discovery returned HTTP ${response.status}.`)
  }

  const doc = await response.json()
  const endpoint = doc.authorization_endpoint
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('OIDC discovery document is missing authorization_endpoint.')
  }

  authEndpointCache.set(discoveryUrl, endpoint)
  return endpoint
}

// ── Session storage keys ─────────────────────────────────────
const SS_STATE = 'pd-oidc-state'
const SS_NONCE = 'pd-oidc-nonce'
const SS_IDP = 'pd-oidc-idp'
const SS_AUTH = 'pd-oidc-auth' // 'oidc' or 'azure'

/**
 * Decode a JWT payload (the middle base64url-encoded segment). Returns null
 * on any parse failure — the caller treats that as nonce validation failure.
 * No signature check is performed; nonce checking only confirms that the
 * id_token was issued in response to *our* authorization request, defending
 * against replay. The PD Server is responsible for verifying the signature.
 */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const parts = jwt.split('.')
  if (parts.length < 2) return null
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  try {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Get the redirect URI for OIDC/Azure callbacks. With HashRouter the route
 * lives in the fragment, so the registered redirect URI is the page's base URL
 * (origin + path) — never a /login path. Both the hash AND any query string are
 * stripped so the value is deterministic and exactly matches what admins must
 * register with the IdP.
 */
function getRedirectUri(): string {
  const url = new URL(window.location.href)
  url.hash = ''
  url.search = ''
  return url.toString()
}

/** Build the OIDC authorization URL for a provider */
export async function buildOidcAuthUrl(provider: OidcProvider): Promise<string> {
  const state = randomString(16)
  const nonce = randomString(16)

  sessionStorage.setItem(SS_STATE, state)
  sessionStorage.setItem(SS_NONCE, nonce)
  sessionStorage.setItem(SS_IDP, provider.id)
  sessionStorage.setItem(SS_AUTH, 'oidc')

  const redirectUri = getRedirectUri()

  // The PD Server REST login validates the value it receives as a JWT id_token
  // or as a Bearer access_token (userinfo lookup) — it never performs an
  // authorization-code exchange. A pure `code` flow would therefore come back
  // as an un-exchangeable authorization code and always 401. Force `id_token`
  // into the response_type set regardless of provider config, turning a
  // code-only provider into a hybrid (`code id_token`) flow the server accepts.
  const configured = (provider.response_types ?? []).filter(Boolean)
  const responseTypeSet = new Set(configured.length ? configured : ['id_token'])
  responseTypeSet.add('id_token')
  const responseType = Array.from(responseTypeSet).join(' ')
  // OAuth expects space-separated values for scope
  const scope = (provider.scopes ?? []).join(' ') || 'openid profile'

  // Microsoft Entra (and per OIDC spec, any compliant IdP) rejects
  // response_mode=query when the response includes an id_token, because
  // query strings can leak through Referer headers and server logs. For
  // pure auth-code flow only `code` comes back and `query` is safe; for
  // implicit/hybrid flows that include `id_token`, we must use `fragment`.
  // main.tsx captures the fragment before HashRouter mounts.
  const includesIdToken = responseType.split(' ').includes('id_token')
  const responseMode = includesIdToken ? 'fragment' : 'query'

  const params = new URLSearchParams({
    response_type: responseType,
    client_id: provider.client_id,
    redirect_uri: redirectUri,
    scope,
    state,
    nonce,
    response_mode: responseMode,
  })

  const authorizationEndpoint = await getAuthorizationEndpoint(provider.discovery_endpoint)
  return `${authorizationEndpoint}?${params.toString()}`
}

// ── Azure AD (deprecated) ────────────────────────────────────

const AZURE_CLIENT_ID = '4d0af5fb-060c-40d5-bbf5-8b59f50d47ed'
const AZURE_DISCOVERY_URL =
  'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'

/** Build the Azure AD authorization URL (deprecated — uses fixed client ID) */
export async function buildAzureAuthUrl(): Promise<string> {
  const state = randomString(16)
  const nonce = randomString(16)

  sessionStorage.setItem(SS_STATE, state)
  sessionStorage.setItem(SS_NONCE, nonce)
  sessionStorage.setItem(SS_IDP, 'azure')
  sessionStorage.setItem(SS_AUTH, 'azure')

  const redirectUri = getRedirectUri()

  const params = new URLSearchParams({
    response_type: 'code id_token',
    client_id: AZURE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile User.Read',
    state,
    nonce,
    // Microsoft Entra ID rejects response_mode=query for any flow that
    // returns an id_token (AADSTS70007), since query strings can leak via
    // Referer headers and server logs. The id_token must come back in the
    // URL fragment instead. main.tsx captures the fragment before the
    // HashRouter mounts so the OIDC callback handler can read it.
    response_mode: 'fragment',
  })

  const authorizationEndpoint = await getAuthorizationEndpoint(AZURE_DISCOVERY_URL)
  return `${authorizationEndpoint}?${params.toString()}`
}

// ── Callback parsing ─────────────────────────────────────────

export interface OidcCallbackResult {
  /** 'oidc' or 'azure' */
  auth: 'oidc' | 'azure'
  /** Provider ID (for OIDC) or 'azure' */
  idp: string
  /** The id_token or authorization code from the IdP */
  id_token: string
}

/**
 * Detects an OAuth/OIDC error response (RFC 6749 §4.1.2.1) in the callback
 * URL — e.g. the IdP redirected back with `?error=access_denied&error_description=...`
 * instead of a `code` / `id_token`. Returns a human-readable string composed
 * from `error` and `error_description`, or null if no error is present.
 *
 * Also wipes the saved OIDC state so the user can retry from scratch.
 */
export function parseOidcCallbackError(searchParams: URLSearchParams): string | null {
  const error = searchParams.get('error')
  if (!error) return null

  // Only honor an error callback when an OIDC flow is actually in progress.
  // Otherwise a crafted link (e.g. ?error=session_expired&error_description=
  // call+this+number) could inject attacker-controlled text into our trusted
  // error alert as a phishing aid.
  const pending = sessionStorage.getItem(SS_STATE)
  // Clean up any saved flow state regardless.
  sessionStorage.removeItem(SS_STATE)
  sessionStorage.removeItem(SS_NONCE)
  sessionStorage.removeItem(SS_IDP)
  sessionStorage.removeItem(SS_AUTH)
  if (!pending) return null

  // Return only the machine-readable error CODE — never the free-text
  // error_description, which is attacker/IdP-controlled prose.
  return error
}

/**
 * True when the URL carries OIDC/Azure callback parameters (the IdP redirected
 * back), as opposed to a normal page load. Lets the caller tell "no callback"
 * apart from "callback present but validation failed" so the latter can be
 * surfaced to the user instead of silently dropped.
 */
export function hasOidcCallbackParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has('code') ||
    searchParams.has('id_token') ||
    searchParams.has('access_token')
  )
}

/** Extract OIDC/Azure callback parameters from the URL (query params) */
export function parseOidcCallback(
  searchParams: URLSearchParams,
): OidcCallbackResult | null {
  const savedState = sessionStorage.getItem(SS_STATE)
  const savedNonce = sessionStorage.getItem(SS_NONCE)
  const savedIdp = sessionStorage.getItem(SS_IDP)
  const savedAuth = sessionStorage.getItem(SS_AUTH) as 'oidc' | 'azure' | null

  if (!savedState || !savedIdp || !savedAuth) return null

  const state = searchParams.get('state')
  const rawIdToken = searchParams.get('id_token')
  const accessToken = searchParams.get('access_token')
  const code = searchParams.get('code')
  // Prefer id_token, then access_token; only fall back to `code` as a last
  // resort (the server cannot exchange it, so this rarely succeeds — but we
  // always request id_token, so id_token is normally present).
  const token = rawIdToken ?? accessToken ?? code

  if (!state || state !== savedState || !token) return null

  // When the IdP returned an actual id_token (implicit / hybrid flow), verify
  // its `nonce` claim matches the one we generated. This blocks token-replay
  // attacks where an attacker reuses an id_token captured from another
  // session. For flows without an id_token, the server validates the value as
  // an access token via the userinfo endpoint.
  if (rawIdToken) {
    const claims = decodeJwtPayload(rawIdToken)
    if (!claims || !savedNonce || claims.nonce !== savedNonce) {
      // Clean up so the failed state cannot be re-used.
      sessionStorage.removeItem(SS_STATE)
      sessionStorage.removeItem(SS_NONCE)
      sessionStorage.removeItem(SS_IDP)
      sessionStorage.removeItem(SS_AUTH)
      return null
    }
  }

  // Clean up
  sessionStorage.removeItem(SS_STATE)
  sessionStorage.removeItem(SS_NONCE)
  sessionStorage.removeItem(SS_IDP)
  sessionStorage.removeItem(SS_AUTH)

  return { auth: savedAuth, idp: savedIdp, id_token: token }
}
