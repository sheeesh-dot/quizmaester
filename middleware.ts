import { NextRequest, NextResponse } from 'next/server'

import { verifyQuizToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect quiz and submit routes; login and leaderboard are public.
  if (pathname.startsWith('/api/quiz') || pathname.startsWith('/api/submit')) {
    const token = request.cookies.get('quiz_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyQuizToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Quiz time expired' }, { status: 401 })
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-team-id', payload.team_id)
    requestHeaders.set('x-start-time', payload.start_time)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/quiz/:path*', '/api/submit/:path*'],
}

