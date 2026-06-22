import { useTranslation } from 'react-i18next'
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react'
import type { BreadcrumbSegment } from '@/api/types'

interface BreadcrumbsProps {
  path: BreadcrumbSegment[]
  currentName?: string
  onNavigate: (folderId: string | null, folderName?: string) => void
}

// When the path goes deeper than this, the middle segments collapse into a
// "…" tooltip so the crumb row keeps a usable width on narrow screens.
const VISIBLE_SEGMENT_LIMIT = 3

export function Breadcrumbs({ path, currentName, onNavigate }: BreadcrumbsProps) {
  const { t } = useTranslation()

  // Server returns bottom-up; reverse for top-down display.
  const fullPath = [...path].reverse()
  const overflow =
    fullPath.length > VISIBLE_SEGMENT_LIMIT
      ? fullPath.slice(0, fullPath.length - (VISIBLE_SEGMENT_LIMIT - 1))
      : []
  const visibleSegments =
    fullPath.length > VISIBLE_SEGMENT_LIMIT
      ? [fullPath[0], ...fullPath.slice(-(VISIBLE_SEGMENT_LIMIT - 1))]
      : fullPath
  const overflowSegments = overflow.slice(1) // first segment stays visible

  return (
    <nav className="flex min-w-0 items-center gap-1 text-sm">
      {/* Home / Root */}
      <button
        onClick={() => onNavigate(null)}
        className="flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        {t('vault.home')}
      </button>

      {visibleSegments.map((segment, idx) => {
        const isFirstAfterEllipsis =
          overflowSegments.length > 0 && idx === 1
        return (
          <span key={segment.id} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {/* Render the ellipsis between the first segment and the
                tail. Title attribute lists the hidden segments so the
                user can hover to see what was collapsed. */}
            {isFirstAfterEllipsis && (
              <>
                <span
                  className="flex shrink-0 items-center text-muted-foreground"
                  title={overflowSegments.map((s) => s.name).join(' / ')}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </>
            )}
            <button
              onClick={() => onNavigate(segment.id, segment.name)}
              className="min-w-0 max-w-[12rem] truncate text-muted-foreground transition-colors hover:text-foreground"
              title={segment.name}
            >
              {segment.name}
            </button>
          </span>
        )
      })}

      {/* Current folder name (not clickable) */}
      {currentName && (
        <span className="flex min-w-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span
            className="min-w-0 max-w-[16rem] truncate font-medium text-foreground"
            title={currentName}
          >
            {currentName}
          </span>
        </span>
      )}
    </nav>
  )
}
