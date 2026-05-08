import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-gray-900 text-lg">
          Unsent
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/search" className="text-gray-500 hover:text-gray-900 transition-colors">
            Search
          </Link>
          <Link href="/archive" className="text-gray-500 hover:text-gray-900 transition-colors">
            Archive
          </Link>
        </div>
      </div>
    </nav>
  )
}
