/**
 * localStorage helpers. Every access is wrapped in try/catch: private windows,
 * blocked storage or corrupt JSON fall back to `fallback` instead of crashing.
 */
const PREFIX = 'eatshub:'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage unavailable — state still works for this session
  }
}

/**
 * Calls `callback(value)` when another tab or window saves `key` (the browser `storage` event never fires
 * in the tab that wrote it). Removed keys and corrupt JSON are ignored. Returns an unsubscribe function.
 */
export function subscribe(key, callback) {
  const onStorage = (event) => {
    if (event.key !== PREFIX + key || event.newValue == null) return
    let value
    try {
      value = JSON.parse(event.newValue)
    } catch {
      return
    }
    callback(value)
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
