import { POPULAR_LANGUAGES } from '../api/github'
import type { TimeWindow } from '../types'

interface Props {
  language: string
  window: TimeWindow
  onLanguageChange: (language: string) => void
  onWindowChange: (window: TimeWindow) => void
}

const WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
]

export function Filters({
  language,
  window,
  onLanguageChange,
  onWindowChange,
}: Props) {
  return (
    <div className="filters" role="group" aria-label="Trending filters">
      <div className="filters__windows" role="tablist" aria-label="Time window">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            type="button"
            role="tab"
            aria-selected={window === w.value}
            className={`filters__chip${window === w.value ? ' filters__chip--active' : ''}`}
            onClick={() => onWindowChange(w.value)}
          >
            {w.label}
          </button>
        ))}
      </div>

      <label className="filters__lang">
        <span className="sr-only">Language</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Filter by language"
        >
          {POPULAR_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
