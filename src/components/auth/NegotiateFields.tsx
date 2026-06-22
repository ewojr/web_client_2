import { useTranslation } from 'react-i18next'
import { Monitor } from 'lucide-react'

export function NegotiateFields() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <Monitor className="h-5 w-5 shrink-0" />
      <p>{t('login.negotiateHint')}</p>
    </div>
  )
}
