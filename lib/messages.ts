import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  runTransaction,
  increment,
} from 'firebase/firestore'
import { db } from './firebase'
import { Message, ColorTheme, MessageStatus } from './types'
import { trackEvent } from './analytics'

const PAGE_SIZE = 30

function toMessage(docSnap: QueryDocumentSnapshot<DocumentData>): Message {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    recipientName: d.recipientName,
    recipientNameDisplay: d.recipientNameDisplay,
    body: d.body,
    colorTheme: d.colorTheme as ColorTheme,
    createdAt: d.createdAt,
    status: d.status as MessageStatus,
    reportCount: d.reportCount ?? 0,
    submitterFingerprint: d.submitterFingerprint,
  }
}

export async function submitMessage(params: {
  recipientNameDisplay: string
  body: string
  colorTheme: ColorTheme
  submitterFingerprint: string
}): Promise<void> {
  const recipientName = params.recipientNameDisplay.toLowerCase().trim()

  await addDoc(collection(db, 'messages'), {
    recipientName,
    recipientNameDisplay: params.recipientNameDisplay.trim(),
    body: params.body.trim(),
    colorTheme: params.colorTheme,
    createdAt: serverTimestamp(),
    status: 'visible',
    reportCount: 0,
    submitterFingerprint: params.submitterFingerprint,
  })

  await trackEvent('message_submitted')
}

export async function searchMessages(name: string): Promise<Message[]> {
  const normalized = name.toLowerCase().trim()

  const q = query(
    collection(db, 'messages'),
    where('recipientName', '==', normalized),
    where('status', '==', 'visible'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )

  const snap = await getDocs(q)
  const results = snap.docs.map(toMessage)

  // Hash the query for analytics — never store raw
  const encoded = new TextEncoder().encode(normalized)
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  const hashedQuery = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  await trackEvent('name_searched', { hashedQuery, resultCount: results.length })

  return results
}

export async function getArchivePage(
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{ messages: Message[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  let q = query(
    collection(db, 'messages'),
    where('status', '==', 'visible'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  )

  if (cursor) {
    q = query(
      collection(db, 'messages'),
      where('status', '==', 'visible'),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(PAGE_SIZE)
    )
  }

  const snap = await getDocs(q)
  const messages = snap.docs.map(toMessage)
  const lastDoc = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null

  return { messages, lastDoc }
}

export async function reportMessage(id: string): Promise<void> {
  const ref = doc(db, 'messages', id)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return

    const newCount = (snap.data().reportCount ?? 0) + 1
    const update: Partial<Pick<Message, 'reportCount' | 'status'>> = {
      reportCount: newCount,
    }
    if (newCount >= 3) {
      update.status = 'reported'
    }
    tx.update(ref, update)
  })

  await trackEvent('message_reported', { messageId: id })
}

// Admin helpers
export async function getReportedMessages(): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('status', '==', 'reported'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(toMessage)
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<void> {
  await updateDoc(doc(db, 'messages', id), { status })
}
