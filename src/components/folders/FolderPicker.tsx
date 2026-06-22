import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Folder, FolderOpen, ChevronRight, Home } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useChildren } from '@/hooks/useChildren'
import { isFolder } from '@/api/types'

interface FolderPickerProps {
  open: boolean
  onClose: () => void
  dbId: string
  /** Called with the selected folder ID (null = root) */
  onSelect: (folderId: string | null) => void
  /** Folder IDs to exclude from selection (e.g. the item being moved) */
  excludeIds?: string[]
  title?: string
}

export function FolderPicker({ open, onClose, dbId, onSelect, excludeIds = [], title }: FolderPickerProps) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleConfirm() {
    onSelect(selectedId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title ?? t('folderPicker.title')}</DialogTitle>
        </DialogHeader>

        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {/* Root */}
          <button
            onClick={() => setSelectedId(null)}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
              selectedId === null ? 'bg-accent font-medium' : ''
            }`}
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            {t('folderPicker.root')}
          </button>

          {/* Recursive folder nodes */}
          <FolderPickerNode
            dbId={dbId}
            folderId={null}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
            excludeIds={excludeIds}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            {t('folderPicker.moveHere')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FolderPickerNode({
  dbId,
  folderId,
  depth,
  selectedId,
  onSelect,
  excludeIds,
}: {
  dbId: string
  folderId: string | null
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  excludeIds: string[]
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { data } = useChildren(dbId, folderId)
  const folders = (data?.data ?? []).filter(isFolder).filter((f) => !excludeIds.includes(f.id))

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      {folders.map((folder) => (
        <div key={folder.id}>
          <button
            onClick={() => onSelect(folder.id)}
            className={`flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
              selectedId === folder.id ? 'bg-accent font-medium' : ''
            }`}
            style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
          >
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id) }}
              className="flex h-4 w-4 shrink-0 items-center justify-center"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                  expanded.has(folder.id) ? 'rotate-90' : ''
                }`}
              />
            </span>
            {expanded.has(folder.id) ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-600" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span className="truncate">{folder.name}</span>
          </button>

          {expanded.has(folder.id) && (
            <FolderPickerNode
              dbId={dbId}
              folderId={folder.id}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              excludeIds={excludeIds}
            />
          )}
        </div>
      ))}
    </>
  )
}
