import { useSyncExternalStore } from 'react'
import { DEFAULT_ADDRESS_ID, addresses, getAddress } from '@/data/addresses'
import { load, save } from './storage'

/**
 * Small persisted values that several screens read (no Provider needed).
 * Each store keeps its value in localStorage and re-renders every subscribed component on change.
 */
function createStore(key, fallback, restore = (saved) => saved) {
  let value = restore(load(key, fallback))
  const listeners = new Set()
  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? next(value) : next
      save(key, value)
      listeners.forEach((l) => l())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const addressStore = createStore('address', DEFAULT_ADDRESS_ID)
const favoritesStore = createStore('favorites', [])

export const DEFAULT_RIDER_STATUS = { online: true, autoAccept: true }
/** Keeps only boolean switch values from storage; anything else falls back to the default. */
export function restoreRiderStatus(saved) {
  const status = { ...DEFAULT_RIDER_STATUS }
  if (saved && typeof saved === 'object')
    for (const key of Object.keys(status)) if (typeof saved[key] === 'boolean') status[key] = saved[key]
  return status
}
const riderStatusStore = createStore('rider-status', DEFAULT_RIDER_STATUS, restoreRiderStatus)

/**
 * True when the rider app is signed in and online, read fresh from storage so a rider app open in another
 * window counts. New orders are then offered to the rider (R3) instead of following the clock.
 * Blocked or corrupt storage counts as off, so the customer demo keeps its timed tracking.
 */
export function isRiderOnDuty() {
  return (
    load('session', null)?.riderSignedIn === true && restoreRiderStatus(load('rider-status', null)).online
  )
}

/**
 * Delivery address picked in the home header (บ้าน / ออฟฟิศ). C8 uses it as the default.
 * => { address: { id, label, detail }, addresses, setAddress(id) }
 */
export function useAddress() {
  const id = useSyncExternalStore(addressStore.subscribe, addressStore.get)
  return { address: getAddress(id), addresses, setAddress: addressStore.set }
}

/** Restaurant ♥. => { favorites: [restaurantId], isFavorite(id), toggleFavorite(id) } */
export function useFavorites() {
  const favorites = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get)
  return {
    favorites,
    isFavorite: (id) => favorites.includes(id),
    toggleFavorite: (id) =>
      favoritesStore.set((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])),
  }
}

/**
 * Rider app switches (R2 home, later R7 settings): online = เปิดรับงาน, autoAccept = รับงานอัตโนมัติ.
 * => { online, autoAccept, setOnline(boolean), setAutoAccept(boolean) }
 */
export function useRiderStatus() {
  const status = useSyncExternalStore(riderStatusStore.subscribe, riderStatusStore.get)
  return {
    ...status,
    setOnline: (online) => riderStatusStore.set((s) => ({ ...s, online })),
    setAutoAccept: (autoAccept) => riderStatusStore.set((s) => ({ ...s, autoAccept })),
  }
}
