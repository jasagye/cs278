'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Message } from '@/lib/types'
import { COLOR_THEMES } from '@/lib/colors'
import { reportMessage } from '@/lib/messages'

interface MessageCardProps {
  message: Message
  onReported?: (id: string) => void
}

export default function MessageCard({ message, onReported }: MessageCardProps) {
  const [reported, setReported] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const theme = COLOR_THEMES[message.colorTheme]
  const gradient = `bg-gradient-to-br ${theme.gradient}`

  const timeAgo = message.createdAt
    ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })
    : ''

  async function handleReport() {
    if (confirming) {
      await reportMessage(message.id)
      setReported(true)
      setConfirming(false)
      onReported?.(message.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
    }
  }

  return (
    <div
      className={`relative ${gradient} rounded-2xl p-6 shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group`}
    >
      <div className="flex flex-col h-full min-h-[160px] justify-between">
        <p className="text-white text-base leading-relaxed font-medium break-words">
          {message.body}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
          <span className="text-white/70 text-xs">{timeAgo}</span>

          {!reported ? (
            <button
              onClick={handleReport}
              className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                confirming
                  ? 'bg-white/30 text-white font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10 opacity-0 group-hover:opacity-100'
              }`}
            >
              {confirming ? 'Tap again to report' : 'Report'}
            </button>
          ) : (
            <span className="text-white/60 text-xs">Reported</span>
          )}
        </div>
      </div>
    </div>
  )
}
