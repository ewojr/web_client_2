import { useQuery } from '@tanstack/react-query'
import { getChildren } from '@/api/folders'

export function useChildren(dbId: string | null, folderId?: string | null) {
  return useQuery({
    queryKey: ['children', dbId, folderId ?? null],
    queryFn: () => getChildren(dbId!, folderId),
    enabled: !!dbId,
    // Keep the previous folder's data visible while navigating WITHIN the same
    // database, so the breadcrumb row and list don't flash empty during the
    // fetch. Dropped when the database changes so a different vault's contents
    // are never shown under the new database.
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === dbId ? prev : undefined,
  })
}
