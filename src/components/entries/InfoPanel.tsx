import { useTranslation } from 'react-i18next'
import { FolderInput, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getIconUrl } from '@/lib/icons'

interface InfoPanelProps {
  mode: 'folder' | 'search' | 'empty'
  folderName?: string
  folderIcon?: string
  databaseName?: string
  itemCount?: number
  searchQuery?: string
  isRoot?: boolean
  /** Folder actions — only shown in 'folder' mode and when not at the DB root. */
  onEdit?: () => void
  onMove?: () => void
  onDelete?: () => void
}

export function InfoPanel({
  mode,
  folderName,
  folderIcon,
  databaseName,
  itemCount = 0,
  searchQuery,
  isRoot = false,
  onEdit,
  onMove,
  onDelete,
}: InfoPanelProps) {
  const { t } = useTranslation()

  if (mode === 'search') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <h3 className="text-sm font-medium">{t('infoPanel.searchResults')}</h3>
        {searchQuery && (
          <p className="mt-1 text-xs text-muted-foreground">
            &ldquo;{searchQuery}&rdquo;
          </p>
        )}
        <p className="mt-3 text-2xl font-semibold text-foreground">{itemCount}</p>
        <p className="text-xs text-muted-foreground">
          {t('infoPanel.resultCount', { count: itemCount })}
        </p>
      </div>
    )
  }

  if (mode === 'empty') {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        {t('entry.selectEntry')}
      </div>
    )
  }

  // Folder / Database info — same layout as entry detail
  const displayName = folderName || databaseName || t('vault.home')
  const typeName = isRoot ? t('infoPanel.database') : t('infoPanel.folder')
  const iconSrc = isRoot ? getIconUrl('ico4.svg') : getIconUrl(folderIcon || 'ico3.svg')
  const showActions = !isRoot && (onEdit || onMove || onDelete)

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <div className="p-4 lg:flex-1">
        {/* Header — large icon + name + type */}
        <div className="mb-4 flex items-start gap-3">
          <img src={iconSrc} alt="" className="h-10 w-10 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{typeName}</p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Item count */}
        <div className="space-y-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('infoPanel.contents')}
          </div>
          <p className="text-sm">{t('infoPanel.itemCount', { count: itemCount })}</p>
        </div>
      </div>

      {/* Action buttons — same shape as EntryDetail's, pinned to bottom on
          desktop, inline on mobile. Hidden at the database root. */}
      {showActions && (
        <div className="px-4 pb-4 lg:shrink-0 lg:border-t lg:p-4">
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
                {t('common.edit')}
              </Button>
            )}
            {onMove && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onMove}>
                <FolderInput className="h-3.5 w-3.5" />
                {t('common.move')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
