import { useTranslation } from 'react-i18next'
import { SearchIcon } from 'lucide-react'
import { EntryList } from '@/components/entries/EntryList'
import { Skeleton } from '@/components/ui/skeleton'
import type { CompactItem } from '@/api/types'

interface SearchResultsProps {
  query: string
  items: CompactItem[]
  isLoading: boolean
  selectedEntryId: string | null
  onFolderClick: (folderId: string) => void
  onEntryClick: (entryId: string) => void
}

export function SearchResults({
  query,
  items,
  isLoading,
  selectedEntryId,
  onFolderClick,
  onEntryClick,
}: SearchResultsProps) {
  const { t } = useTranslation()

  return (
    <div>
      {/* Search header */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <SearchIcon className="h-4 w-4" />
        <span>
          {t('search.resultsFor')} &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;
          {!isLoading && ` — ${t('search.resultCount', { count: items.length })}`}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <SearchIcon className="mb-2 h-10 w-10" />
          <p>{t('search.noResults')}</p>
        </div>
      ) : (
        <EntryList
          items={items}
          selectedEntryId={selectedEntryId}
          onFolderClick={onFolderClick}
          onEntryClick={onEntryClick}
        />
      )}
    </div>
  )
}
