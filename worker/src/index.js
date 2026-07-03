/**
 * Ask-about-me proxy worker.
 *
 * Keeps the AI provider's API key server-side (never shipped to the browser),
 * answers questions about Surendra using a fixed profile context, and enforces
 * a per-IP rate limit plus a hard daily token budget so a traffic spike or
 * abuse can't exhaust the API quota.
 *
 * Configure via `wrangler secret put` / wrangler.toml vars — see worker/README.md.
 */

const PROFILE_CONTEXT = `You are answering questions on behalf of Surendra Nath Gontla, a Lead Architect based in Amsterdam, Netherlands.
Answer ONLY questions about Surendra's professional background, using the facts below. If asked something unrelated
or something not covered by these facts, politely say you don't have that information. Keep answers short: 2-4 sentences.
Never invent facts not listed here.

SUMMARY: Experienced Technical Architect and Principal Consultant with 10+ years leading digital banking transformation
across Retail and SME sectors. Specializes in Temenos Infinity and Kony Quantum platforms, micro-app architecture,
performance optimization, and accessibility (a11y) compliance.

SKILLS: Temenos Quantum, Temenos Digital, JavaScript, ReactJs, AngularJS, Java, Spring, Hibernate, MySQL, HTML, CSS, AWS.

WORK HISTORY:
- Lead Architect, Temenos Holland BV, Amsterdam (July 2023-Current). Client: Credem Bank Internet Banking Platform.
  Architected a scalable modular internet banking platform with multi-domain URL support.
- Principal Technical Consultant, Temenos Holland BV, Amsterdam (Mar 2022-Jun 2023). Led Credem Bank's move from
  monolith to micro-app architecture in Temenos Infinity; drove WCAG accessibility work; improved load time 25%+.
- Technical Lead, Temenos India / Kony Labs, Hyderabad (Jul 2019-Feb 2022). Led micro-app modularization for
  Retail & SME platforms; built tooling that improved dev efficiency by 50%.
- Associate Technical Lead, Kony Labs, Hyderabad (Sep 2018-Jun 2019) and Bangkok (Dec 2017-Aug 2018).
- Senior Software Engineer, Software Engineer, Associate Software Engineer, Kony Labs, Hyderabad (Jun 2013-Nov 2017).

EDUCATION: B.Tech (Honors), Computer Science & Engineering, National Institute of Technology, Warangal (2009-2013).

ACHIEVEMENTS: Pinnacle Award (2017), CEO Excellence Award (2018), Top 25 Employees of the Year (2019), GEM Award (2023).
CERTIFICATIONS: Temenos Certified Expert - Infinity Architecture, AWS Cloud.
LANGUAGES: English (bilingual), Telugu (native), Hindi (intermediate), Dutch (beginner), Italian (beginner).
CONTACT: gontla.surendra@gmail.com, GitHub: https://github.com/surendra85, Amsterdam, Netherlands.`

const MAX_INPUT_CHARS = 400
const MAX_OUTPUT_TOKENS = 300

// Rate limiting knobs — tune these to your risk tolerance.
const IP_LIMIT_PER_MINUTE = 5
const IP_LIMIT_PER_DAY = 30
const GLOBAL_DAILY_TOKEN_BUDGET = 50000

