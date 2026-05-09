'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ColorPicker from '@/components/ColorPicker'
import { ColorTheme } from '@/lib/types'
import { submitMessage } from '@/lib/messages'
import { checkRateLimit } from '@/lib/rateLimit'
import { getFingerprint, warmFingerprint } from '@/lib/fingerprint'
import { containsProfanity } from '@/lib/profanity'

const MAX_NAME = 30
const MAX_BODY = 280

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function HomePage() {
  const [recipientName, setRecipientName] = useState('')
  const [body, setBody] = useState('')
  const [colorTheme, setColorTheme] = useState<ColorTheme>('rose-violet')
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    warmFingerprint()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!recipientName.trim() || !body.trim()) return

    if (containsProfanity(recipientName) || containsProfanity(body)) {
      setErrorMsg("Your message contains language we can't allow. Please revise.")
      return
    }

    setState('loading')

    try {
      const fp = await getFingerprint()
      const { allowed } = await checkRateLimit(fp)

      if (!allowed) {
        setState('error')
        setErrorMsg('Take a breath — you can submit more tomorrow.')
        return
      }

      await submitMessage({
        recipientNameDisplay: recipientName,
        body,
        colorTheme,
        submitterFingerprint: fp,
      })

      setState('success')
      setTimeout(() => {
        setRecipientName('')
        setBody('')
        setColorTheme('rose-violet')
        setState('idle')
      }, 2500)
    } catch {
      setState('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-4 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-4">
          Write the message<br />
          <span className="bg-gradient-to-r from-rose-400 to-violet-500 bg-clip-text text-transparent">
            you never sent.
          </span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          For every conversation that almost happened. Every name you still
          think about. Leave your words here — they might find who they&apos;re meant for.
        </p>
      </section>

      {/* Form */}
      <section className="px-4 pb-20 max-w-lg mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              To
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value.slice(0, MAX_NAME))}
              placeholder="Their first name"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-base transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
              placeholder="Say what you never said…"
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-base resize-none transition-shadow leading-relaxed"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs tabular-nums ${
                  body.length >= MAX_BODY - 20 ? 'text-rose-500' : 'text-gray-400'
                }`}
              >
                {body.length}/{MAX_BODY}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <ColorPicker value={colorTheme} onChange={setColorTheme} />
          </div>

          {errorMsg && (
            <p className="text-rose-500 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading' || state === 'success'}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              state === 'success'
                ? 'bg-emerald-500 text-white scale-[0.99]'
                : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98] disabled:opacity-60'
            }`}
          >
            {state === 'loading'
              ? 'Sending…'
              : state === 'success'
              ? 'Sent into the void ✓'
              : 'Send'}
          </button>
        </form>

        {/* Search CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-2">Someone might have written to you.</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-gray-900 font-medium text-sm hover:gap-2.5 transition-all duration-200"
          >
            Search for your name →
          </Link>
        </div>
      </section>
    </div>
  )
}
