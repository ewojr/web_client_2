import { useTranslation } from 'react-i18next'
import { Settings, Sun, Moon, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOptionsStore, type Theme } from '@/stores/optionsStore'

interface OptionsDialogProps {
  open: boolean
  onClose: () => void
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

const THEMES: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
  { value: 'system', labelKey: 'options.theme_system', icon: Monitor },
  { value: 'light', labelKey: 'options.theme_light', icon: Sun },
  { value: 'dark', labelKey: 'options.theme_dark', icon: Moon },
]

export function OptionsDialog({ open, onClose }: OptionsDialogProps) {
  const { t, i18n } = useTranslation()
  const options = useOptionsStore()
  // `language` is null until explicitly chosen — show the active (detected)
  // language so the Select isn't blank.
  const selectedLanguage = options.language ?? i18n.language

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('options.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('options.language')}
            </h3>
            <Select
              value={selectedLanguage}
              onValueChange={(val) => { if (val) options.setLanguage(val) }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <Separator />

          {/* Connection */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('options.connection')}
            </h3>

            <div className="space-y-2">
              <Label className="text-sm">{t('options.defaultServer')}</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={options.defaultServer ?? ''}
                  onChange={(e) => options.setDefaultServer(e.target.value)}
                  placeholder="pd-server.example.com"
                  className="flex-1"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  value={options.defaultPort ?? '8714'}
                  onChange={(e) => options.setDefaultPort(e.target.value)}
                  placeholder="8714"
                  className="w-20"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('options.defaultServerDesc')}
              </p>
            </div>
          </section>

          <Separator />

          {/* Security */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('options.security')}
            </h3>

            <div className="space-y-1">
              <Label className="text-sm">{t('options.clipboardClear')}</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={options.clipboardAutoClearSeconds}
                  onChange={(e) => options.setClipboardAutoClearSeconds(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-10 text-right text-sm font-medium tabular-nums">
                  {options.clipboardAutoClearSeconds}s
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">{t('options.autoLock')}</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={options.autoLockMinutes}
                  onChange={(e) => options.setAutoLockMinutes(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-10 text-right text-sm font-medium tabular-nums">
                  {options.autoLockMinutes}m
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Theme */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('options.theme')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(({ value, labelKey, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => options.setTheme(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors ${
                    options.theme === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
