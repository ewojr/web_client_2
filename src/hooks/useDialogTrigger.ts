import { useRef, useState, useCallback } from 'react'

export interface DialogTrigger {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Pairs an open/close flag with focus restoration. Captures
 * `document.activeElement` synchronously when `open()` is called and, when
 * `close()` is called, focuses that element again on the next frame (so the
 * closing dialog has a chance to unmount).
 *
 * Use this for conditionally-mounted dialogs. Always-mounted Base UI dialogs
 * already restore focus on their own.
 */
export function useDialogTrigger(): DialogTrigger {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback(() => {
    // Capture the trigger NOW, before React re-renders and Base UI moves
    // focus into the dialog.
    triggerRef.current = document.activeElement as HTMLElement | null
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    const trigger = triggerRef.current
    if (trigger?.focus) {
      // Defer until the dialog has unmounted; otherwise Base UI's focus trap
      // would steal the focus right back.
      requestAnimationFrame(() => {
        if (document.body.contains(trigger)) trigger.focus()
      })
    }
    triggerRef.current = null
  }, [])

  return { isOpen, open, close }
}
