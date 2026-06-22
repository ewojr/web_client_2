import { useQuery } from '@tanstack/react-query'
import { searchEntries } from '@/api/search'
import { useDebounce } from '@/lib/debounce'

export function useSearch(
  dbId: string | null,
  query: string,
  folderId?: string | null,
) {
  const debouncedQuery = useDebounce(query.trim(), 300)

  return useQuery({
    queryKey: ['search', dbId, debouncedQuery, folderId ?? null],
    queryFn: () => searchEntries(dbId!, debouncedQuery, folderId),
    enabled: !!dbId && debouncedQuery.length >= 3,
    // Keep previous results visible while the next query loads, but only within
    // the same database — otherwise switching databases briefly shows the old
    // vault's results under the new database's banner.
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === dbId ? prev : undefined,
  })
}
