import { useTranslation } from 'react-i18next'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OidcProvider } from '@/api/types'

interface OidcProviderSelectProps {
  providers: OidcProvider[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRefresh: () => void
  isRefreshing: boolean
  disabled: boolean
}

export function OidcProviderSelect({
  providers,
  selectedId,
  onSelect,
  onRefresh,
  isRefreshing,
  disabled,
}: OidcProviderSelectProps) {
  const { t } = useTranslation()

  if (providers.length === 0 && !isRefreshing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('login.oidcProvider')}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={disabled}
            className="h-6 gap-1 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            {t('login.oidcRefresh')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t('login.oidcNoProviders')}</p>
      </div>
    )
  }

  if (isRefreshing && providers.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{t('login.oidcProvider')}</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('login.oidcLoading')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t('login.oidcProvider')}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={disabled || isRefreshing}
          className="h-6 gap-1 px-2 text-xs"
        >
          {isRefreshing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {t('login.oidcRefresh')}
        </Button>
      </div>
      <Select
        value={selectedId ?? undefined}
        onValueChange={(val) => { if (val) onSelect(val) }}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('login.oidcSelectProvider')}>
            {selectedId
              ? providers.find((p) => p.id === selectedId)?.display_name ?? selectedId
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
