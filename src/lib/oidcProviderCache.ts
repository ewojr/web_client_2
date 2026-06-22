import type { OidcProvider } from '@/api/types'

const CACHE_KEY_PREFIX = 'pd-oidc-providers-'

function serverKey(address: string, port: string): string {
  return `${CACHE_KEY_PREFIX}${address}:${port}`
}

export function getCachedProviders(address: string, port: string): OidcProvider[] | null {
  try {
    const raw = localStorage.getItem(serverKey(address, port))
    if (!raw) return null
    return JSON.parse(raw) as OidcProvider[]
  } catch {
    return null
  }
}

export function setCachedProviders(address: string, port: string, providers: OidcProvider[]): void {
  try {
    localStorage.setItem(serverKey(address, port), JSON.stringify(providers))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function clearCachedProviders(address: string, port: string): void {
  localStorage.removeItem(serverKey(address, port))
}
