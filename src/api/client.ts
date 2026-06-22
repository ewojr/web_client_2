import { toBase64 } from '@/lib/base64'
import type { ApiErrorResponse } from './types'

/**
 * Bindings the api/ layer needs from the rest of the app. Registered once at
 * boot via `configureApi()` so this module has zero direct knowledge of
 * stores, config, or routing — making it portable and trivially mockable in
 * tests.
 */
export interface ApiBindings {
  /** Resolved at every request: where to send it, and the bearer token (if any). */
  getContext: () => { serverOrigin: string; token: string | null }
  /** Called after every successful request so the app can reset its session watchdog. */
  onActivity: () => void
  /** Called when the server returns 401 so the app can clear local auth state. */
  onAuthFailure: () => void
}

const noopBindings: ApiBindings = {
  getContext: () => ({ serverOrigin: '', token: null }),
  onActivity: () => {},
  onAuthFailure: () => {},
}

let bindings: ApiBindings = noopBindings

export function configureApi(next: ApiBindings): void {
  bindings = next
}

/** Returns the server origin (e.g. "https://host:8714") or "" for bundled/same-origin mode. */
export function getServerOrigin(): string {
  return bindings.getContext().serverOrigin
}

function getApiBase(): string {
  return `${getServerOrigin()}/v2.0`
}

/** Auth headers for endpoints that bypass `apiClient` (raw fetch / XHR uploads). */
export function buildAuthHeaders(): Record<string, string> {
  const { token } = bindings.getContext()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function notifyApiActivity(): void {
  bindings.onActivity()
}

export function notifyApiAuthFailure(): void {
  bindings.onAuthFailure()
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  secondPassword?: string
}

export class ApiError extends Error {
  status: number
  code: number

  constructor(status: number, code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, secondPassword, headers: customHeaders, ...fetchOptions } = options

  const headers = new Headers(customHeaders)

  if (!skipAuth) {
    const { token } = bindings.getContext()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (secondPassword) {
    headers.set('X-Second-Password', toBase64(secondPassword))
  }

  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getApiBase()}${endpoint}`, {
    // Never let API responses — which carry plaintext passwords in entry
    // detail bodies — be written to the browser's persistent disk cache. The
    // server does not send Cache-Control, so without this a decrypted password
    // could survive logout in the on-disk HTTP cache of a shared machine.
    // Placed before the spread so a caller can still override per request.
    cache: 'no-store',
    ...fetchOptions,
    headers,
  })

  // Reset session watchdog on any successful API call
  if (response.ok) {
    notifyApiActivity()
  }

  if (!response.ok) {
    let errorCode = response.status
    let errorMessage = response.statusText

    try {
      const body = (await response.json()) as ApiErrorResponse
      errorCode = body.error.code
      errorMessage = body.error.message
    } catch {
      // Response body wasn't JSON — use status text
    }

    // Auto-logout on 401 (expired/invalid token)
    if (response.status === 401 && !skipAuth) {
      notifyApiAuthFailure()
    }

    throw new ApiError(response.status, errorCode, errorMessage)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
