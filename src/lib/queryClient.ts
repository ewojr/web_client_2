import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aligned with the 10-minute server-side session timeout: a 5-minute
      // freshness window keeps background refetches infrequent while still
      // providing implicit keepalive on tab focus, so the user is unlikely
      // to be auto-logged-out mid-interaction.
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Client errors (4xx) are deterministic — retrying just delays the
        // error UI, and for 429 (rate-limit / IP lockout, which the PD Server
        // returns with a Retry-After header) an immediate retry is actively
        // counterproductive. Only retry network failures and 5xx. 408
        // (Request Timeout) is the one transient 4xx worth retrying.
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500 && error.status !== 408) {
            return false
          }
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: true, // implicit session keepalive
    },
  },
})
