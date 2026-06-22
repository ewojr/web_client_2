import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  passkeyRegisterBegin,
  passkeyRegisterComplete,
} from '@/api/passkeys'
import { base64ToArrayBuffer, arrayBufferToBase64 } from '@/lib/base64'
import { ApiError } from '@/api/client'
import type { PasskeyDetail } from '@/api/types'

interface UseWebAuthnRegisterResult {
  execute: (name?: string) => Promise<PasskeyDetail | null>
  isLoading: boolean
  error: string | null
}

/**
 * Performs the WebAuthn registration ceremony to add a new passkey
 * to the current user's account.
 */
export function useWebAuthnRegister(): UseWebAuthnRegisterResult {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (name?: string): Promise<PasskeyDetail | null> => {
      if (isLoading) return null
      setIsLoading(true)
      setError(null)

      try {
        // Step 1: Begin registration
        const begin = await passkeyRegisterBegin()

        // Step 2: Convert challenge, user ID and excludeCredentials to ArrayBuffers
        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
          rp: begin.publicKey.rp,
          user: {
            id: base64ToArrayBuffer(begin.publicKey.user.id),
            name: begin.publicKey.user.name,
            displayName: begin.publicKey.user.displayName,
          },
          challenge: base64ToArrayBuffer(begin.publicKey.challenge),
          pubKeyCredParams: begin.publicKey.pubKeyCredParams.map((p) => ({
            type: 'public-key' as const,
            alg: p.alg,
          })),
          timeout: Number(begin.publicKey.timeout),
          excludeCredentials: begin.publicKey.excludeCredentials?.map((c) => ({
            type: 'public-key' as const,
            id: base64ToArrayBuffer(c.id),
            transports: c.transports as AuthenticatorTransport[] | undefined,
          })),
          authenticatorSelection: begin.publicKey.authenticatorSelection as
            | AuthenticatorSelectionCriteria
            | undefined,
          attestation: begin.publicKey.attestation as AttestationConveyancePreference | undefined,
        }

        // Step 3: Call browser credentials API
        const credential = (await navigator.credentials.create({
          publicKey: publicKeyOptions,
        })) as PublicKeyCredential | null

        if (!credential) {
          setError(t('passkey.registerCancel'))
          return null
        }

        const attestationResponse = credential.response as AuthenticatorAttestationResponse
        const transports = (attestationResponse.getTransports?.() ?? []) as string[]

        // Step 4: Complete registration
        const result = await passkeyRegisterComplete({
          session_id: begin.session_id,
          name: name?.trim() || undefined,
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          type: 'public-key',
          response: {
            attestationObject: arrayBufferToBase64(attestationResponse.attestationObject),
            clientDataJSON: arrayBufferToBase64(attestationResponse.clientDataJSON),
            transports,
          },
        })

        return result
      } catch (err) {
        // Log only the message — full error objects can contain credential
        // hints or server payload echoes that we don't want in browser logs.
        console.error(
          'Passkey registration error:',
          err instanceof Error ? err.message : String(err),
        )
        if (err instanceof ApiError) {
          setError(err.message)
        } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError(t('passkey.registerCancel'))
        } else if (err instanceof DOMException && err.name === 'InvalidStateError') {
          setError(t('passkey.registerAlreadyExists'))
        } else if (err instanceof DOMException) {
          setError(err.message)
        } else {
          setError(err instanceof Error ? err.message : t('passkey.registerError'))
        }
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, t],
  )

  return { execute, isLoading, error }
}
