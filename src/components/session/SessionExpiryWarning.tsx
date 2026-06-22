import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getProfile } from '@/api/auth'
import { ApiError } from '@/api/client'
import { describeApiError } from '@/lib/apiErrors'

const WARNING_DURATION_MS = 2 * 60 * 1000 // 2 minutes countdown

interface SessionExpiryWarningProps {
  open: boolean
  onStayLoggedIn: () => void
  onLogout: () => void
}

export function SessionExpiryWarning({ open, onStayLoggedIn, onLogout }: SessionExpiryWarningProps) {
  const { t } = useTranslation()
  const [remainingMs, setRemainingMs] = useState(WARNING_DURATION_MS)
  const [keepaliveError, setKeepaliveError] = useState<string | null>(null)
  const [isKeepingAlive, setIsKeepingAlive] = useState(false)
  // Initialized to a sentinel; the open-effect sets the real start time before
  // the interval ever reads it (keeps render pure — no Date.now() at render).
  const startTimeRef = useRef(0)

  // Reset countdown when dialog opens
  useEffect(() => {
    if (!open) return
    startTimeRef.current = Date.now()
    setRemainingMs(WARNING_DURATION_MS)
    setKeepaliveError(null)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, WARNING_DURATION_MS - elapsed)
      setRemainingMs(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onLogout()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [open, onLogout])

  const mins = Math.floor(remainingMs / 60000)
  const secs = Math.floor((remainingMs % 60000) / 1000)
  const progress = (remainingMs / WARNING_DURATION_MS) * 100

  async function handleStayLoggedIn() {
    setKeepaliveError(null)
    setIsKeepingAlive(true)
    try {
      await getProfile() // resets the server timer via apiClient
      onStayLoggedIn()
    } catch (err) {
      // A 401 means the session is already gone server-side — log out cleanly.
      if (err instanceof ApiError && err.status === 401) {
        onLogout()
        return
      }
      // A transient failure (network/5xx) did NOT extend the session: keep the
      // dialog open with an error so the user can retry, instead of closing it
      // and being silently hard-logged-out when the countdown hits zero.
      setKeepaliveError(describeApiError(err, t))
    } finally {
      setIsKeepingAlive(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle>{t('session.expiringTitle')}</DialogTitle>
          <DialogDescription>{t('session.expiringDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {t('session.timeRemaining')}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {keepaliveError && (
            <Alert variant="destructive">
              <AlertDescription>{keepaliveError}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onLogout} disabled={isKeepingAlive}>
              {t('session.logoutNow')}
            </Button>
            <Button className="flex-1" onClick={handleStayLoggedIn} disabled={isKeepingAlive}>
              {t('session.stayLoggedIn')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
