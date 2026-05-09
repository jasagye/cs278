import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = admin.firestore(app)

const SEED_MESSAGES = [
  {
    recipientNameDisplay: 'Maya',
    body: 'I still think about the conversation we had on the Oval that afternoon. You made something click that I hadn\'t been able to name for months.',
    colorTheme: 'rose-violet',
  },
  {
    recipientNameDisplay: 'Jordan',
    body: 'You lent me your notes before section and I never properly thanked you. You saved my grade and probably my sanity that quarter.',
    colorTheme: 'sky-indigo',
  },
  {
    recipientNameDisplay: 'Priya',
    body: 'I wanted to say I admire how you spoke up in that meeting. I was thinking the same thing and didn\'t have the courage. You did.',
    colorTheme: 'emerald-teal',
  },
  {
    recipientNameDisplay: 'Marcus',
    body: 'You probably don\'t remember me but you held the door and asked if I was okay when I was clearly not okay. That was a kind thing.',
    colorTheme: 'amber-orange',
  },
  {
    recipientNameDisplay: 'Sofia',
    body: 'I keep starting this message and deleting it. I guess I just want you to know that the year I knew you was the best year I had here.',
    colorTheme: 'pink-peach',
  },
  {
    recipientNameDisplay: 'Eli',
    body: 'You\'re the funniest person I\'ve ever met and you don\'t even try. I hope wherever you ended up after graduation, people can see that.',
    colorTheme: 'lavender-blue',
  },
  {
    recipientNameDisplay: 'Nadia',
    body: 'I almost said something after that lecture. I\'m still not sure why I didn\'t. Maybe I was afraid it would change things. Maybe it would have.',
    colorTheme: 'rose-violet',
  },
  {
    recipientNameDisplay: 'Tyler',
    body: 'Thank you for being honest with me when I needed honesty, not when I asked for it.',
    colorTheme: 'sky-indigo',
  },
  {
    recipientNameDisplay: 'Aisha',
    body: 'Your thesis presentation was the most beautiful thing I\'ve heard explained in an academic setting. I wanted to stand up and clap but didn\'t want to be weird.',
    colorTheme: 'amber-orange',
  },
  {
    recipientNameDisplay: 'Sam',
    body: 'I hope you got the fellowship. I think about whether you got it sometimes. You deserved it more than anyone I know.',
    colorTheme: 'emerald-teal',
  },
  {
    recipientNameDisplay: 'Leila',
    body: 'You changed how I think about what I\'m doing here. I don\'t think you meant to but you did.',
    colorTheme: 'pink-peach',
  },
  {
    recipientNameDisplay: 'Chris',
    body: 'I should have called you back. I kept meaning to and then time just — went. I\'m sorry about that.',
    colorTheme: 'lavender-blue',
  },
  {
    recipientNameDisplay: 'Isabelle',
    body: 'You sat next to me on the first day of freshman year and talked to me when no one else did. That mattered more than you know.',
    colorTheme: 'rose-violet',
  },
  {
    recipientNameDisplay: 'Ravi',
    body: 'I still have the playlist you made for that road trip. It\'s embarrassingly good and I listen to it when I need to feel something.',
    colorTheme: 'sky-indigo',
  },
  {
    recipientNameDisplay: 'Camille',
    body: 'I\'m rooting for you. I know that\'s a strange thing to put in a message you\'ll never see. But I am, genuinely, rooting for you.',
    colorTheme: 'amber-orange',
  },
  {
    recipientNameDisplay: 'Devon',
    body: 'The way you talked about your research made me want to care about things again. I\'d lost that for a while.',
    colorTheme: 'emerald-teal',
  },
  {
    recipientNameDisplay: 'Ana',
    body: 'You were right about that. All of it. I was too stubborn to say so then.',
    colorTheme: 'pink-peach',
  },
  {
    recipientNameDisplay: 'Zion',
    body: 'I think you\'re one of the most genuinely curious people I\'ve met at this place. Please keep being that. It\'s rare.',
    colorTheme: 'lavender-blue',
  },
]

async function seed() {
  console.log(`Seeding ${SEED_MESSAGES.length} messages…`)
  const batch = db.batch()

  for (const msg of SEED_MESSAGES) {
    const ref = db.collection('messages').doc()
    batch.set(ref, {
      recipientName: msg.recipientNameDisplay.toLowerCase().trim(),
      recipientNameDisplay: msg.recipientNameDisplay,
      body: msg.body,
      colorTheme: msg.colorTheme,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'visible',
      reportCount: 0,
      submitterFingerprint: 'seed',
    })
  }

  await batch.commit()
  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
