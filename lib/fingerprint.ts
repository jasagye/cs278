'use client'

let cachedFingerprint: string | null = null

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint

  try {
    const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedFingerprint = result.visitorId
    return cachedFingerprint
  } catch {
    // Fallback: hash of navigator signals
    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join('|')
    const encoded = new TextEncoder().encode(raw)
    const buf = await crypto.subtle.digest('SHA-256', encoded)
    cachedFingerprint = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return cachedFingerprint
  }
}
