import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_ASK_API_URL

const SUGGESTIONS = [
  "What's Surendra's experience with Temenos?",
  'What are his key achievements?',
  'How can I contact him?',
]

export default function AskAboutMe() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question) {
    if (!question.trim() || loading) return
    setError(null)
    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    if (!API_URL) {
      setError({
        reason: 'client_not_configured',
        message: 'This feature isn’t connected yet — the site owner still needs to deploy the backend and set VITE_ASK_API_URL.',
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw Object.assign(new Error(data.error || `Request failed (${res.status})`), {
          reason: data.reason || 'unknown_error',
        })
      }
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }])
    } catch (err) {
      setError({
        reason: err.reason || 'network_error',
        message: err.reason
          ? err.message
          : 'Could not reach the assistant — check your connection and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isInfoTone = error?.reason === 'rate_limited' || error?.reason === 'budget_exceeded'

  return (
    <>
      <motion.button
        className="ask-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ask about Surendra"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ask-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ask-header">
              <div>
                <p className="ask-title">Ask about Surendra</p>
                <p className="ask-subtitle">Answers based on his profile</p>
              </div>
            </div>

            <div className="ask-messages" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="ask-empty">
                  <p>Try asking:</p>
                  <div className="ask-suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="ask-suggestion" onClick={() => ask(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`ask-bubble ask-bubble-${m.role}`}>
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="ask-bubble ask-bubble-assistant ask-loading">
                  <Loader2 size={14} className="ask-spinner" /> Thinking…
                </div>
              )}
              {error && (
                <div className={isInfoTone ? 'ask-notice' : 'ask-error'}>{error.message}</div>
              )}
            </div>

            <form
              className="ask-input-row"
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
            >
              <input
                type="text"
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={400}
              />
              <button type="submit" aria-label="Send" disabled={loading || !input.trim()}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
