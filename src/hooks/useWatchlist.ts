import { useCallback, useSyncExternalStore } from 'react'
import type { GitHubRepo, WatchlistItem } from '../types'

const STORAGE_KEY = 'pulse_watchlist'
const listeners = new Set<() => void>()
const EMPTY: WatchlistItem[] = []

let cachedRaw: string | null = null
let cachedItems: WatchlistItem[] = EMPTY

function emit(): void {
  listeners.forEach((l) => l())
}

function parse(raw: string | null): WatchlistItem[] {
  if (raw == null || raw === '') return EMPTY
  try {
    const parsed = JSON.parse(raw) as WatchlistItem[]
    return Array.isArray(parsed) ? parsed : EMPTY
  } catch {
    return EMPTY
  }
}

function getSnapshot(): WatchlistItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedItems
  cachedRaw = raw
  cachedItems = parse(raw)
  return cachedItems
}

function write(items: WatchlistItem[]): void {
  const raw = items.length === 0 ? null : JSON.stringify(items)
  if (raw == null) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, raw)
  }
  cachedRaw = raw
  cachedItems = items.length === 0 ? EMPTY : items
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cachedRaw = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function toItem(repo: GitHubRepo): WatchlistItem {
  return {
    id: repo.id,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    owner_avatar: repo.owner.avatar_url,
    added_at: new Date().toISOString(),
  }
}

export function useWatchlist() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)

  const isWatched = useCallback(
    (id: number) => items.some((i) => i.id === id),
    [items],
  )

  const add = useCallback((repo: GitHubRepo) => {
    const current = getSnapshot()
    if (current.some((i) => i.id === repo.id)) return
    write([toItem(repo), ...current])
  }, [])

  const remove = useCallback((id: number) => {
    write(getSnapshot().filter((i) => i.id !== id))
  }, [])

  const toggle = useCallback((repo: GitHubRepo) => {
    const current = getSnapshot()
    if (current.some((i) => i.id === repo.id)) {
      write(current.filter((i) => i.id !== repo.id))
    } else {
      write([toItem(repo), ...current])
    }
  }, [])

  const clear = useCallback(() => write([]), [])

  return { items, isWatched, add, remove, toggle, clear }
}
