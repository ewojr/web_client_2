import { useTranslation } from 'react-i18next'
import { EntryDetailField } from '../EntryDetailField'
import type { EntryDetail } from '@/api/types'

export function BankingDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const bank = entry.banking
  if (!bank) return null

  return (
    <div className="space-y-4">
      <EntryDetailField label={t('entry.bankName')} value={bank.bank_name} />
      <EntryDetailField label={t('entry.bankId')} value={bank.bank_id} copyable />
      <EntryDetailField label={t('entry.iban')} value={bank.iban} copyable />
      <EntryDetailField label={t('entry.bic')} value={bank.bic} copyable />
      <EntryDetailField label={t('entry.accountHolder')} value={bank.holder} />
      <EntryDetailField label={t('entry.accountNumber')} value={bank.account_number} copyable />
      <EntryDetailField label={t('entry.legitimationId')} value={bank.legitimation_id} copyable />
      <EntryDetailField label={t('entry.cardNumber')} value={bank.card_number} sensitive copyable />
      <EntryDetailField label={t('entry.pin')} value={bank.pin} sensitive copyable />
      <EntryDetailField label={t('entry.url')} value={bank.url} url copyable />
      <EntryDetailField label={t('entry.login')} value={bank.user} copyable />
      <EntryDetailField label={t('entry.password')} value={bank.pass} sensitive copyable />
      <EntryDetailField label={t('entry.phone')} value={bank.phone} copyable />
    </div>
  )
}
