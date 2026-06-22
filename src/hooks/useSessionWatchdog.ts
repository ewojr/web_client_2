import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'

const SESSION_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes (server timeout)
const WARNING_BEFORE_MS = 2 * 60 * 1000 // warn 2 min before expiry

interface UseSessionWatchdogOptions {
  onWarning: () => void
  onExpired: () => void
}

export function useSessionWatchdog({ onWarning, onExpired }: UseSessionWatchdogOptions) {
  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastApiCallAt = useAuthStore((s) => s.lastApiCallAt)

  useEffect(() => {
    if (!lastApiCallAt) {
      clearTimeout(warningTimerRef.current)
      clearTimeout(expiryTimerRef.current)
      return
    }

    // Recompute deadlines from the wall clock and (re)arm the timers. Called on
    // mount and again whenever the tab regains focus/visibility, because
    // setTimeout fires late after background-tab throttling or OS sleep/resume.
    function evaluate() {
      const elapsed = Date.now() - lastApiCallAt!
      const timeUntilWarning = SESSION_TIMEOUT_MS - WARNING_BEFORE_MS - elapsed
      const timeUntilExpiry = SESSION_TIMEOUT_MS - elapsed

      clearTimeout(warningTimerRef.current)
      clearTimeout(expiryTimerRef.current)

      if (timeUntilExpiry <= 0) {
        onExpired()
        return
      }
      expiryTimerRef.current = setTimeout(onExpired, timeUntilExpiry)

      if (timeUntilWarning > 0) {
        warningTimerRef.current = setTimeout(onWarning, timeUntilWarning)
      } else {
        // Already inside the warning window — e.g. sessionStorage rehydration
        // after F5 at minute 9, or a tab that slept past the warning point.
        onWarning()
      }
    }

    evaluate()

    function onVisible() {
      if (document.visibilityState === 'visible') evaluate()
    }
    window.addEventListener('focus', evaluate)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(warningTimerRef.current)
      clearTimeout(expiryTimerRef.current)
      window.removeEventListener('focus', evaluate)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [lastApiCallAt, onWarning, onExpired])
}
