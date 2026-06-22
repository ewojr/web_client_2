import { create } from 'zustand'

interface SecondPasswordState {
  passwords: Map<string, string>
  getSecondPassword: (id: string) => string | undefined
  setSecondPassword: (id: string, password: string) => void
  clearSecondPassword: (id: string) => void
  clearAll: () => void
}

export const useSecondPasswordStore = create<SecondPasswordState>((set, get) => ({
  passwords: new Map(),

  getSecondPassword: (id) => get().passwords.get(id),

  setSecondPassword: (id, password) =>
    set((state) => {
      const next = new Map(state.passwords)
      next.set(id, password)
      return { passwords: next }
    }),

  clearSecondPassword: (id) =>
    set((state) => {
      const next = new Map(state.passwords)
      next.delete(id)
      return { passwords: next }
    }),

  clearAll: () => set({ passwords: new Map() }),
}))
