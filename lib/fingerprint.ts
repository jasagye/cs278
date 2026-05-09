'use client'

let cachedFingerprint: string | null = null
let fingerprintPromise: Promise<string> | null = null

async function loadFingerprint(): Promise<string> {
  try {
    const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
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
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint
  if (!fingerprintPromise) {
    fingerprintPromise = loadFingerprint().then((fingerprint) => {
      cachedFingerprint = fingerprint
      return fingerprint
    })
  }
  return fingerprintPromise
}

export function warmFingerprint(): void {
  void getFingerprint()
}
