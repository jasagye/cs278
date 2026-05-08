# Stanford Unsent

A campus-scoped anonymous messaging app for Stanford students. Write messages to people by their first name; anyone can search by first name to discover messages written to them.

Adapted from Rora Blue's [Unsent Project](https://theunsentproject.com), bounded to the Stanford community.

---

## Stack

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
- **Firebase Firestore** — messages, events, rate limiting
- Deployable to **Vercel** in one click

---

## Setup

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → New project
2. Enable **Firestore** (start in production mode)
3. Deploy the security rules: `npx firebase deploy --only firestore:rules`
4. Deploy the indexes: `npx firebase deploy --only firestore:indexes`
5. In Project Settings → General → Your apps → Web, register a new app and copy the config values

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with values from Firebase and your own admin password:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

ADMIN_PASSWORD=your-secret-password

# For seed script only — create a service account key in Firebase Console
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Seed placeholder messages

```bash
npm run seed
```

This writes 18 placeholder messages to Firestore. Replace them before launch.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into Vercel
3. Add all env vars from `.env.example` in the Vercel project settings (skip the `FIREBASE_ADMIN_*` vars unless you run seed from Vercel)
4. Deploy

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing + submit form |
| `/search` | Search by first name |
| `/archive` | Infinite-scroll feed of all messages |
| `/admin` | Moderation queue (password-gated) |

---

## Running tests

```bash
# Start dev server first (or let Playwright start it automatically)
npm test
```

Tests require a configured Firebase project. Tests that need Firestore are skipped if `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is unset.

---

## Data model

**`messages` collection:**

| Field | Type | Notes |
|-------|------|-------|
| `recipientName` | string | Lowercased + trimmed, used for search |
| `recipientNameDisplay` | string | Original casing for display |
| `body` | string | Max 280 chars |
| `colorTheme` | string | One of 6 preset gradient keys |
| `createdAt` | timestamp | Server timestamp |
| `status` | string | `visible` \| `reported` \| `removed` |
| `reportCount` | number | Auto-escalates to `reported` at 3 |
| `submitterFingerprint` | string | Hashed client fingerprint, not shown in UI |

**`events` collection** — lightweight analytics, never stores raw PII.

---

## Adding real auth later

The data layer is auth-ready. To restrict to `@stanford.edu` accounts:

1. Enable Google Auth in Firebase Console
2. Add `next-auth` or Firebase Auth to the app
3. Replace `StanfordGate` (localStorage check) with a real session check
4. Update Firestore rules to require `request.auth.token.email.matches('.*@stanford.edu')`
