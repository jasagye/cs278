import { Timestamp } from 'firebase/firestore'

export type MessageStatus = 'visible' | 'reported' | 'removed'

export type ColorTheme =
  | 'rose-violet'
  | 'sky-indigo'
  | 'amber-orange'
  | 'emerald-teal'
  | 'pink-peach'
  | 'lavender-blue'

export interface Message {
  id: string
  recipientName: string
  recipientNameDisplay: string
  body: string
  colorTheme: ColorTheme
  createdAt: Timestamp
  status: MessageStatus
  reportCount: number
  submitterFingerprint: string
}

export interface AnalyticsEvent {
  event: 'message_submitted' | 'name_searched' | 'message_reported' | 'archive_viewed'
  payload?: Record<string, unknown>
  createdAt: Timestamp
}
