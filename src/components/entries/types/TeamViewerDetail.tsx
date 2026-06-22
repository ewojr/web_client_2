import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function TeamViewerDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const tv = entry.teamviewer
  if (!tv) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.partnerId')} value={tv.partner_id} copyable />
      <EntryDetailField label={t('entry.password')} value={tv.pass} sensitive copyable />
      <EntryDetailField label={t('entry.mode')} value={tv.mode} />
    </div>
  )
}
