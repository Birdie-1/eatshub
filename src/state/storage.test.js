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
/** localStorage stub holding what is stored right now (another tab may have written after the event). */
function fakeStorage(entries = {}) {
  vi.stubGlobal('localStorage', { getItem: (key) => entries[key] ?? null, setItem: vi.fn() })
  return entries
}
afterEach(() => vi.unstubAllGlobals())

describe('subscribe (changes made in another tab or window)', () => {
  it('passes the parsed value for its own prefixed key only', () => {
    fakeStorage({ 'eatshub:orders': '[{"id":"A"}]' })
    const { fire } = fakeWindow()
    const callback = vi.fn()
    subscribe('orders', callback)
    fire({ key: 'eatshub:orders', newValue: '[{"id":"A"}]' })
    fire({ key: 'eatshub:session', newValue: '{}' })
    fire({ key: 'orders', newValue: '[]' })
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([{ id: 'A' }])
  })
  it('hands over what is stored now, not an older value an event arrived late with', () => {
    fakeStorage({ 'eatshub:orders': '[{"id":"A"},{"id":"B"}]' })
    const { fire } = fakeWindow()
    const callback = vi.fn()
    subscribe('orders', callback)
    fire({ key: 'eatshub:orders', newValue: '[{"id":"A"}]' })
    expect(callback).toHaveBeenCalledWith([{ id: 'A' }, { id: 'B' }])
  })
  it('ignores removed keys, storage.clear() and corrupt JSON', () => {
    fakeStorage({ 'eatshub:orders': '{oops' })
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
