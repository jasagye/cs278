import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function trackEvent(
  event: 'message_submitted' | 'name_searched' | 'message_reported' | 'archive_viewed',
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await addDoc(collection(db, 'events'), {
      event,
      payload: payload ?? {},
      createdAt: serverTimestamp(),
    })
  } catch {
    // Analytics should never break the user flow
  }
}