function corsHeaders(origin, allowedOrigins) {
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function checkAndIncrementRateLimit(kv, ip) {
  const minuteKey = `rl:min:${ip}:${Math.floor(Date.now() / 60000)}`
  const dayKey = `rl:day:${ip}:${todayKey()}`

  const [minuteCount, dayCount] = await Promise.all([
    kv.get(minuteKey),
    kv.get(dayKey),
  ])

  if (Number(minuteCount || 0) >= IP_LIMIT_PER_MINUTE) {
    return { allowed: false, reason: 'Too many requests. Please wait a minute and try again.' }
  }
  if (Number(dayCount || 0) >= IP_LIMIT_PER_DAY) {
    return { allowed: false, reason: "You've reached today's question limit for this feature. Please try again tomorrow." }
  }

  await Promise.all([
    kv.put(minuteKey, String(Number(minuteCount || 0) + 1), { expirationTtl: 60 }),
    kv.put(dayKey, String(Number(dayCount || 0) + 1), { expirationTtl: 86400 }),
  ])

  return { allowed: true }
}

async function checkGlobalBudget(kv) {
  const key = `budget:${todayKey()}`
  const used = Number((await kv.get(key)) || 0)
  return { remaining: GLOBAL_DAILY_TOKEN_BUDGET - used, key, used }
}

async function addToGlobalBudget(kv, key, used, tokens) {
  await kv.put(key, String(used + tokens), { expirationTtl: 172800 })
}

async function callAnthropic(env, question) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: MAX_OUTPUT_TOKENS,
      system: PROFILE_CONTEXT,
      messages: [{ role: 'user', content: question }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Anthropic API error')
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
  return { text, tokens }
}

async function callOpenAI(env, question) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: PROFILE_CONTEXT },
        { role: 'user', content: question },
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'OpenAI API error')
  const text = data.choices?.[0]?.message?.content || ''
  const tokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0)
  return { text, tokens }
}

async function callGemini(env, question) {
  const model = env.GEMINI_MODEL || 'gemini-1.5-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROFILE_CONTEXT }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini API error')
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  const tokens = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0)
  return { text, tokens }
}

function requiredKeyFor(provider) {
  if (provider === 'openai') return 'OPENAI_API_KEY'
  if (provider === 'gemini') return 'GEMINI_API_KEY'
  return 'ANTHROPIC_API_KEY'
}

async function callProvider(env, question) {
  const provider = (env.AI_PROVIDER || 'anthropic').toLowerCase()
  if (provider === 'openai') return callOpenAI(env, question)
  if (provider === 'gemini') return callGemini(env, question)
  return callAnthropic(env, question)
}

export default {
  async fetch(request, env) {
    const allowedOrigins = (env.ALLOWED_ORIGINS || 'https://surendra85.github.io').split(',')
    const origin = request.headers.get('Origin') || ''
    const headers = corsHeaders(origin, allowedOrigins)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'content-type': 'application/json' },
      })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'content-type': 'application/json' },
      })
    }

    const question = String(body?.question || '').slice(0, MAX_INPUT_CHARS).trim()
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing "question" field' }), {
        status: 400,
        headers: { ...headers, 'content-type': 'application/json' },
      })
    }

    const provider = (env.AI_PROVIDER || 'anthropic').toLowerCase()
    const requiredKey = requiredKeyFor(provider)
    if (!env[requiredKey]) {
      return new Response(
        JSON.stringify({
          error: `This feature isn't finished setting up yet — the server is missing ${requiredKey}. Ask the site owner to run "wrangler secret put ${requiredKey}".`,
          reason: 'not_configured',
        }),
        { status: 500, headers: { ...headers, 'content-type': 'application/json' } },
      )
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const kv = env.RATE_LIMIT_KV

    const rate = await checkAndIncrementRateLimit(kv, ip)
    if (!rate.allowed) {
      return new Response(JSON.stringify({ error: rate.reason, reason: 'rate_limited' }), {
        status: 429,
        headers: { ...headers, 'content-type': 'application/json' },
      })
    }

    const budget = await checkGlobalBudget(kv)
    if (budget.remaining <= 0) {
      return new Response(
        JSON.stringify({
          error: "This feature has hit its daily usage cap. Please try again tomorrow.",
          reason: 'budget_exceeded',
        }),
        { status: 429, headers: { ...headers, 'content-type': 'application/json' } },
      )
    }

    try {
      const { text, tokens } = await callProvider(env, question)
      await addToGlobalBudget(kv, budget.key, budget.used, tokens)
      return new Response(JSON.stringify({ answer: text }), {
        headers: { ...headers, 'content-type': 'application/json' },
      })
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'The AI provider could not answer that just now. Please try again in a moment.',
          reason: 'provider_error',
        }),
        { status: 502, headers: { ...headers, 'content-type': 'application/json' } },
      )
    }
  },
}
