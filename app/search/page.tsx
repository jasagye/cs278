'use client'

import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MessageCard from '@/components/MessageCard'
import { Message, NameSuggestion } from '@/lib/types'
import { getNameSuggestions, searchMessages } from '@/lib/messages'

type SearchState = 'idle' | 'loading' | 'done'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([])
  const [searchedName, setSearchedName] = useState('')
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const trimmed = deferredQuery.trim()

    if (!trimmed || !showSuggestions) return

    let cancelled = false

    const timeoutId = window.setTimeout(() => {
      getNameSuggestions(trimmed)
        .then((nextSuggestions) => {
          if (cancelled) return
          startTransition(() => {
            setSuggestions(nextSuggestions)
          })
        })
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [deferredQuery, showSuggestions])

  async function runSearch(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return

    setSearchState('loading')
    setSearchedName(trimmed)
    setShowSuggestions(false)
    setSuggestions([])

    const results = await searchMessages(trimmed)
    startTransition(() => {
      setMessages(results)
      setSearchState('done')
    })
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await runSearch(query)
  }

  function handleRemoved(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="max-w-xl mx-auto mb-10">
        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2 text-center">
          Did someone write to you?
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Search your first name to find out.
        </p>

        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                const nextQuery = e.target.value
                setQuery(nextQuery)
                setShowSuggestions(Boolean(nextQuery.trim()))
                setSuggestions([])
              }}
              onFocus={() => {
                if (query.trim()) setShowSuggestions(true)
              }}
              placeholder="Your first name"
              className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-base transition-shadow"
            />
            <button
              type="submit"
              disabled={searchState === 'loading'}
              className="px-6 py-3.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
            >
              {searchState === 'loading' ? '…' : 'Search'}
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                Popular names
              </p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.name.toLowerCase()}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(suggestion.name)
                    void runSearch(suggestion.name)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-800">{suggestion.name}</span>
                  <span className="text-sm text-gray-400">
                    {suggestion.count} message{suggestion.count !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </form>
      </div>

      {/* Results */}
      {searchState === 'done' && (
        <div>
          {messages.length > 0 ? (
            <>
              <p className="text-gray-500 text-sm text-center mb-6">
                {messages.length} message{messages.length !== 1 ? 's' : ''} for{' '}
                <span className="font-medium text-gray-800 capitalize">{searchedName}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {messages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} onReported={handleRemoved} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">✉️</div>
              <p className="text-gray-700 font-medium text-lg mb-1">
                No one has written to{' '}
                <span className="capitalize">{searchedName}</span> yet.
              </p>
              <p className="text-gray-500 text-sm mb-6">Yet.</p>
              <Link
                href={`/?to=${encodeURIComponent(searchedName)}`}
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Be the first →
              </Link>
            </div>
          )}
        </div>
      )}

      {searchState === 'idle' && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Your search is completely private. No one will know you looked.
        </div>
      )}
    </div>
  )
}
