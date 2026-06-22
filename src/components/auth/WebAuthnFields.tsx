import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Fingerprint } from 'lucide-react'

interface WebAuthnFieldsProps {
  username: string
  onUsernameChange: (value: string) => void
  disabled: boolean
}

export function WebAuthnFields({ username, onUsernameChange, disabled }: WebAuthnFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="username">{t('login.username')}</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="john.doe"
          autoComplete="username"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <Fingerprint className="h-5 w-5 shrink-0" />
        <p>{t('login.webauthnHint')}</p>
      </div>
    </>
  )
}
