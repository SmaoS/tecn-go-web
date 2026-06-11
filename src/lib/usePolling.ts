import { useEffect, useRef } from 'react'

export function createPollingTask(callback: () => void | Promise<void>, intervalMs: number) {
  let running = false
  const run = async () => {
    if (running) return
    running = true
    try {
      await callback()
    } finally {
      running = false
    }
  }
  const interval = globalThis.setInterval(() => void run(), intervalMs)
  return () => globalThis.clearInterval(interval)
}

export function usePolling(callback: () => void | Promise<void>, intervalMs: number, enabled = true) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return
    return createPollingTask(() => callbackRef.current(), intervalMs)
  }, [enabled, intervalMs])
}
