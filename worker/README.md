# Ask-about-me proxy worker

A tiny Cloudflare Worker that answers visitor questions about Surendra using
an AI provider (Gemini by default — free, no credit card required; Claude or
OpenAI as alternatives), without ever exposing the API key to the browser.

Built-in guardrails so a traffic spike or abuse can't burn through your quota:

- **Per-IP rate limit**: 5 requests/minute, 30 requests/day per visitor.
- **Global daily token budget**: hard cap of 50,000 tokens/day across all visitors
  (tune `GLOBAL_DAILY_TOKEN_BUDGET` in `src/index.js`).
- **Input cap**: questions are truncated to 400 characters.
- **Output cap**: responses are capped at 300 tokens.
- **CORS lock**: only requests from your GitHub Pages origin are accepted.

## One-time setup

```bash
cd worker
npm install
npx wrangler login          # opens a browser to authorize with your Cloudflare account (free)
npx wrangler kv namespace create RATE_LIMIT_KV
```

Copy the `id` printed by the last command into `wrangler.toml` under `[[kv_namespaces]]`.

### Get a free Gemini API key

Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**, sign in with a Google account, and click
"Create API key". No credit card required. Copy the key — you'll paste it in the next step.

### Set your API key as a secret (never committed to git)

```bash
npx wrangler secret put GEMINI_API_KEY
```

Paste the key when prompted (it won't echo to the terminal). This is stored encrypted by
Cloudflare and only readable by the worker at runtime — it's never in your git history.

To use Claude or OpenAI instead, edit `AI_PROVIDER` in `wrangler.toml` (`"anthropic"` or
`"openai"`) and set the matching secret:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# or
npx wrangler secret put OPENAI_API_KEY
```

## Deploy

```bash
npx wrangler deploy
```

This prints your live Worker URL, e.g. `https://ask-about-surendra.<your-subdomain>.workers.dev`.
Put that URL into the frontend's `VITE_ASK_API_URL` (see the main `README.md`).

## Local testing

```bash
npx wrangler dev
```

```bash
curl -X POST http://localhost:8787 \
  -H "content-type: application/json" \
  -H "Origin: https://surendra85.github.io" \
  -d '{"question": "What does Surendra specialize in?"}'
```

## Tuning the guardrails

Edit the constants at the top of `src/index.js`:

| Constant | Default | Purpose |
|---|---|---|
| `IP_LIMIT_PER_MINUTE` | 5 | Per-visitor burst limit |
| `IP_LIMIT_PER_DAY` | 30 | Per-visitor daily limit |
| `GLOBAL_DAILY_TOKEN_BUDGET` | 50000 | Hard stop across all visitors combined |
| `MAX_INPUT_CHARS` | 400 | Truncates long questions |
| `MAX_OUTPUT_TOKENS` | 300 | Caps response length/cost |

After editing, redeploy with `npx wrangler deploy`.
