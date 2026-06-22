import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/api/auth'
import type { UpdateProfileRequest, UserProfile } from '@/api/types'
import { useAuthStore } from '@/stores/authStore'

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    // 5 minutes — long enough to avoid chatty refetches, short enough that
    // server-side permission changes propagate without a manual refresh.
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (updated: UserProfile) => {
      queryClient.setQueryData(['profile'], updated)
    },
  })
}
