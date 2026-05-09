'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stanford-unsent-verified'

export default function StanfordGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const frameId = window.requestAnimationFrame(() => {
      setVerified(stored === 'true')
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  function handleVerify() {
    if (!checked) return
    localStorage.setItem(STORAGE_KEY, 'true')
    setVerified(true)
  }

  if (verified === null) return null // hydration guard

  if (!verified) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              Stanford Unsent
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              This space is for Stanford students — messages meant for people on campus,
              from people who walked the same paths.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              I&apos;m a Stanford student or affiliate and I&apos;ll use this space with care.
            </span>
          </label>

          <button
            onClick={handleVerify}
            disabled={!checked}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 active:scale-[0.98]"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
