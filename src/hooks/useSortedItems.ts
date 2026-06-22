import { useMemo } from 'react'
import i18next from 'i18next'
import type { CompactItem, EntryCompact } from '@/api/types'
import { isFolder } from '@/api/types'

export type SortField = 'name' | 'login' | 'url' | 'updated_at' | 'type' | 'importance'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

const IMPORTANCE_ORDER: Record<string, number> = {
  high: 3,
  normal: 2,
  low: 1,
}

function getEntryField(item: CompactItem, field: 'login' | 'url'): string {
  if (isFolder(item)) return ''
  return (item as EntryCompact)[field] ?? ''
}

function compareItems(
  a: CompactItem,
  b: CompactItem,
  config: SortConfig,
  collator: Intl.Collator,
): number {
  const dir = config.direction === 'asc' ? 1 : -1

  switch (config.field) {
    case 'name':
      return dir * collator.compare(a.name, b.name)

    case 'login':
      return dir * collator.compare(getEntryField(a, 'login'), getEntryField(b, 'login'))

    case 'url':
      return dir * collator.compare(getEntryField(a, 'url'), getEntryField(b, 'url'))

    case 'updated_at':
      return dir * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())

    case 'type':
      return dir * collator.compare(a.type, b.type)

    case 'importance': {
      const aImp = IMPORTANCE_ORDER[a.importance ?? 'normal'] ?? 2
      const bImp = IMPORTANCE_ORDER[b.importance ?? 'normal'] ?? 2
      return dir * (aImp - bImp)
    }

    default:
      return 0
  }
}

export function useSortedItems(items: CompactItem[], config: SortConfig): CompactItem[] {
  // Read the active language so the memo recomputes (and the collator is
  // rebuilt) when the UI language changes.
  const language = i18next.language

  return useMemo(() => {
    // Locale-aware, natural ("Server 2" < "Server 10") collation keyed by the
    // active UI language. Built once per sort, not per comparison.
    const collator = new Intl.Collator(language || undefined, {
      numeric: true,
      sensitivity: 'base',
    })

    const folders = items.filter(isFolder)
    const entries = items.filter((item) => !isFolder(item))

    const sortedFolders = [...folders].sort((a, b) => compareItems(a, b, config, collator))
    const sortedEntries = [...entries].sort((a, b) => compareItems(a, b, config, collator))

    // Folders always come first
    return [...sortedFolders, ...sortedEntries]
  }, [items, config, language])
}
