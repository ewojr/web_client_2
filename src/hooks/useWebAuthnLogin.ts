import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { webauthnBegin, webauthnComplete } from '@/api/webauthn'
import { getProfile } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { base64ToArrayBuffer, arrayBufferToBase64 } from '@/lib/base64'
import { ApiError } from '@/api/client'

interface UseWebAuthnLoginResult {
  execute: (username: string) => Promise<void>
  isLoading: boolean
}

export function useWebAuthnLogin(
  onSuccess: () => void,
  onError: (message: string) => void,
): UseWebAuthnLoginResult {
  const { t } = useTranslation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (username: string) => {
      if (!username.trim() || isLoading) return
      setIsLoading(true)

      try {
        // Step 1: Begin assertion
        const beginResponse = await webauthnBegin(username.trim())

        // Step 2: Convert challenge and credential IDs from Base64 to ArrayBuffer
        const publicKeyOptions: PublicKeyCredentialRequestOptions = {
          challenge: base64ToArrayBuffer(beginResponse.publicKey.challenge),
          rpId: beginResponse.publicKey.rpId,
          allowCredentials: beginResponse.publicKey.allowCredentials.map((cred) => ({
            type: 'public-key' as const,
            id: base64ToArrayBuffer(cred.id),
            transports: cred.transports as AuthenticatorTransport[] | undefined,
          })),
          userVerification:
            beginResponse.publicKey.userVerification as UserVerificationRequirement,
          timeout: Number(beginResponse.publicKey.timeout),
        }

        // Step 3: Call browser credentials API
        const credential = (await navigator.credentials.get({
          publicKey: publicKeyOptions,
        })) as PublicKeyCredential | null

        if (!credential) {
          onError(t('login.passkeyCancel'))
          return
        }

        const assertionResponse = credential.response as AuthenticatorAssertionResponse

        // Step 4: Complete assertion
        const result = await webauthnComplete({
          session_id: beginResponse.session_id,
          id: credential.id,
          response: {
            authenticatorData: arrayBufferToBase64(assertionResponse.authenticatorData),
            clientDataJSON: arrayBufferToBase64(assertionResponse.clientDataJSON),
            signature: arrayBufferToBase64(assertionResponse.signature),
            userHandle: assertionResponse.userHandle
              ? arrayBufferToBase64(assertionResponse.userHandle)
              : null,
          },
        })

        // Step 5: Store token and fetch profile
        useAuthStore.getState().setToken(result.access_token)
        try {
          const profile = await getProfile()
          setAuth(result.access_token, profile)
          onSuccess()
        } catch (profileErr) {
          // Don't leave an orphaned token persisted if the profile fetch fails
          // after the grant — clear it and revoke the server session.
          useAuthStore.getState().logout({ broadcast: false, revoke: true })
          throw profileErr
        }
      } catch (err) {
        // Log only the message — full error objects can contain credential
        // hints or server payload echoes that we don't want in browser logs.
        console.error('WebAuthn error:', err instanceof Error ? err.message : String(err))
        if (err instanceof ApiError) {
          onError(err.message)
        } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
          onError(t('login.passkeyCancel'))
        } else if (err instanceof DOMException) {
          // SecurityError (rpId mismatch), TypeError, etc. — show the real message
          onError(err.message)
        } else {
          onError(err instanceof Error ? err.message : t('login.passkeyError'))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, onSuccess, onError, setAuth, t],
  )

  return { execute, isLoading }
}
