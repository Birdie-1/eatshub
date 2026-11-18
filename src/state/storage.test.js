import { afterEach, describe, expect, it, vi } from 'vitest'
import { subscribe } from './storage'

/** Minimal window that records `storage` listeners so a test can fire events from "another tab". */
function fakeWindow() {
  const listeners = new Set()
  vi.stubGlobal('window', {
    addEventListener: (type, listener) => type === 'storage' && listeners.add(listener),
    removeEventListener: (type, listener) => listeners.delete(listener),
  })
  return { fire: (event) => listeners.forEach((listener) => listener(event)), listeners }
}
afterEach(() => vi.unstubAllGlobals())

describe('subscribe (changes made in another tab or window)', () => {
  it('passes the parsed value for its own prefixed key only', () => {
    const { fire } = fakeWindow()
    const callback = vi.fn()
    subscribe('orders', callback)
    fire({ key: 'eatshub:orders', newValue: '[{"id":"A"}]' })
    fire({ key: 'eatshub:session', newValue: '{}' })
    fire({ key: 'orders', newValue: '[]' })
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([{ id: 'A' }])
  })
  it('ignores removed keys, storage.clear() and corrupt JSON', () => {
    const { fire } = fakeWindow()
    const callback = vi.fn()
    subscribe('orders', callback)
    fire({ key: 'eatshub:orders', newValue: null })
    fire({ key: null, newValue: null })
    fire({ key: 'eatshub:orders', newValue: '{oops' })
    expect(callback).not.toHaveBeenCalled()
  })
  it('stops listening after unsubscribe', () => {
    const { listeners } = fakeWindow()
    const unsubscribe = subscribe('orders', vi.fn())
    expect(listeners.size).toBe(1)
    unsubscribe()
    expect(listeners.size).toBe(0)
  })
})
