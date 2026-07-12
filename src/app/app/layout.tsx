import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PlatformNav from '@/components/platform/PlatformNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/app/login')

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <PlatformNav user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
