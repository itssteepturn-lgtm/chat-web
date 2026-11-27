import type { GitHubRepo, WatchlistItem } from '../types'
import { formatCount, formatRelativeDate } from '../utils/format'

type RepoLike = GitHubRepo | (WatchlistItem & { owner?: { avatar_url: string; login: string } })

interface Props {
  repo: RepoLike
  watched: boolean
  onToggleWatch: () => void
  index?: number
}

function avatarUrl(repo: RepoLike): string {
  if ('owner' in repo && repo.owner?.avatar_url) return repo.owner.avatar_url
  if ('owner_avatar' in repo) return repo.owner_avatar
  return ''
}

function ownerLogin(repo: RepoLike): string {
  if ('owner' in repo && repo.owner?.login) return repo.owner.login
  return repo.full_name.split('/')[0] ?? ''
}

export function RepoCard({ repo, watched, onToggleWatch, index = 0 }: Props) {
  const avatar = avatarUrl(repo)
  const owner = ownerLogin(repo)
  const created =
    'created_at' in repo && typeof repo.created_at === 'string'
      ? repo.created_at
      : 'added_at' in repo
        ? repo.added_at
        : null

  return (
    <article
      className="repo-card"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="repo-card__rank" aria-hidden="true">
        {index + 1}
      </div>

      <div className="repo-card__body">
        <div className="repo-card__header">
          {avatar ? (
            <img
              className="repo-card__avatar"
              src={avatar}
              alt=""
              width={36}
              height={36}
              loading="lazy"
            />
          ) : (
            <div className="repo-card__avatar repo-card__avatar--placeholder" />
          )}
          <div className="repo-card__titles">
            <a
              className="repo-card__name"
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="repo-card__owner">{owner}</span>
              <span className="repo-card__slash">/</span>
              <span className="repo-card__repo">{repo.full_name.split('/')[1]}</span>
            </a>
            {repo.language && (
              <span className="repo-card__lang">
                <span className="repo-card__lang-dot" />
                {repo.language}
              </span>
            )}
          </div>
        </div>

        <p className="repo-card__desc">
          {repo.description?.trim() || 'No description provided.'}
        </p>

        <div className="repo-card__meta">
          <span className="repo-card__stat" title="Stars">
            <StarIcon />
            {formatCount(repo.stargazers_count)}
          </span>
          <span className="repo-card__stat" title="Forks">
            <ForkIcon />
            {formatCount(repo.forks_count)}
          </span>
          {created && (
            <span className="repo-card__stat repo-card__stat--muted">
              {formatRelativeDate(created)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`watch-btn${watched ? ' watch-btn--on' : ''}`}
        onClick={onToggleWatch}
        aria-pressed={watched}
        aria-label={watched ? `Remove ${repo.full_name} from watchlist` : `Add ${repo.full_name} to watchlist`}
      >
        <BookmarkIcon filled={watched} />
        <span>{watched ? 'Watching' : 'Watch'}</span>
      </button>
    </article>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

function ForkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5 5.372v.878c0 .192.168.1.5.5h5c.192.168.1.5.5-.5v-.878a2.25 2.25 0 1 1 1.5 0v.878a2 2 0 0 1-2 2h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.25H6.5a2 2 0 0 1-2-2v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.5 2.5h9v12l-4.5-2.5L3.5 14.5v-12z" strokeLinejoin="round" />
    </svg>
  )
}
