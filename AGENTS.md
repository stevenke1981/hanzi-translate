# Codex project instructions

## Product

This repository is the production source for 譯匠, a Traditional Chinese-first
translation and text conversion website.

Live site: https://translate.aquamoon.app

Cloudflare Worker fallback: https://hanzi-translate.stevenke1981.workers.dev

## Preserve

- Keep `.openai/hosting.json` and its existing project identity.
- Keep the Vinext/Vite/Sites build architecture and the `sites()` Vite plugin.
- Preserve Simplified/Traditional conversion, encoding tools, translation,
  SEO, legal pages, consent flow, and AdSense slots.
- Simplified/Traditional and encoding conversions must remain local and
  unlimited.
- Never hardcode or commit API keys, Cloudflare tokens, or AdSense credentials.
- User-provided API keys must remain device-local and must not be persisted by
  the server.

## Quality gates

Run the smallest relevant checks during development and finish with:

```bash
npm run lint
npm run build
npm test
```

Test the main route, mobile layout, Simplified/Traditional conversion, one
encoding round-trip, translation settings, privacy consent, `/privacy`,
`/terms`, `/robots.txt`, `/sitemap.xml`, and `/ads.txt`.

## Deployment

- Existing Sites deployment should use the Sites lifecycle and existing
  `.openai/hosting.json`.
- Direct deployment to a personal Cloudflare account requires an authenticated
  Wrangler session and a reviewed `wrangler.jsonc`.
- Never create a second Sites project for this repository.
