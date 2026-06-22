import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function RdpDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const rdp = entry.rdp
  if (!rdp) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.host')} value={rdp.host} copyable />
      <EntryDetailField label={t('entry.login')} value={rdp.user} copyable />
      <EntryDetailField label={t('entry.password')} value={rdp.pass} sensitive copyable />
      <EntryDetailField label={t('entry.cmdLine')} value={rdp.cmd_line} />
    </div>
  )
}
