import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { downloadDocument } from '@/api/entries'
import { useNavigationStore } from '@/stores/navigationStore'
import { useToast } from '@/hooks/useToast'
import { describeApiError } from '@/lib/apiErrors'
import type { EntryDetail } from '@/api/types'

export function DocumentDetail({ entry }: { entry: EntryDetail }) {
  const { t } = useTranslation()
  const dbId = useNavigationStore((s) => s.currentDatabaseId)
  const toast = useToast()
  const [downloading, setDownloading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const doc = entry.document
  if (!doc) return null

  const sizeKb = doc.size ? Math.round(doc.size / 1024) : 0
  const sizeMb = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) : null

  async function performDownload() {
    if (!dbId || downloading) return
    setDownloading(true)
    setShowWarning(false)
    try {
      const { blob, filename: serverFilename } = await downloadDocument(dbId, entry.id)
      // Prefer the document's original name, fall back to server Content-Disposition
      const filename = doc?.name || serverFilename || entry.name || 'document'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(describeApiError(err, t), {
        title: t('toast.downloadFailed'),
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {doc.name && (
        <div className="space-y-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('entry.fileName')}
          </div>
          <div className="text-sm">{doc.name}</div>
        </div>
      )}
      {doc.type && (
        <div className="space-y-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('entry.fileType')}
          </div>
          <div className="text-sm">{doc.type}</div>
        </div>
      )}
      {doc.size !== undefined && doc.size > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('entry.fileSize')}
          </div>
          <div className="text-sm">{sizeMb ? `${sizeMb} MB` : `${sizeKb} KB`}</div>
        </div>
      )}
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setShowWarning(true)}
        disabled={downloading}
      >
        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {t('entry.download')}
      </Button>

      {/* Security warning before download */}
      <ConfirmDialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={performDownload}
        title={t('document.downloadWarningTitle')}
        description={t('document.downloadWarningDesc')}
        icon={<ShieldAlert className="h-5 w-5 text-amber-500" />}
        confirmLabel={t('document.downloadConfirm')}
      />
    </div>
  )
}
