import { useState } from 'react'
import { Filters } from './components/Filters'
import { RepoCard } from './components/RepoCard'
import { TokenModal } from './components/TokenModal'
import { useTrending } from './hooks/useTrending'
import { useWatchlist } from './hooks/useWatchlist'
import type { TimeWindow, ViewMode } from './types'
import './App.css'

export default function App() {
  const [view, setView] = useState<ViewMode>('trending')
  const [language, setLanguage] = useState('all')
  const [window, setWindow] = useState<TimeWindow>('weekly')
  const [tokenOpen, setTokenOpen] = useState(false)

  const watchlist = useWatchlist()
  const trending = useTrending(language, window, view === 'trending')

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />
      <div className="app__grid" aria-hidden="true" />

      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 18c2-6 4.5-9 8-9s6 3 8 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="20" r="2.5" fill="currentColor" />
            </svg>
          </span>
          <div>
            <h1 className="topbar__title">Pulse</h1>
            <p className="topbar__tag">GitHub open-source radar</p>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          <button
            type="button"
            className={`nav-tab${view === 'trending' ? ' nav-tab--active' : ''}`}
            onClick={() => setView('trending')}
            aria-current={view === 'trending' ? 'page' : undefined}
          >
            Trending
          </button>
          <button
            type="button"
            className={`nav-tab${view === 'watchlist' ? ' nav-tab--active' : ''}`}
            onClick={() => setView('watchlist')}
            aria-current={view === 'watchlist' ? 'page' : undefined}
          >
            Watchlist
            {watchlist.items.length > 0 && (
              <span className="nav-tab__count">{watchlist.items.length}</span>
            )}
          </button>
        </nav>

        <button
          type="button"
          className="btn btn--ghost topbar__token"
          onClick={() => setTokenOpen(true)}
        >
          API token
        </button>
      </header>

      <main className="main">
        {view === 'trending' ? (
          <>
            <section className="hero">
              <h2 className="hero__title">What&apos;s hot on GitHub</h2>
              <p className="hero__lead">
                Browse newly popular open-source projects by language and time
                window, then pin the ones worth following.
              </p>
              <Filters
                language={language}
                window={window}
                onLanguageChange={setLanguage}
                onWindowChange={setWindow}
              />
            </section>

            <section className="results" aria-live="polite">
              <div className="results__bar">
                <p className="results__summary">
                  {trending.loading
                    ? 'Loading…'
                    : trending.error
                      ? 'Could not load results'
                      : `${trending.repos.length} of ${trending.total.toLocaleString()} repos`}
                </p>
                {trending.rateLimitRemaining != null && (
                  <p className="results__rate">
                    API remaining: {trending.rateLimitRemaining}
                  </p>
                )}
              </div>

              {trending.loading && (
                <div className="skeleton-list" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              )}

              {!trending.loading && trending.error && (
                <div className="empty-state empty-state--error">
                  <p>{trending.error}</p>
                  <div className="empty-state__actions">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={trending.reload}
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setTokenOpen(true)}
                    >
                      Add token
                    </button>
                  </div>
                </div>
              )}

              {!trending.loading && !trending.error && trending.repos.length === 0 && (
                <div className="empty-state">
                  <p>No repositories matched these filters. Try another language or window.</p>
                </div>
              )}

              {!trending.loading && !trending.error && trending.repos.length > 0 && (
                <ul className="repo-list">
                  {trending.repos.map((repo, i) => (
                    <li key={repo.id}>
                      <RepoCard
                        repo={repo}
                        index={i}
                        watched={watchlist.isWatched(repo.id)}
                        onToggleWatch={() => watchlist.toggle(repo)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <section className="watchlist-view">
            <div className="hero">
              <h2 className="hero__title">Your watchlist</h2>
              <p className="hero__lead">
                Repos you&apos;re tracking stay in this browser. Add more from
                Trending.
              </p>
              {watchlist.items.length > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={watchlist.clear}
                >
                  Clear all
                </button>
              )}
            </div>

            {watchlist.items.length === 0 ? (
              <div className="empty-state">
                <p>Nothing watched yet. Browse trending and tap Watch on a repo.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setView('trending')}
                >
                  Browse trending
                </button>
              </div>
            ) : (
              <ul className="repo-list">
                {watchlist.items.map((item, i) => (
                  <li key={item.id}>
                    <RepoCard
                      repo={item}
                      index={i}
                      watched
                      onToggleWatch={() => watchlist.remove(item.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Data from the{' '}
          <a
            href="https://docs.github.com/en/rest/search/search#search-repositories"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Search API
          </a>
          . Trending ≈ repos created in the selected window, sorted by stars.
        </p>
      </footer>

      <TokenModal
        open={tokenOpen}
        onClose={() => setTokenOpen(false)}
        onSaved={() => {
          if (view === 'trending') trending.reload()
        }}
      />
    </div>
  )
}
