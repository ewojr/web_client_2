import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDialogTrigger } from './useDialogTrigger'

describe('useDialogTrigger', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts closed', () => {
    const { result } = renderHook(() => useDialogTrigger())
    expect(result.current.isOpen).toBe(false)
  })

  it('open() flips isOpen to true and captures the active element', () => {
    const button = document.createElement('button')
    button.textContent = 'Trigger'
    document.body.appendChild(button)
    button.focus()
    expect(document.activeElement).toBe(button)

    const { result } = renderHook(() => useDialogTrigger())
    act(() => result.current.open())

    expect(result.current.isOpen).toBe(true)
  })

  it('close() restores focus to the captured trigger on the next frame', async () => {
    vi.useFakeTimers()
    // Polyfill rAF to advance via timers in jsdom.
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        return setTimeout(() => cb(performance.now()), 0) as unknown as number
      })

    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()

    const { result } = renderHook(() => useDialogTrigger())
    act(() => result.current.open())

    // Simulate Base UI moving focus into the dialog.
    const dialogChild = document.createElement('input')
    document.body.appendChild(dialogChild)
    dialogChild.focus()
    expect(document.activeElement).toBe(dialogChild)

    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)

    // Run the queued requestAnimationFrame callback.
    await act(async () => {
      vi.runAllTimers()
    })

    expect(document.activeElement).toBe(button)
    rafSpy.mockRestore()
  })

  it('does not throw if the trigger element is no longer in the DOM', () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number
    })

    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()

    const { result } = renderHook(() => useDialogTrigger())
    act(() => result.current.open())

    // Trigger removed (e.g. parent component unmounted) before close.
    button.remove()

    expect(() => {
      act(() => result.current.close())
      vi.runAllTimers()
    }).not.toThrow()
  })
})
