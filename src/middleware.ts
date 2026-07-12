import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/app/investor') && session?.user.role !== 'INVESTOR') {
    return NextResponse.redirect(new URL('/app/login', req.url))
  }
  if (pathname.startsWith('/app/issuer') && session?.user.role !== 'ISSUER') {
    return NextResponse.redirect(new URL('/app/login', req.url))
  }
  if (pathname.startsWith('/app/bd') && session?.user.role !== 'BD_PARTNER') {
    return NextResponse.redirect(new URL('/app/login', req.url))
  }
  if (pathname.startsWith('/app/admin') && session?.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/app/login', req.url))
  }

  if (
    (pathname.startsWith('/app/') &&
      !pathname.startsWith('/app/login') &&
      !pathname.startsWith('/app/register')) &&
    !session
  ) {
    return NextResponse.redirect(new URL('/app/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/app/:path*'],
}
