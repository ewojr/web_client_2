import { apiClient } from './client'
import { fetchAllPages } from './pagination'
import type { PaginatedResponse, CompactItem } from './types'

export function searchEntries(
  dbId: string,
  query: string,
  folderId?: string | null,
): Promise<PaginatedResponse<CompactItem>> {
  return fetchAllPages<CompactItem, PaginatedResponse<CompactItem>>((offset, limit) => {
    const params = new URLSearchParams({
      q: query,
      offset: String(offset),
      limit: String(limit),
    })
    if (folderId) params.set('folder', folderId)
    return apiClient<PaginatedResponse<CompactItem>>(
      `/databases/${dbId}/search?${params.toString()}`,
    )
  })
}
