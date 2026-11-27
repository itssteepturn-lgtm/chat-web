# Pulse — GitHub Trending Tracker

Discover and track hot open-source projects on GitHub. Browse repos that are gaining attention, filter by language and time window, and keep a personal watchlist in your browser.

## Features

- **Trending browse** — recently created repositories ranked by stars (daily / weekly / monthly)
- **Language filter** — TypeScript, Python, Rust, Go, and more
- **Watchlist** — pin repos you care about (stored in `localStorage`)
- **Optional GitHub token** — higher Search API rate limits without leaving the browser

## How trending works

GitHub does not expose an official public “trending” REST endpoint. Pulse uses the documented [Search repositories](https://docs.github.com/en/rest/search/search#search-repositories) API:

```text
created:>YYYY-MM-DD stars:>5 [language:…]
sort=stars&order=desc
```

That approximates “what’s hot” for a time window without scraping undocumented pages.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Optional: GitHub personal access token

Unauthenticated search is capped at about **10 requests/minute**. A classic PAT (no scopes needed for public repos) raises that to **30/minute**.

1. Create a token at [github.com/settings/tokens](https://github.com/settings/tokens)
2. In the app, click **API token** and paste it

The token is stored only in your browser’s `localStorage`.

## Stack

- React 19 + TypeScript
- Vite
- GitHub REST Search API

## License

MIT
