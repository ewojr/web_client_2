import { useOptionsStore } from '@/stores/optionsStore'

let clearTimerId: ReturnType<typeof setTimeout> | undefined
let focusRetryCleanup: (() => void) | undefined

function cancelFocusRetry(): void {
  focusRetryCleanup?.()
  focusRetryCleanup = undefined
}

/**
 * The Clipboard API rejects writes (and often reads) while the document is not
 * focused — which is exactly the state during the dominant "copy → Alt-Tab →
 * paste" flow when the 30s timer fires. Rather than silently give up (leaving
 * the password on the OS clipboard), retry the clear the moment the tab regains
 * focus. Cancelled if the user copies something new in the meantime.
 */
function scheduleClearOnFocus(expected: string | null): void {
  cancelFocusRetry()
  const onFocus = () => {
    cancelFocusRetry()
    void clearIfStillOurs(expected)
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') onFocus()
  }
  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onVisible)
  focusRetryCleanup = () => {
    window.removeEventListener('focus', onFocus)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

/**
 * Clears the clipboard, but only if it still contains the value we wrote.
 * `expected === null` forces an unconditional clear (used on logout). On a
 * write/read failure (unfocused tab) the clear is retried when focus returns.
 */
async function clearIfStillOurs(expected: string | null): Promise<void> {
  try {
    if (expected !== null && navigator.clipboard?.readText) {
      let current: string
      try {
        current = await navigator.clipboard.readText()
      } catch {
        // Can't read right now (unfocused / permission) — retry on focus
        // instead of blindly overwriting whatever is there.
        scheduleClearOnFocus(expected)
        return
      }
      if (current !== expected) {
        // The user copied something else since — leave their clipboard alone.
        return
      }
    }
    await navigator.clipboard.writeText('')
  } catch {
    // writeText rejected (document not focused) — retry once focus returns.
    scheduleClearOnFocus(expected)
  }
}

export async function copyToClipboard(text: string, autoClearMs?: number): Promise<void> {
  // Cancel any pending clear BEFORE the await, so an in-flight clear timer from
  // a previous copy can't fire during this write and wipe the value we're
  // about to put on the clipboard.
  clearTimeout(clearTimerId)
  clearTimerId = undefined
  cancelFocusRetry()

  await navigator.clipboard.writeText(text)

  const clearAfter = autoClearMs ?? useOptionsStore.getState().clipboardAutoClearSeconds * 1000
  if (clearAfter > 0) {
    clearTimerId = setTimeout(() => {
      void clearIfStillOurs(text)
    }, clearAfter)
  }
}

/** Clear the clipboard immediately (unconditionally) and cancel pending clears. */
export function clearClipboard(): void {
  clearTimeout(clearTimerId)
  clearTimerId = undefined
  cancelFocusRetry()
  void clearIfStillOurs(null)
}
