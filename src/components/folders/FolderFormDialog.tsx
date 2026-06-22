import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { describeApiError } from '@/lib/apiErrors'

interface FolderFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string }) => Promise<void>
  isSubmitting: boolean
  /** Existing folder name for renaming, empty for creating */
  initialName?: string
}

export function FolderFormDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  initialName = '',
}: FolderFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = !!initialName
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    try {
      await onSubmit({ name: name.trim() })
      onClose()
      setName('')
    } catch (err) {
      setError(describeApiError(err, t))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
          setName(initialName)
          setError(null)
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('folderForm.renameTitle') : t('folderForm.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>{t('folderForm.name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={!name.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEditing ? t('common.save') : t('entryForm.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
