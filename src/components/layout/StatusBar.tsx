import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'

const SESSION_TIMEOUT_MS = 10 * 60 * 1000

interface StatusBarProps {
  itemCount?: number
  folderName?: string
}

export function StatusBar({ itemCount, folderName }: StatusBarProps) {
  const { t } = useTranslation()
  const lastApiCallAt = useAuthStore((s) => s.lastApiCallAt)
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    if (!lastApiCallAt) return

    function update() {
      const elapsed = Date.now() - lastApiCallAt!
      const remainingMs = Math.max(0, SESSION_TIMEOUT_MS - elapsed)
      const mins = Math.floor(remainingMs / 60000)
      const secs = Math.floor((remainingMs % 60000) / 1000)
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [lastApiCallAt])

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-1.5">
        {lastApiCallAt && (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              {t('status.sessionActive')} — {remaining} {t('status.remaining')}
            </span>
          </>
        )}
      </div>
      <div>
        {itemCount !== undefined && folderName && (
          <span>{t('status.itemCount', { count: itemCount, folder: folderName })}</span>
        )}
      </div>
    </div>
  )
}
