import { useTranslation } from 'react-i18next'
import type { AuthMethod } from '@/api/types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AuthMethodSelectProps {
  value: AuthMethod
  onChange: (method: AuthMethod) => void
  disabled: boolean
  disabledMethods?: string[]
}

const AUTH_METHODS: { value: AuthMethod; labelKey: string }[] = [
  { value: 'standard', labelKey: 'login.authStandard' },
  { value: 'sspi', labelKey: 'login.authSspi' },
  { value: 'negotiate', labelKey: 'login.authNegotiate' },
  { value: 'webauthn', labelKey: 'login.authWebauthn' },
  { value: 'oidc', labelKey: 'login.authOidc' },
  { value: 'azure', labelKey: 'login.authAzure' },
]

export function AuthMethodSelect({
  value,
  onChange,
  disabled,
  disabledMethods = [],
}: AuthMethodSelectProps) {
  const { t } = useTranslation()

  const availableMethods = AUTH_METHODS.filter(
    (m) => !disabledMethods.includes(m.value),
  )

  return (
    <div className="space-y-2">
      <Label>{t('login.authMethod')}</Label>
      <Select value={value} onValueChange={(val) => onChange(val as AuthMethod)} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {t(availableMethods.find((m) => m.value === value)?.labelKey ?? 'login.authStandard')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableMethods.map((method) => (
            <SelectItem key={method.value} value={method.value}>
              {t(method.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
