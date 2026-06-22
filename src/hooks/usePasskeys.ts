import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listPasskeys, renamePasskey, deletePasskey } from '@/api/passkeys'
import { useAuthStore } from '@/stores/authStore'

const PASSKEYS_KEY = ['me', 'passkeys']

export function usePasskeys() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: PASSKEYS_KEY,
    queryFn: listPasskeys,
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

export function useRenamePasskey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renamePasskey(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEYS_KEY })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useDeletePasskey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePasskey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEYS_KEY })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function invalidatePasskeysKey() {
  return PASSKEYS_KEY
}
