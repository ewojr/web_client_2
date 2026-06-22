import type { TFunction } from 'i18next'
import { ApiError } from '@/api/client'

/**
 * Classifies a thrown value into a user-facing message. The PD Server's own
 * error message is preferred when present (it's typically already in the
 * user's language and matches the server's vocabulary); otherwise we fall
 * back to a generic localized hint based on the HTTP status.
 *
 * Network-layer failures (`fetch()` throwing TypeError) become a single
 * "check your connection / certificate" message — browsers do not expose
 * enough detail to differentiate offline / DNS / CORS / TLS reliably, so
 * grouping them is more honest than a misleading specific message.
 */
export function describeApiError(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    if (err.message) return err.message
    return defaultMessageForStatus(err.status, t)
  }
  if (err instanceof TypeError) {
    return t('errors.network')
  }
  if (err instanceof Error) {
    return err.message || t('errors.unknown')
  }
  return t('errors.unknown')
}

function defaultMessageForStatus(status: number, t: TFunction): string {
  if (status === 401) return t('errors.sessionExpired')
  if (status === 403) return t('errors.permissionDenied')
  if (status === 404) return t('errors.notFound')
  if (status === 409) return t('errors.conflict')
  if (status === 429) return t('errors.rateLimit')
  if (status >= 500) return t('errors.serverError')
  return t('errors.unknown')
}
