import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Fingerprint,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Check,
  X,
  Smartphone,
  Usb,
  Wifi,
  Bluetooth,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { usePasskeys, useRenamePasskey, useDeletePasskey, invalidatePasskeysKey } from '@/hooks/usePasskeys'
import { useWebAuthnRegister } from '@/hooks/useWebAuthnRegister'
import { formatRelativeDate } from '@/lib/dates'
import type { PasskeyCompact, PasskeyTransport } from '@/api/types'

function TransportIcon({ transport }: { transport: PasskeyTransport }) {
  const cls = 'h-3 w-3'
  switch (transport) {
    case 'internal':
      return <Smartphone className={cls} />
    case 'usb':
      return <Usb className={cls} />
    case 'nfc':
      return <Wifi className={cls} />
    case 'ble':
      return <Bluetooth className={cls} />
    case 'hybrid':
      return <Smartphone className={cls} />
    default:
      return null
  }
}

export function PasskeyList() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { data: passkeys, isLoading, error } = usePasskeys()
  const renameMut = useRenamePasskey()
  const deleteMut = useDeletePasskey()
  const register = useWebAuthnRegister()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<PasskeyCompact | null>(null)

  async function handleRegister() {
    const result = await register.execute()
    if (result) {
      queryClient.invalidateQueries({ queryKey: invalidatePasskeysKey() })
    }
  }

  function startEdit(passkey: PasskeyCompact) {
    setEditingId(passkey.id)
    setEditName(passkey.name)
  }

  async function commitEdit(id: string) {
    if (!editName.trim()) {
      setEditingId(null)
      return
    }
    await renameMut.mutateAsync({ id, name: editName.trim() })
    setEditingId(null)
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteMut.mutate(pendingDelete.id)
      setPendingDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{t('passkey.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('passkey.description')}</p>
        </div>
        <Button
          size="sm"
          onClick={handleRegister}
          disabled={register.isLoading}
          className="gap-1.5"
        >
          {register.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {t('passkey.add')}
        </Button>
      </div>

      {register.error && (
        <Alert variant="destructive">
          <AlertDescription>{register.error}</AlertDescription>
        </Alert>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : !passkeys || passkeys.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Fingerprint className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t('passkey.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {passkeys.map((pk) => {
            const isEditing = editingId === pk.id
            return (
              <div
                key={pk.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Fingerprint className="h-5 w-5 shrink-0 text-violet-600" />

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(pk.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                        className="h-7 flex-1"
                      />
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => commitEdit(pk.id)}
                        disabled={renameMut.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{pk.name}</span>
                      {pk.transports?.map((tr) => (
                        <span
                          key={tr}
                          className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground"
                          title={tr}
                        >
                          <TransportIcon transport={tr} />
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {pk.last_used_at
                      ? `${t('passkey.lastUsed')}: ${formatRelativeDate(pk.last_used_at, i18n.language)}`
                      : t('passkey.neverUsed')}
                  </p>
                </div>

                {!isEditing && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="icon-xs" variant="ghost" onClick={() => startEdit(pk)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setPendingDelete(pk)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={t('passkey.deleteTitle')}
        description={t('passkey.deleteDesc', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
      />
    </div>
  )
}
