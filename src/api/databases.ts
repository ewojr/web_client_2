import { apiClient } from './client'
import { fetchAllPages } from './pagination'
import type { PaginatedResponse, DatabaseCompact } from './types'

export function listDatabases(): Promise<PaginatedResponse<DatabaseCompact>> {
  return fetchAllPages<DatabaseCompact, PaginatedResponse<DatabaseCompact>>(
    (offset, limit) =>
      apiClient<PaginatedResponse<DatabaseCompact>>(
        `/databases?offset=${offset}&limit=${limit}`,
      ),
  )
}

export function getDatabase(id: string): Promise<DatabaseCompact> {
  return apiClient<DatabaseCompact>(`/databases/${id}`)
}
