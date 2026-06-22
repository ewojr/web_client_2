import { useEffect } from 'react'
import { useAuthStore, authChannel } from '@/stores/authStore'

/**
 * Listens for `logout` messages broadcast by other tabs and tears down the
 * local session in response. Guards against echo loops by short-circuiting
 * when the local store is already unauthenticated.
 */
export function useCrossTabLogout(): void {
  useEffect(() => {
    const channel = authChannel
    if (!channel) return
    function handle(event: MessageEvent) {
      if (event.data?.type !== 'logout') return
      // logout() also broadcasts, but BroadcastChannel doesn't deliver to the
      // posting tab. The guard prevents an unrelated echo (e.g. three tabs)
      // from looping indefinitely.
      if (!useAuthStore.getState().isAuthenticated) return
      // Received a sign-out from another tab: tear down this tab's session and
      // revoke its own (independent) token, but don't re-broadcast or we'd echo.
      useAuthStore.getState().logout({ broadcast: false, revoke: true })
    }
    channel.addEventListener('message', handle)
    return () => channel.removeEventListener('message', handle)
  }, [])
}
