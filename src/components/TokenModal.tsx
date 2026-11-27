import { useState } from 'react'
import { getStoredToken, setStoredToken } from '../api/github'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function TokenModal({ open, onClose, onSaved }: Props) {
  const [token, setToken] = useState(() => getStoredToken())
  const [saved, setSaved] = useState(false)

  if (!open) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setStoredToken(token)
    setSaved(true)
    onSaved()
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  const handleClear = () => {
    setToken('')
    setStoredToken('')
    onSaved()
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="token-modal-title">GitHub token</h2>
        <p className="modal__lead">
          Unauthenticated requests are limited to ~10 search calls per minute.
          A classic personal access token (no scopes required for public data)
          raises that to 30/min.
        </p>
        <form onSubmit={handleSave}>
          <label className="modal__field">
            <span>Personal access token</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="ghp_…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <p className="modal__hint">
            Stored only in your browser&apos;s localStorage. Create one at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/settings/tokens
            </a>
            .
          </p>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={handleClear}>
              Clear
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
