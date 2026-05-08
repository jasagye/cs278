import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import StanfordGate from '@/components/StanfordGate'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK'],
})

export const metadata: Metadata = {
  title: 'Stanford Unsent',
  description: 'Write the message you never sent.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 font-sans">
        <StanfordGate>
          <Nav />
          <main className="pt-14">{children}</main>
        </StanfordGate>
      </body>
    </html>
  )
}
