import { useEffect } from 'react'
import { create } from 'zustand'
import type { DatabaseCompact } from '@/api/types'

interface VaultAppBarState {
  vault: {
    databases: DatabaseCompact[]
    currentDatabaseId: string | null
    onDatabaseChange: (dbId: string) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    onMenuClick?: () => void
    showMenuButton?: boolean
  } | null
  setVault: (vault: VaultAppBarState['vault']) => void
}

export const useVaultAppBarStore = create<VaultAppBarState>((set) => ({
  vault: null,
  setVault: (vault) => set({ vault }),
}))

/** Call from VaultPage to register vault controls with the AppBar */
export function useVaultAppBar(props: {
  databases: DatabaseCompact[]
  currentDatabaseId: string | null
  onDatabaseChange: (dbId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onMenuClick?: () => void
}) {
  const setVault = useVaultAppBarStore((s) => s.setVault)

  useEffect(() => {
    setVault({
      ...props,
      showMenuButton: true,
    })
    return () => setVault(null)
  }) // Run on every render to keep callbacks fresh
}
