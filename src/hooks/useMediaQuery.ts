import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a CSS media query. Built on useSyncExternalStore so there is no
 * setState-in-effect: the initial value, query changes, and live updates are
 * all handled by the store contract.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  // Media queries don't apply during SSR; default to false on the server.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
