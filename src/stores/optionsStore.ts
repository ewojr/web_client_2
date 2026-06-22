import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'
import type { AuthMethod } from '@/api/types'
import type { SortConfig, SortField } from '@/hooks/useSortedItems'

export type Theme = 'system' | 'light' | 'dark'

interface OptionsState {
  // Connection (user preferences, not build config)
  recentServers: string[]
  defaultServer: string
  defaultPort: string

  // Language (null = not explicitly chosen, browser detection applies)
  language: string | null

  // Security
  clipboardAutoClearSeconds: number
  autoLockMinutes: number

  // Display
  theme: Theme
  entryListSort: SortConfig

  // Authentication
  lastAuthMethod: AuthMethod
  lastOidcProvider: string | null
  defaultAuthMethod: AuthMethod

  // Actions
  addRecentServer: (server: string) => void
  setDefaultServer: (server: string) => void
  setDefaultPort: (port: string) => void
  setLanguage: (lang: string) => void
  setClipboardAutoClearSeconds: (seconds: number) => void
  setAutoLockMinutes: (minutes: number) => void
  setTheme: (theme: Theme) => void
  setEntryListSort: (sort: SortConfig) => void
  setLastAuthMethod: (method: AuthMethod) => void
  setLastOidcProvider: (id: string | null) => void
  setDefaultAuthMethod: (method: AuthMethod) => void
}

const MAX_RECENT_SERVERS = 5

const THEMES: readonly Theme[] = ['system', 'light', 'dark']
const SORT_FIELDS: readonly SortField[] = [
  'name',
  'login',
  'url',
  'updated_at',
  'type',
  'importance',
]
const SORT_DIRECTIONS: readonly SortConfig['direction'][] = ['asc', 'desc']

const CLIPBOARD_CLEAR_MIN = 10
const CLIPBOARD_CLEAR_MAX = 120
const AUTO_LOCK_MIN = 1
const AUTO_LOCK_MAX = 10

const DEFAULT_CLIPBOARD_CLEAR = 30
const DEFAULT_AUTO_LOCK = 5
const DEFAULT_SORT: SortConfig = { field: 'name', direction: 'asc' }

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

/** Validates and clamps persisted state against its allowed domain. */
function sanitizePersisted(state: Partial<OptionsState>): Partial<OptionsState> {
  const sanitized: Partial<OptionsState> = { ...state }

  if (!THEMES.includes(state.theme as Theme)) {
    sanitized.theme = 'system'
  }

  sanitized.clipboardAutoClearSeconds = clamp(
    state.clipboardAutoClearSeconds as number,
    CLIPBOARD_CLEAR_MIN,
    CLIPBOARD_CLEAR_MAX,
    DEFAULT_CLIPBOARD_CLEAR,
  )

  sanitized.autoLockMinutes = clamp(
    state.autoLockMinutes as number,
    AUTO_LOCK_MIN,
    AUTO_LOCK_MAX,
    DEFAULT_AUTO_LOCK,
  )

  const sort = state.entryListSort
  if (
    !sort ||
    !SORT_FIELDS.includes(sort.field) ||
    !SORT_DIRECTIONS.includes(sort.direction)
  ) {
    sanitized.entryListSort = DEFAULT_SORT
  }

  return sanitized
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      recentServers: [],
      defaultServer: '',
      defaultPort: '8714',
      language: null,
      clipboardAutoClearSeconds: DEFAULT_CLIPBOARD_CLEAR,
      autoLockMinutes: DEFAULT_AUTO_LOCK,
      theme: 'system',
      entryListSort: DEFAULT_SORT,
      lastAuthMethod: 'standard',
      lastOidcProvider: null,
      defaultAuthMethod: 'standard',

      addRecentServer: (server) =>
        set((state) => {
          const filtered = state.recentServers.filter((s) => s !== server)
          return {
            recentServers: [server, ...filtered].slice(0, MAX_RECENT_SERVERS),
          }
        }),

      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        set({ language: lang })
      },

      setDefaultServer: (server) => set({ defaultServer: server }),
      setDefaultPort: (port) => set({ defaultPort: port }),
      setClipboardAutoClearSeconds: (seconds) => set({ clipboardAutoClearSeconds: seconds }),
      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
      setTheme: (theme) => set({ theme }),
      setEntryListSort: (sort) => set({ entryListSort: sort }),
      setLastAuthMethod: (method) => set({ lastAuthMethod: method }),
      setLastOidcProvider: (id) => set({ lastOidcProvider: id }),
      setDefaultAuthMethod: (method) => set({ defaultAuthMethod: method }),
    }),
    {
      name: 'pd-options',
      version: 1,
      migrate: (persisted) =>
        sanitizePersisted((persisted ?? {}) as Partial<OptionsState>) as OptionsState,
      merge: (persisted, current) => {
        const sanitized = sanitizePersisted((persisted ?? {}) as Partial<OptionsState>)
        return { ...current, ...sanitized }
      },
    },
  ),
)
