import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ServerFieldsProps {
  address: string
  port: string
  onAddressChange: (value: string) => void
  onPortChange: (value: string) => void
  disabled: boolean
  error: string | null
}

// Strip any user-supplied scheme / path / whitespace so we keep only a
// hostname (or hostname:port). The API client always builds the origin as
// `https://${address}:${port}`, so a pasted "http://..." would either be
// silently mishandled or produce a malformed URL. Returning a clean hostname
// here makes the HTTPS-only contract explicit.
function sanitizeAddress(raw: string): string {
  let value = raw.trim()
  // Drop any scheme prefix (http://, https://, ftp://, etc.)
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
  // Drop everything from the first /, ?, or # onward (paths, queries, hashes)
  value = value.split(/[/?#]/, 1)[0]
  return value
}

export function ServerFields({
  address,
  port,
  onAddressChange,
  onPortChange,
  disabled,
  error,
}: ServerFieldsProps) {
  const { t } = useTranslation()

  function handleAddressInput(raw: string) {
    const cleaned = sanitizeAddress(raw)
    // Pasting a full URL like "https://pd.example.com:8714" leaves
    // "pd.example.com:8714" here. Split a trailing ":<port>" into the port
    // field so we never build a doubled origin like
    // "https://host:8714:8714". IPv6 literals (multiple colons) are left
    // alone — they are handled at the API boundary.
    const hostPortMatch = /^([^:]+):(\d{1,5})$/.exec(cleaned)
    if (hostPortMatch) {
      onAddressChange(hostPortMatch[1])
      onPortChange(hostPortMatch[2])
      return
    }
    onAddressChange(cleaned)
  }

  function handlePortInput(raw: string) {
    // Ports are always digits; strip everything else so we can't ever build a
    // URL like https://host:foo/bar.
    onPortChange(raw.replace(/\D/g, '').slice(0, 5))
  }

  return (
    <div className="space-y-2">
      <Label>{t('login.serverConnection')}</Label>
      <div className="flex items-center gap-1.5">
        <Input
          value={address}
          onChange={(e) => handleAddressInput(e.target.value)}
          placeholder="pd-server.example.com"
          className="flex-1"
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <span className="text-muted-foreground">:</span>
        <Input
          value={port}
          onChange={(e) => handlePortInput(e.target.value)}
          placeholder="8714"
          className="w-20"
          disabled={disabled}
          inputMode="numeric"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
