import { z } from 'zod'
import type { AuthMethod } from '@/api/types'

export interface AppConfig {
  /** Pre-filled server address (empty = user must enter) */
  defaultServer: string
  /** Default port */
  defaultPort: string
  /** When true, web client is served by PD Server — connection panel hidden, uses relative /v2.0 */
  bundled: boolean
  /** Auth modes to hide from the login page (e.g. ["negotiate", "webauthn"]) */
  disabledAuthModes: string[]
  /** Default authentication method (overridden by user's last-used method) */
  defaultAuthMethod: AuthMethod
}

const DEFAULT_CONFIG: AppConfig = {
  defaultServer: '',
  defaultPort: '8714',
  bundled: false,
  disabledAuthModes: [],
  defaultAuthMethod: 'standard',
}

const authMethodSchema = z.enum([
  'standard',
  'sspi',
  'negotiate',
  'webauthn',
  'oidc',
  'azure',
]) satisfies z.ZodType<AuthMethod>

const configSchema = z
  .object({
    bundled: z.boolean(),
    defaultServer: z.string(),
    defaultPort: z.string(),
    defaultAuthMethod: authMethodSchema,
    disabledAuthModes: z.array(authMethodSchema),
  })
  .partial()

let cachedConfig: AppConfig | null = null

export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config.json`)
    if (response.ok) {
      const json = await response.json()
      const parsed = configSchema.safeParse(json)
      if (parsed.success) {
        cachedConfig = { ...DEFAULT_CONFIG, ...parsed.data }
      } else {
        console.warn('Invalid config.json, falling back to defaults:', parsed.error)
        cachedConfig = DEFAULT_CONFIG
      }
    } else {
      cachedConfig = DEFAULT_CONFIG
    }
  } catch {
    cachedConfig = DEFAULT_CONFIG
  }

  return cachedConfig!
}

export function getConfig(): AppConfig {
  return cachedConfig ?? DEFAULT_CONFIG
}
