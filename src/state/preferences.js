import { useSyncExternalStore } from 'react'
import { DEFAULT_ADDRESS_ID, addresses, getAddress } from '@/data/addresses'
import { load, save } from './storage'

/**
 * Small persisted values that several screens read (no Provider needed).
 * Each store keeps its value in localStorage and re-renders every subscribed component on change.
 */
function createStore(key, fallback) {
  let value = load(key, fallback)
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
