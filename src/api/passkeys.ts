import { apiClient } from './client'
import type { PasskeyCompact, PasskeyDetail, PaginatedResponse } from './types'

// ── Registration (WebAuthn ceremony) ────────────────────────

export interface PasskeyBeginResponse {
  session_id: string
  publicKey: {
    rp: { id: string; name: string }
    user: { id: string; name: string; displayName: string }
    challenge: string
    pubKeyCredParams: Array<{ type: string; alg: number }>
    timeout: number | string
    excludeCredentials?: Array<{ id: string; type: string; transports?: string[] }>
    authenticatorSelection?: {
      authenticatorAttachment?: string
      userVerification?: string
      requireResidentKey?: boolean
      residentKey?: string
    }
    attestation?: string
  }
}

export interface PasskeyCompleteRequest {
  session_id: string
  name?: string
  id: string
  rawId: string
  type: 'public-key'
  response: {
    attestationObject: string
    clientDataJSON: string
    transports?: string[]
  }
}

// ── API functions ───────────────────────────────────────────

/** List the current user's registered passkeys */
export async function listPasskeys(): Promise<PasskeyCompact[]> {
  // Server returns either a paginated response or a plain array — handle both.
  const response = await apiClient<PaginatedResponse<PasskeyCompact> | PasskeyCompact[]>(
    '/me/passkeys',
  )
  if (Array.isArray(response)) return response
  return response.data ?? []
}

/** Begin passkey registration — returns challenge + session_id */
export function passkeyRegisterBegin(): Promise<PasskeyBeginResponse> {
  return apiClient<PasskeyBeginResponse>('/me/passkeys/begin', {
    method: 'POST',
    body: '{}',
  })
}

/** Complete passkey registration with attestation */
export function passkeyRegisterComplete(data: PasskeyCompleteRequest): Promise<PasskeyDetail> {
  return apiClient<PasskeyDetail>('/me/passkeys/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Rename a passkey */
export function renamePasskey(id: string, name: string): Promise<PasskeyCompact> {
  // Credential ID is Base64URL — encode for URL safety
  const encodedId = encodeURIComponent(id)
  return apiClient<PasskeyCompact>(`/me/passkeys/${encodedId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

/** Delete (revoke) a passkey */
export function deletePasskey(id: string): Promise<void> {
  const encodedId = encodeURIComponent(id)
  return apiClient<void>(`/me/passkeys/${encodedId}`, {
    method: 'DELETE',
  })
}
