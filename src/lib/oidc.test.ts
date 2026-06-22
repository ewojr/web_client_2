import { describe, it, expect, beforeEach } from 'vitest'
import { parseOidcCallback, parseOidcCallbackError } from './oidc'

// Helper: build a minimal JWT with the given payload claims. No real signature
// — the client never verifies signatures (the PD Server does).
function makeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'RS256', typ: 'JWT' }
  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${enc(header)}.${enc(payload)}.signature`
}

const SS_STATE = 'pd-oidc-state'
const SS_NONCE = 'pd-oidc-nonce'
const SS_IDP = 'pd-oidc-idp'
const SS_AUTH = 'pd-oidc-auth'

function primeSession(opts: { state: string; nonce: string; idp: string; auth: 'oidc' | 'azure' }) {
  sessionStorage.setItem(SS_STATE, opts.state)
  sessionStorage.setItem(SS_NONCE, opts.nonce)
  sessionStorage.setItem(SS_IDP, opts.idp)
  sessionStorage.setItem(SS_AUTH, opts.auth)
}

describe('parseOidcCallback', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('no in-flight OIDC request', () => {
    it('returns null when sessionStorage is empty', () => {
      const params = new URLSearchParams('state=abc&id_token=xyz')
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('returns null when only state was saved (incomplete)', () => {
      sessionStorage.setItem(SS_STATE, 'abc')
      const params = new URLSearchParams('state=abc&code=xyz')
      expect(parseOidcCallback(params)).toBeNull()
    })
  })

  describe('state validation', () => {
    it('rejects mismatched state', () => {
      primeSession({ state: 'expected', nonce: 'n', idp: 'p', auth: 'oidc' })
      const params = new URLSearchParams('state=attacker&code=xyz')
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('rejects missing state', () => {
      primeSession({ state: 'expected', nonce: 'n', idp: 'p', auth: 'oidc' })
      const params = new URLSearchParams('code=xyz')
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('accepts auth-code flow when state matches', () => {
      primeSession({ state: 'good', nonce: 'n', idp: 'ping', auth: 'oidc' })
      const params = new URLSearchParams('state=good&code=auth-code-from-server')
      expect(parseOidcCallback(params)).toEqual({
        auth: 'oidc',
        idp: 'ping',
        id_token: 'auth-code-from-server',
      })
    })
  })

  describe('nonce validation (id_token in callback)', () => {
    it('accepts when id_token nonce matches saved nonce', () => {
      const nonce = 'random-nonce-value'
      primeSession({ state: 's', nonce, idp: 'azure', auth: 'azure' })
      const idToken = makeJwt({ sub: 'user-1', nonce, aud: 'app' })
      const params = new URLSearchParams(`state=s&id_token=${idToken}`)
      expect(parseOidcCallback(params)).toEqual({
        auth: 'azure',
        idp: 'azure',
        id_token: idToken,
      })
    })

    it('rejects replayed id_token with different nonce', () => {
      primeSession({ state: 's', nonce: 'fresh', idp: 'p', auth: 'oidc' })
      const idToken = makeJwt({ sub: 'u', nonce: 'stolen-from-other-session' })
      const params = new URLSearchParams(`state=s&id_token=${idToken}`)
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('rejects id_token with no nonce claim', () => {
      primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
      const idToken = makeJwt({ sub: 'u', aud: 'app' }) // nonce missing
      const params = new URLSearchParams(`state=s&id_token=${idToken}`)
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('rejects unparseable id_token', () => {
      primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
      const params = new URLSearchParams('state=s&id_token=not-a-jwt')
      expect(parseOidcCallback(params)).toBeNull()
    })

    it('clears sessionStorage on nonce mismatch so the failed state cannot be re-used', () => {
      primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
      const idToken = makeJwt({ nonce: 'wrong' })
      parseOidcCallback(new URLSearchParams(`state=s&id_token=${idToken}`))
      expect(sessionStorage.getItem(SS_STATE)).toBeNull()
      expect(sessionStorage.getItem(SS_NONCE)).toBeNull()
    })
  })

  describe('cleanup on success', () => {
    it('clears all sessionStorage keys after a successful callback', () => {
      primeSession({ state: 'good', nonce: 'n', idp: 'p', auth: 'oidc' })
      parseOidcCallback(new URLSearchParams('state=good&code=xyz'))
      expect(sessionStorage.getItem(SS_STATE)).toBeNull()
      expect(sessionStorage.getItem(SS_NONCE)).toBeNull()
      expect(sessionStorage.getItem(SS_IDP)).toBeNull()
      expect(sessionStorage.getItem(SS_AUTH)).toBeNull()
    })
  })
})

describe('parseOidcCallbackError', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns null when no error is in the URL', () => {
    expect(parseOidcCallbackError(new URLSearchParams('state=x&code=y'))).toBeNull()
    expect(parseOidcCallbackError(new URLSearchParams(''))).toBeNull()
  })

  it('returns null for an error link when no OIDC flow is in progress (anti-phishing)', () => {
    // No primed session — a crafted ?error=...&error_description=... link must
    // not be able to render attacker-controlled text in the trusted alert.
    expect(parseOidcCallbackError(new URLSearchParams('error=access_denied'))).toBeNull()
    const crafted = new URLSearchParams()
    crafted.set('error', 'session_expired')
    crafted.set('error_description', 'Call +1-555-SCAM to restore access')
    expect(parseOidcCallbackError(crafted)).toBeNull()
  })

  it('returns the error code (only) when an OIDC flow is in progress', () => {
    primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
    expect(parseOidcCallbackError(new URLSearchParams('error=access_denied'))).toBe('access_denied')
  })

  it('drops the free-text error_description to avoid injecting attacker prose', () => {
    primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
    const params = new URLSearchParams()
    params.set('error', 'invalid_client')
    params.set('error_description', 'The client_id is unknown to the IdP.')
    expect(parseOidcCallbackError(params)).toBe('invalid_client')
  })

  it('clears saved OIDC state so the user can retry from scratch', () => {
    primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
    parseOidcCallbackError(new URLSearchParams('error=access_denied'))
    expect(sessionStorage.getItem(SS_STATE)).toBeNull()
    expect(sessionStorage.getItem(SS_NONCE)).toBeNull()
    expect(sessionStorage.getItem(SS_IDP)).toBeNull()
    expect(sessionStorage.getItem(SS_AUTH)).toBeNull()
  })

  it('does not clear state when no error is present', () => {
    primeSession({ state: 's', nonce: 'n', idp: 'p', auth: 'oidc' })
    parseOidcCallbackError(new URLSearchParams('state=s&code=ok'))
    expect(sessionStorage.getItem(SS_STATE)).toBe('s')
  })
})
