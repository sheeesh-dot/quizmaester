import { NextRequest, NextResponse } from 'next/server'
import { verifyQuizToken } from '@/lib/jwt'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('quiz_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyQuizToken(token)
    const { type, count } = await request.json()

    await supabaseAdmin
      .from('attempts')
      .update({
        violations: count,
        last_violation_type: type,
      })
      .eq('team_id', payload.team_id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}