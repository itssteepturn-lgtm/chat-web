import { useEffect, useRef, useState } from 'react'
import { GitHubApiError, searchTrendingRepos } from '../api/github'
import type { GitHubRepo, TimeWindow } from '../types'

interface State {
  repos: GitHubRepo[]
  total: number
  loading: boolean
  error: string | null
  rateLimitRemaining: number | null
}

export function useTrending(language: string, window: TimeWindow, enabled: boolean) {
  const [state, setState] = useState<State>({
    repos: [],
    total: 0,
    loading: false,
    error: null,
    rateLimitRemaining: null,
  })
  const [reloadKey, setReloadKey] = useState(0)
  const reqId = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const id = ++reqId.current
    const controller = new AbortController()

    setState((s) => ({ ...s, loading: true, error: null }))

    searchTrendingRepos({
      language,
      window,
      signal: controller.signal,
    })
      .then((result) => {
        if (id !== reqId.current) return
        setState({
          repos: result.repos,
          total: result.total,
          loading: false,
          error: null,
          rateLimitRemaining: result.rateLimitRemaining,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || id !== reqId.current) return
        const message =
          err instanceof GitHubApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load trending repositories'
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }))
      })

    return () => {
      controller.abort()
    }
  }, [language, window, enabled, reloadKey])

  const reload = () => setReloadKey((k) => k + 1)

  return { ...state, reload }
}
