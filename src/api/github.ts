import type { GitHubRepo, SearchResponse, TimeWindow } from '../types'

const TOKEN_KEY = 'pulse_github_token'

export function getStoredToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setStoredToken(token: string): void {
  if (token.trim()) {
    localStorage.setItem(TOKEN_KEY, token.trim())
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function windowStart(window: TimeWindow): string {
  switch (window) {
    case 'daily':
      return daysAgo(1)
    case 'weekly':
      return daysAgo(7)
    case 'monthly':
      return daysAgo(30)
  }
}

export function buildTrendingQuery(
  language: string,
  window: TimeWindow,
): string {
  const since = windowStart(window)
  // Recently created repos ranked by stars — a ToS-friendly stand-in for
  // GitHub's undocumented /trending page, via the public Search API.
  const parts = [`created:>${since}`, 'stars:>5']
  if (language && language !== 'all') {
    parts.push(`language:${language}`)
  }
  return parts.join(' ')
}

export class GitHubApiError extends Error {
  status: number
  rateLimitRemaining: number | null
  rateLimitReset: number | null

  constructor(
    message: string,
    status: number,
    rateLimitRemaining: number | null = null,
    rateLimitReset: number | null = null,
  ) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.rateLimitRemaining = rateLimitRemaining
    this.rateLimitReset = rateLimitReset
  }
}

function parseRateHeaders(res: Response): {
  remaining: number | null
  reset: number | null
} {
  const remaining = res.headers.get('X-RateLimit-Remaining')
  const reset = res.headers.get('X-RateLimit-Reset')
  return {
    remaining: remaining != null ? Number(remaining) : null,
    reset: reset != null ? Number(reset) : null,
  }
}

async function githubFetch(
  url: string,
  token?: string,
  signal?: AbortSignal,
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const auth = token?.trim() || getStoredToken()
  if (auth) {
    headers.Authorization = `Bearer ${auth}`
  }
  return fetch(url, { headers, signal })
}

export async function searchTrendingRepos(options: {
  language: string
  window: TimeWindow
  page?: number
  perPage?: number
  token?: string
  signal?: AbortSignal
}): Promise<{ repos: GitHubRepo[]; total: number; rateLimitRemaining: number | null }> {
  const { language, window, page = 1, perPage = 30, token, signal } = options
  const q = buildTrendingQuery(language, window)
  const params = new URLSearchParams({
    q,
    sort: 'stars',
    order: 'desc',
    page: String(page),
    per_page: String(perPage),
  })

  const url = `https://api.github.com/search/repositories?${params}`
  const res = await githubFetch(url, token, signal)
  const { remaining, reset } = parseRateHeaders(res)

  if (!res.ok) {
    let detail = `GitHub API error (${res.status})`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      /* ignore */
    }
    if (res.status === 403 || res.status === 429) {
      detail =
        remaining === 0
          ? 'GitHub rate limit exceeded. Add a personal access token for higher limits.'
          : detail
    }
    throw new GitHubApiError(detail, res.status, remaining, reset)
  }

  const data = (await res.json()) as SearchResponse
  return {
    repos: data.items,
    total: data.total_count,
    rateLimitRemaining: remaining,
  }
}

export async function fetchReposByFullNames(
  fullNames: string[],
  token?: string,
  signal?: AbortSignal,
): Promise<GitHubRepo[]> {
  const results = await Promise.all(
    fullNames.map(async (fullName) => {
      const url = `https://api.github.com/repos/${fullName}`
      const res = await githubFetch(url, token, signal)
      if (!res.ok) return null
      return (await res.json()) as GitHubRepo
    }),
  )
  return results.filter((r): r is GitHubRepo => r != null)
}

export const POPULAR_LANGUAGES = [
  { value: 'all', label: 'All languages' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
  { value: 'C', label: 'C' },
  { value: 'C#', label: 'C#' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Shell', label: 'Shell' },
  { value: 'Dart', label: 'Dart' },
  { value: 'Vue', label: 'Vue' },
  { value: 'HTML', label: 'HTML' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Lua', label: 'Lua' },
  { value: 'Zig', label: 'Zig' },
] as const
