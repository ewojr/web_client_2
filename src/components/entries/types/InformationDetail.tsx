import { useTranslation } from 'react-i18next'
import type { EntryDetail } from '@/api/types'

export function InformationDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const info = entry.information
  if (!info) return null

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t('entry.text')}
      </div>
      <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{info.text}</div>
    </div>
  )
}
