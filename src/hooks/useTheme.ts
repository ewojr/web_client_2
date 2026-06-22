import { useEffect } from 'react'
import { useOptionsStore } from '@/stores/optionsStore'

/**
 * Applies the selected theme by toggling the 'dark' class on <html>.
 * Listens to both the store value and the system preference media query.
 */
export function useTheme() {
  const theme = useOptionsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function apply() {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)

      root.classList.toggle('dark', isDark)
    }

    apply()

    // Re-apply when system preference changes (only matters for 'system' mode)
    mediaQuery.addEventListener('change', apply)
    return () => mediaQuery.removeEventListener('change', apply)
  }, [theme])
}
