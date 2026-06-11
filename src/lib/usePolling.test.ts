import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPollingTask } from './usePolling'

describe('createPollingTask', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs at the configured interval and stops cleanly', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const stop = createPollingTask(callback, 10_000)

    await vi.advanceTimersByTimeAsync(30_000)
    expect(callback).toHaveBeenCalledTimes(3)

    stop()
    await vi.advanceTimersByTimeAsync(20_000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not overlap executions', async () => {
    vi.useFakeTimers()
    let finish: (() => void) | undefined
    const callback = vi.fn(() => new Promise<void>((resolve) => {
      finish = resolve
    }))
    const stop = createPollingTask(callback, 10_000)

    await vi.advanceTimersByTimeAsync(30_000)
    expect(callback).toHaveBeenCalledTimes(1)

    finish?.()
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(callback).toHaveBeenCalledTimes(2)
    stop()
  })
})
