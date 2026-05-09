'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/lib/types'
import { getReportedMessages, setMessageStatus } from '@/lib/messages'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setAuthLoading(false)
    if (res.ok) {
      setLoading(true)
      setAuthed(true)
    } else {
      setError('Wrong password.')
    }
  }

  useEffect(() => {
    if (!authed) return

    let cancelled = false

    getReportedMessages()
      .then((nextMessages) => {
        if (cancelled) return
        setMessages(nextMessages)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authed])

  async function approve(id: string) {
    await setMessageStatus(id, 'visible')
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  async function remove(id: string) {
    await setMessageStatus(id, 'removed')
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm space-y-4"
        >
          <h1 className="font-serif text-2xl font-bold text-gray-900">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            {authLoading ? '…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
        Reported Messages
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {messages.length} pending review
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-gray-400 text-center py-16">Nothing to review.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">
                    To:{' '}
                    <span className="font-medium text-gray-600">
                      {msg.recipientNameDisplay}
                    </span>
                    {' · '}
                    Reports:{' '}
                    <span className="text-rose-500">{msg.reportCount}</span>
                  </p>
                  <p className="text-gray-800 leading-relaxed break-words">{msg.body}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(msg.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => remove(msg.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-sm font-medium hover:bg-rose-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
