import { useQuery } from '@tanstack/react-query'
import { getEntry } from '@/api/entries'

export function useEntry(
  dbId: string | null,
  entryId: string | null,
  secondPassword?: string,
) {
  return useQuery({
    // Key by unlock *state*, never the plaintext second password — the key is
    // visible in React Query Devtools and lives in the cache. Invalidation is
    // by the ['entry', dbId, entryId] prefix, and EntryDetail removes the
    // errored query when a cached password is rejected, so a fresh password
    // still triggers a refetch.
    queryKey: ['entry', dbId, entryId, secondPassword ? 'unlocked' : 'locked'],
    queryFn: () => getEntry(dbId!, entryId!, secondPassword),
    enabled: !!dbId && !!entryId,
  })
}
