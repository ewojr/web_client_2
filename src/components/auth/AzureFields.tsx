import { useTranslation } from 'react-i18next'
import { Cloud } from 'lucide-react'

export function AzureFields() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <Cloud className="h-5 w-5 shrink-0" />
      <p>{t('login.azureHint')}</p>
    </div>
  )
}
