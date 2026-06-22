import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function PasskeyDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const pk = entry.passkey
  if (!pk) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.rpName')} value={pk.rp_name} />
      <EntryDetailField label={t('entry.rpId')} value={pk.rp_id} />
      <EntryDetailField label={t('entry.url')} value={pk.url} url copyable />
      <EntryDetailField label={t('entry.login')} value={pk.user} copyable />
      <EntryDetailField label={t('entry.credentialId')} value={pk.cred_id} />
    </div>
  )
}
