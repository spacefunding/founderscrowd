import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #5271ff 0%, #3a55e8 100%)' }}>
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: '#5271ff' }}>
          Go home
        </Link>
      </div>
    </div>
  )
}
