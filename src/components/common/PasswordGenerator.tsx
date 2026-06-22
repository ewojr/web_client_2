import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CopyButton } from './CopyButton'

interface PasswordGeneratorProps {
  onUse: (password: string) => void
}

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// Draw a uniformly random integer in [0, max) from crypto, using rejection
// sampling to avoid the modulo bias of `value % max`.
function randomIndex(max: number): number {
  if (max <= 0) return 0
  const limit = Math.floor(2 ** 32 / max) * max
  const buf = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buf)
    value = buf[0]
  } while (value >= limit)
  return value % max
}

// Pick a single random character from a pool with unbiased sampling.
function randomChar(pool: string): string {
  return pool[randomIndex(pool.length)]
}

function generatePassword(length: number, options: Record<string, boolean>): string {
  const pools: string[] = []
  if (options.uppercase) pools.push(CHARS.uppercase)
  if (options.lowercase) pools.push(CHARS.lowercase)
  if (options.digits) pools.push(CHARS.digits)
  if (options.symbols) pools.push(CHARS.symbols)
  if (pools.length === 0) pools.push(CHARS.lowercase, CHARS.digits)

  const merged = pools.join('')
  // Ensure we have room for at least one character from every selected class.
  const total = Math.max(length, pools.length)

  // Guarantee one character from each selected class, then fill the rest from
  // the merged pool, then shuffle so the guaranteed characters are not always
  // at the front.
  const out: string[] = pools.map((pool) => randomChar(pool))
  for (let i = out.length; i < total; i++) {
    out.push(randomChar(merged))
  }

  // Unbiased Fisher-Yates shuffle.
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }

  return out.join('')
}

function calcStrength(password: string): number {
  let pool = 0
  if (/[a-z]/.test(password)) pool += 26
  if (/[A-Z]/.test(password)) pool += 26
  if (/\d/.test(password)) pool += 10
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32
  const entropy = password.length * Math.log2(pool || 1)
  if (entropy < 28) return 1
  if (entropy < 36) return 2
  if (entropy < 60) return 3
  if (entropy < 80) return 4
  return 5
}

const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']

export function PasswordGenerator({ onUse }: PasswordGeneratorProps) {
  const { t } = useTranslation()
  const [length, setLength] = useState(20)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  })
  const [password, setPassword] = useState(() => generatePassword(20, options))

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, options))
  }, [length, options])

  function handleLengthChange(newLength: number) {
    setLength(newLength)
    setPassword(generatePassword(newLength, options))
  }

  const enabledCount = Object.values(options).filter(Boolean).length

  function toggleOption(key: keyof typeof options) {
    // Never allow unchecking the last enabled class — at least one character
    // class must remain selected so the generated password is well-defined.
    if (options[key] && enabledCount <= 1) return
    const next = { ...options, [key]: !options[key] }
    setOptions(next)
    setPassword(generatePassword(length, next))
  }

  const strength = calcStrength(password)

  return (
    <div className="space-y-4">
      {/* Generated password */}
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
        <code className="min-w-0 flex-1 break-all text-sm">{password}</code>
        <CopyButton value={password} />
        <Button variant="outline" size="icon-xs" onClick={regenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < strength ? STRENGTH_COLORS[strength] : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* Length slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t('passwordGen.length')}</Label>
          <span className="text-xs font-medium">{length}</span>
        </div>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => handleLengthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Character options */}
      <div className="grid grid-cols-2 gap-2">
        {(['uppercase', 'lowercase', 'digits', 'symbols'] as const).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={`pw-${key}`}
              checked={options[key]}
              disabled={options[key] && enabledCount <= 1}
              onCheckedChange={() => toggleOption(key)}
            />
            <Label htmlFor={`pw-${key}`} className="text-xs font-normal">
              {t(`passwordGen.${key}`)}
            </Label>
          </div>
        ))}
      </div>

      {/* Use button */}
      <Button className="w-full" onClick={() => onUse(password)}>
        {t('passwordGen.use')}
      </Button>
    </div>
  )
}
