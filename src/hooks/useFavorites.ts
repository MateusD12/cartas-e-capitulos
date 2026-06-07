'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cartas-e-capitulos-favorites'

function storageKey(userId?: string) {
  return userId ? `${STORAGE_KEY}_${userId}` : `${STORAGE_KEY}_guest`
}

function parseFavorites(value: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(storageKey(userId))
    setFavorites(parseFavorites(raw))
  }, [userId])

  const persistFavorites = useCallback(
    (nextFavorites: string[]) => {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(storageKey(userId), JSON.stringify(nextFavorites))
      setFavorites(nextFavorites)
    },
    [userId]
  )

  const addFavorite = useCallback(
    (productId: string) => {
      if (favorites.includes(productId)) return
      const nextFavorites = [...favorites, productId]
      persistFavorites(nextFavorites)
    },
    [favorites, persistFavorites]
  )

  const removeFavorite = useCallback(
    (productId: string) => {
      const nextFavorites = favorites.filter((id) => id !== productId)
      persistFavorites(nextFavorites)
    },
    [favorites, persistFavorites]
  )

  const toggleFavorite = useCallback(
    (productId: string) => {
      const nextFavorites = favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId]
      persistFavorites(nextFavorites)
    },
    [favorites, persistFavorites]
  )

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  )

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }
}
