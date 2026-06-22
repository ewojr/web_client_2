import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SspiFieldsProps {
  username: string
  password: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  disabled: boolean
}

export function SspiFields({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  disabled,
}: SspiFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="username">{t('login.username')}</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="user@domain.com"
          autoComplete="username"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('login.sspiHint')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t('login.password')}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="current-password"
          disabled={disabled}
        />
      </div>
    </>
  )
}
