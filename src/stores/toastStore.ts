import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  title?: string
  message: string
  /** Auto-dismiss after this many ms; 0 disables auto-dismiss */
  duration: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string
  dismiss: (id: string) => void
  clear: () => void
}

const DEFAULT_DURATION = 4000

let counter = 0
function nextId(): string {
  counter += 1
  return `t-${Date.now()}-${counter}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ variant, title, message, duration }) => {
    const id = nextId()
    // Errors stick around longer so users can read them; pass duration
    // explicitly to override.
    const finalDuration = duration ?? (variant === 'error' ? 8000 : DEFAULT_DURATION)
    set((s) => ({ toasts: [...s.toasts, { id, variant, title, message, duration: finalDuration }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))
