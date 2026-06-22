import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UploadProgressDialogProps {
  open: boolean
  fileName: string
  /** 0..1 */
  progress: number
  onCancel: () => void
}

export function UploadProgressDialog({
  open,
  fileName,
  progress,
  onCancel,
}: UploadProgressDialogProps) {
  const { t } = useTranslation()
  const percent = Math.max(0, Math.min(100, Math.round(progress * 100)))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('upload.title')}</DialogTitle>
          <DialogDescription className="truncate">
            {t('upload.subtitle', { name: fileName })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={t('upload.title')}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-right text-xs tabular-nums text-muted-foreground">
            {percent}%
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>
            {t('upload.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
