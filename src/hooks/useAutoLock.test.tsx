import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoLock } from './useAutoLock'

function fireInput(type: 'mousedown' | 'keydown' | 'mousemove' | 'touchstart') {
  // jsdom dispatches the event on `window` since that's where useAutoLock listens.
  window.dispatchEvent(new Event(type))
}

describe('useAutoLock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires onTimeout after the configured minutes of inactivity', () => {
    const onTimeout = vi.fn()
    renderHook(() => useAutoLock(2, onTimeout)) // 2 minutes
    expect(onTimeout).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000 - 1)
    })
    expect(onTimeout).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('does nothing when minutes <= 0 (feature disabled)', () => {
    const onTimeout = vi.fn()
    renderHook(() => useAutoLock(0, onTimeout))
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000) // an hour
    })
    expect(onTimeout).not.toHaveBeenCalled()
  })

  it('resets the timer on user input', () => {
    const onTimeout = vi.fn()
    renderHook(() => useAutoLock(1, onTimeout))

    // 50 seconds of nothing.
    act(() => {
      vi.advanceTimersByTime(50_000)
    })
    expect(onTimeout).not.toHaveBeenCalled()

    // User taps a key — should reset the 1-minute clock.
    act(() => {
      fireInput('keydown')
    })

    // 50 more seconds — would have fired without the reset, must not have.
    act(() => {
      vi.advanceTimersByTime(50_000)
    })
    expect(onTimeout).not.toHaveBeenCalled()

    // 11 more seconds — total 61s since last input — should fire now.
    act(() => {
      vi.advanceTimersByTime(11_000)
    })
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it.each(['mousedown', 'keydown', 'mousemove', 'touchstart'] as const)(
    'treats %s as user activity',
    (type) => {
      const onTimeout = vi.fn()
      renderHook(() => useAutoLock(1, onTimeout))

      act(() => {
        vi.advanceTimersByTime(50_000)
        fireInput(type)
        vi.advanceTimersByTime(50_000)
      })
      expect(onTimeout).not.toHaveBeenCalled()
    },
  )

  it('throttles input-triggered resets so a flood of events does not starve the timer', () => {
    const onTimeout = vi.fn()
    renderHook(() => useAutoLock(1, onTimeout))

    // Fire mousemove storm — the throttle window means only the first
    // event in a 1-second slice resets the timer.
    act(() => {
      for (let i = 0; i < 1000; i++) fireInput('mousemove')
      vi.advanceTimersByTime(60_000) // 60s after the burst
    })
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('cleans up the listener and timer on unmount', () => {
    const onTimeout = vi.fn()
    const { unmount } = renderHook(() => useAutoLock(1, onTimeout))
    unmount()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(onTimeout).not.toHaveBeenCalled()
  })

  it('uses the latest onTimeout callback across re-renders without restarting the timer', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ cb }: { cb: () => void }) => useAutoLock(1, cb), {
      initialProps: { cb: first },
    })

    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    rerender({ cb: second })
    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    // Originally-scheduled timeout fires at 60s, but should now invoke the
    // latest callback (second), not the stale one (first).
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
