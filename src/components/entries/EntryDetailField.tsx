import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/common/CopyButton'
import { getSafeHref } from '@/lib/url'

interface EntryDetailFieldProps {
  label: string
  value?: string | null
  sensitive?: boolean
  copyable?: boolean
  url?: boolean
}

export function EntryDetailField({
  label,
  value,
  sensitive = false,
  copyable = false,
  url = false,
}: EntryDetailFieldProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)

  if (!value) return null

  const displayValue = sensitive && !revealed ? '••••••••••••' : value
  const safeHref = url ? getSafeHref(value) : null

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="flex items-center gap-2">
        {url && safeHref ? (
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 truncate text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className={`min-w-0 truncate text-sm ${sensitive && !revealed ? 'font-mono tracking-wider' : ''}`}>
            {displayValue}
          </span>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {sensitive && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setRevealed(!revealed)}
              aria-label={revealed ? t('entry.hidePassword') : t('entry.revealPassword')}
              aria-pressed={revealed}
            >
              {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          )}
          {copyable && <CopyButton value={value} />}
        </div>
      </div>
    </div>
  )
}
