import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function PuttyDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const putty = entry.putty
  if (!putty) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.host')} value={putty.host} copyable />
      <EntryDetailField label={t('entry.port')} value={putty.port?.toString()} />
      <EntryDetailField label={t('entry.protocol')} value={putty.protocol} />
      <EntryDetailField label={t('entry.login')} value={putty.user} copyable />
      <EntryDetailField label={t('entry.password')} value={putty.pass} sensitive copyable />
      <EntryDetailField label={t('entry.keyFile')} value={putty.key_file} />
      <EntryDetailField label={t('entry.keyPass')} value={putty.key_pass} sensitive copyable />
      <EntryDetailField label={t('entry.cmdLine')} value={putty.cmd_line} />
    </div>
  )
}
