export type TimeWindow = 'daily' | 'weekly' | 'monthly'

export type ViewMode = 'trending' | 'watchlist'

export interface GitHubRepo {
  id: number
  full_name: string
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  open_issues_count: number
  license: { spdx_id: string } | null
}

export interface SearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

export interface WatchlistItem {
  id: number
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  owner_avatar: string
  added_at: string
}
