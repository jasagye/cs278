'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import MessageCard from '@/components/MessageCard'
import { Message } from '@/lib/types'
import { getArchivePage } from '@/lib/messages'
import { trackEvent } from '@/lib/analytics'
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'

export default function ArchivePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const trackedRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (!hasMore) return
    setLoading(true)

    const { messages: newMessages, lastDoc } = await getArchivePage(
      cursorRef.current ?? undefined
    )

    cursorRef.current = lastDoc
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id))
      return [...prev, ...newMessages.filter((m) => !ids.has(m.id))]
    })
    setHasMore(lastDoc !== null)
    setLoading(false)
  }, [hasMore])

  // Initial load + analytics
  useEffect(() => {
    let cancelled = false

    getArchivePage()
      .then(({ messages: initialMessages, lastDoc }) => {
        if (cancelled) return
        cursorRef.current = lastDoc
        setMessages(initialMessages)
        setHasMore(lastDoc !== null)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    if (!trackedRef.current) {
      trackedRef.current = true
      void trackEvent('archive_viewed')
    }

    return () => {
      cancelled = true
    }
  }, [])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, hasMore, loadMore])

  function handleRemoved(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
          The Archive
        </h1>
        <p className="text-gray-500 text-sm">
          Every message, to everyone, from everyone. In no particular order.
        </p>
      </div>

      {messages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} onReported={handleRemoved} />
          ))}
        </div>
      ) : loading ? null : (
        <div className="text-center py-20 text-gray-400">
          Nothing here yet. Be the first.
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8 mt-8" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && messages.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          You&apos;ve read them all.
        </p>
      )}
    </div>
  )
}
