import { useEffect, useRef } from 'react'

// Events that count as "the human is here". Mouse moves and keypresses are
// the obvious signals; touchstart covers tablets; mousedown is included so
// click-only navigation registers even if the cursor never moves between
// clicks; wheel/scroll covers reading a long entry by scrolling without moving
// the pointer. Background tab refetches deliberately don't count — auto-lock is
// about *human* idleness.
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'wheel', 'scroll'] as const

// Throttle activity-triggered resets so that a stream of mousemove events
// doesn't reset the timer thousands of times per second.
const RESET_THROTTLE_MS = 1000

/**
 * Calls `onTimeout` after `minutes` of user inactivity. Listens to real
 * input events (not API traffic), so a user reading a long entry without
 * touching the mouse or keyboard will still hit the timeout — which is the
 * point of auto-lock vs. the server-driven session timeout.
 *
 * Pass `minutes <= 0` to disable.
 */
export function useAutoLock(minutes: number, onTimeout: () => void): void {
  // Stash the latest callback in a ref so we don't tear down the effect every
  // time the consumer re-renders with a fresh closure. The ref is written in an
  // effect (not during render) so a discarded concurrent render can't leave a
  // stale callback behind.
  const onTimeoutRef = useRef(onTimeout)
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  })

  useEffect(() => {
    if (!minutes || minutes <= 0) return

    const ms = minutes * 60 * 1000
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastResetAt = 0

    function startTimer() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => onTimeoutRef.current(), ms)
    }

    function onActivity() {
      const now = Date.now()
      if (now - lastResetAt < RESET_THROTTLE_MS) return
      lastResetAt = now
      startTimer()
    }

    startTimer()
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true })
    }

    return () => {
      if (timer) clearTimeout(timer)
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, onActivity)
      }
    }
  }, [minutes])
}
