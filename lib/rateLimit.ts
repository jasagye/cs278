import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

const MAX_SUBMISSIONS = 5
const WINDOW_MS = 24 * 60 * 60 * 1000

export async function checkRateLimit(fingerprint: string): Promise<{ allowed: boolean }> {
  const windowStart = Timestamp.fromMillis(Date.now() - WINDOW_MS)

  const q = query(
    collection(db, 'messages'),
    where('submitterFingerprint', '==', fingerprint),
    where('createdAt', '>=', windowStart)
  )

  const snap = await getDocs(q)
  return { allowed: snap.size < MAX_SUBMISSIONS }
}
