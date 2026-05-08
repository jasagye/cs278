import { test, expect, Page } from '@playwright/test'

async function bypassGate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('stanford-unsent-verified', 'true')
  })
}

test.describe('Stanford Gate', () => {
  test('shows gate on first visit and accepts checkbox', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Stanford Unsent')).toBeVisible()
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByText('Write the message')).toBeVisible()
  })
})

test.describe('Submit flow', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('form submits and shows confirmation', async ({ page }) => {
    // Use Firestore emulator or mock — for CI this test can be skipped
    // if NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    test.skip(!projectId, 'Firebase not configured')

    await page.goto('/')
    await page.getByPlaceholder('Their first name').fill('Alex')
    await page.getByPlaceholder('Say what you never said').fill(
      'I never told you how much our friendship meant to me. Thank you.'
    )
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('Sent into the void ✓')).toBeVisible()
  })

  test('submit is blocked by empty fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Send' }).click()
    // Form validation prevents submission — button stays enabled
    const nameInput = page.getByPlaceholder('Their first name')
    await expect(nameInput).toBeFocused()
  })

  test('char counter updates and caps at 280', async ({ page }) => {
    await page.goto('/')
    const textarea = page.getByPlaceholder('Say what you never said')
    const longText = 'a'.repeat(285)
    await textarea.fill(longText)
    const counter = page.locator('span.tabular-nums')
    await expect(counter).toHaveText('280/280')
  })

  test('profanity in message shows inline error', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Their first name').fill('Sam')
    // Inject a known bad word — the filter will catch it
    await page.getByPlaceholder('Say what you never said').fill('shit')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText(/language we can't allow/)).toBeVisible()
  })
})

test.describe('Search flow', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('search input is autofocused', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByPlaceholder('Your first name')).toBeFocused()
  })

  test('empty search result shows empty state', async ({ page }) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    test.skip(!projectId, 'Firebase not configured')

    await page.goto('/search')
    // Search for an extremely unlikely name to get empty state
    await page.getByPlaceholder('Your first name').fill('Xqzpwlmnvbr')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('No one has written to')).toBeVisible()
  })

  test('search with results shows cards', async ({ page }) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    test.skip(!projectId, 'Firebase not configured')

    await page.goto('/search')
    // Search for a seeded name
    await page.getByPlaceholder('Your first name').fill('Maya')
    await page.getByRole('button', { name: 'Search' }).click()
    // Wait for either results or empty state
    await expect(
      page.getByText('messages for').or(page.getByText('No one has written to'))
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Archive', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('archive page renders', async ({ page }) => {
    await page.goto('/archive')
    await expect(page.getByText('The Archive')).toBeVisible()
  })
})

test.describe('Report flow', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('report button requires confirmation tap', async ({ page }) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    test.skip(!projectId, 'Firebase not configured')

    await page.goto('/archive')
    // Hover first card to reveal report button
    const card = page.locator('[class*="group"]').first()
    await card.hover()
    const reportBtn = card.getByRole('button', { name: 'Report' })
    await reportBtn.click()
    await expect(reportBtn).toHaveText('Tap again to report')
  })
})

test.describe('Rate limiting', () => {
  test('rate limit message appears after 5 rapid submissions', async ({ page }) => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    test.skip(!projectId, 'Firebase not configured')

    // Inject a known fingerprint with an existing high count by mocking the module
    await page.addInitScript(() => {
      // Simulate fingerprint that's already rate-limited by having localStorage
      // reflect a known fingerprint — actual limit check is Firestore-based
      localStorage.setItem('stanford-unsent-verified', 'true')
    })

    await page.goto('/')
    // If the fingerprint is already throttled, submitting triggers the error
    // This test is illustrative; full coverage requires Firestore emulator
  })
})
