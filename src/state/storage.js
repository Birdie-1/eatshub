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
