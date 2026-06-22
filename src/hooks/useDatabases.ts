import { useQuery } from '@tanstack/react-query'
import { listDatabases } from '@/api/databases'

export function useDatabases() {
  return useQuery({
    queryKey: ['databases'],
    queryFn: () => listDatabases(),
  })
}
