import { useMemo } from 'react'
import { useToastStore, type ToastVariant } from '@/stores/toastStore'

interface ToastOptions {
  title?: string
  /** Auto-dismiss after this many ms; pass 0 to make sticky */
  duration?: number
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  dismiss: (id: string) => void
  clear: () => void
}

/**
 * Imperative toast API. Usage:
 *   const toast = useToast()
 *   toast.success(t('toast.entryCreated'))
 *   toast.error(t('toast.deleteFailed'))
 */
export function useToast(): ToastApi {
  const push = useToastStore((s) => s.push)
  const dismiss = useToastStore((s) => s.dismiss)
  const clear = useToastStore((s) => s.clear)

  return useMemo(
    () => ({
      success: (message, options) => makePush(push, 'success', message, options),
      error: (message, options) => makePush(push, 'error', message, options),
      info: (message, options) => makePush(push, 'info', message, options),
      warning: (message, options) => makePush(push, 'warning', message, options),
      dismiss,
      clear,
    }),
    [push, dismiss, clear],
  )
}

function makePush(
  push: ReturnType<typeof useToastStore.getState>['push'],
  variant: ToastVariant,
  message: string,
  options?: ToastOptions,
): string {
  return push({ variant, message, title: options?.title, duration: options?.duration })
}
