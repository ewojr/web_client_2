import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.getState().clear()
  })

  describe('push', () => {
    it('appends a toast and returns its id', () => {
      const id = useToastStore.getState().push({ variant: 'success', message: 'hi' })
      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0]).toMatchObject({ id, variant: 'success', message: 'hi' })
    })

    it('preserves push order across multiple toasts', () => {
      useToastStore.getState().push({ variant: 'info', message: 'first' })
      useToastStore.getState().push({ variant: 'info', message: 'second' })
      useToastStore.getState().push({ variant: 'info', message: 'third' })
      expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
        'first',
        'second',
        'third',
      ])
    })

    it('generates unique ids', () => {
      const a = useToastStore.getState().push({ variant: 'info', message: 'a' })
      const b = useToastStore.getState().push({ variant: 'info', message: 'b' })
      const c = useToastStore.getState().push({ variant: 'info', message: 'c' })
      expect(new Set([a, b, c]).size).toBe(3)
    })
  })

  describe('default duration', () => {
    it('errors get a longer auto-dismiss than other variants', () => {
      const errId = useToastStore.getState().push({ variant: 'error', message: 'e' })
      const okId = useToastStore.getState().push({ variant: 'success', message: 's' })
      const toasts = useToastStore.getState().toasts
      const err = toasts.find((t) => t.id === errId)!
      const ok = toasts.find((t) => t.id === okId)!
      expect(err.duration).toBeGreaterThan(ok.duration)
    })

    it('honors an explicit duration override', () => {
      const id = useToastStore.getState().push({ variant: 'error', message: 'e', duration: 100 })
      const toast = useToastStore.getState().toasts.find((t) => t.id === id)!
      expect(toast.duration).toBe(100)
    })

    it('allows duration: 0 (sticky) to override the default', () => {
      const id = useToastStore.getState().push({ variant: 'info', message: 'i', duration: 0 })
      const toast = useToastStore.getState().toasts.find((t) => t.id === id)!
      expect(toast.duration).toBe(0)
    })
  })

  describe('dismiss', () => {
    it('removes the toast with the given id', () => {
      const a = useToastStore.getState().push({ variant: 'info', message: 'a' })
      const b = useToastStore.getState().push({ variant: 'info', message: 'b' })
      useToastStore.getState().dismiss(a)
      const remaining = useToastStore.getState().toasts
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(b)
    })

    it('is a no-op for unknown ids', () => {
      useToastStore.getState().push({ variant: 'info', message: 'a' })
      useToastStore.getState().dismiss('does-not-exist')
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('removes all toasts', () => {
      useToastStore.getState().push({ variant: 'info', message: 'a' })
      useToastStore.getState().push({ variant: 'info', message: 'b' })
      useToastStore.getState().clear()
      expect(useToastStore.getState().toasts).toEqual([])
    })
  })
})
