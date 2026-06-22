import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OidcProvider } from '@/api/types'

interface ConnectionState {
  serverAddress: string
  serverPort: string
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  oidcProviders: OidcProvider[]

  setServer: (address: string, port: string) => void
  setConnecting: () => void
  setConnected: (providers: OidcProvider[]) => void
  setConnectionError: (error: string) => void
  disconnect: () => void
}

// Server address/port must survive a page refresh (F5) so that authenticated
// API calls can still reach the configured server. We persist into
// sessionStorage to match the auth token's lifetime (same tab, same session).
// In dev with the Vite proxy this is invisible — relative URLs hit the proxy —
// but in production deployments where the web client is served from a
// different origin than the PD Server, an empty serverAddress sends requests
// to the wrong host.
export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      serverAddress: '',
      serverPort: '8714',
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      oidcProviders: [],

      setServer: (address, port) => set({ serverAddress: address, serverPort: port }),

      setConnecting: () =>
        set({ isConnecting: true, isConnected: false, connectionError: null }),

      setConnected: (providers) =>
        set({
          isConnecting: false,
          isConnected: true,
          connectionError: null,
          oidcProviders: providers,
        }),

      setConnectionError: (error) =>
        set({
          isConnecting: false,
          isConnected: false,
          connectionError: error,
        }),

      disconnect: () =>
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: null,
          oidcProviders: [],
        }),
    }),
    {
      name: 'pd-connection',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        serverAddress: state.serverAddress,
        serverPort: state.serverPort,
      }),
    },
  ),
)
