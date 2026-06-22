import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function CreditCardDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const cc = entry.credit_card
  if (!cc) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.cardBrand')} value={cc.card} />
      <EntryDetailField label={t('entry.cardNumber')} value={cc.number} sensitive copyable />
      <EntryDetailField label={t('entry.cardHolder')} value={cc.holder} copyable />
      <EntryDetailField label={t('entry.validThru')} value={cc.valid_thru} />
      <EntryDetailField label={t('entry.cvv')} value={cc.cvv} sensitive copyable />
      <EntryDetailField label={t('entry.pin')} value={cc.pin} sensitive copyable />
      <EntryDetailField label={t('entry.phone')} value={cc.phone} copyable />
      <EntryDetailField label={t('entry.url')} value={cc.url} url copyable />
      <EntryDetailField label={t('entry.onlineUser')} value={cc.online_user} copyable />
      <EntryDetailField label={t('entry.onlinePass')} value={cc.online_pass} sensitive copyable />
    </div>
  )
}
