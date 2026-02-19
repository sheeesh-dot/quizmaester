import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET || '');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect these routes
  if (pathname.startsWith('/api/quiz') || pathname.startsWith('/api/submit')) {
    const token = req.cookies.get('quiz_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized — no token' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      const res = NextResponse.next();
      res.headers.set('x-team-id', payload.team_id as string);
      res.headers.set('x-start-time', payload.start_time as string);
      return res;

    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/quiz/:path*', '/api/submit/:path*'],
};