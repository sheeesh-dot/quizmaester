import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { secret } = await request.json()
  if (secret === process.env.ADMIN_SECRET) {
    return Response.json({ ok: true })
  }
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}