import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/app/login')

  const role = session.user.role
  if (role === 'INVESTOR') redirect('/app/investor/dashboard')
  if (role === 'ISSUER') redirect('/app/issuer/dashboard')
  if (role === 'BD_PARTNER') redirect('/app/bd/dashboard')
  if (role === 'ADMIN') redirect('/app/admin/dashboard')
  redirect('/app/offerings')
}
