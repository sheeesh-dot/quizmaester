import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { promoteSchema } from '@/lib/validate'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers, null)
    const rate = checkRateLimit('default', ip)
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {} },
      )
    }

    const authHeader = request.headers.get('authorization') || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token || token !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json().catch(() => null)
    const parsed = promoteSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const topN = parsed.data.top_n

    const { data: attempts, error: leaderboardError } = await supabaseAdmin
      .from('attempts')
      .select('team_id, score, completion_time')
      .not('end_time', 'is', null)
      .order('score', { ascending: false })
      .order('completion_time', { ascending: true })
      .limit(topN)

    if (leaderboardError || !attempts || attempts.length === 0) {
      console.error('Error fetching leaderboard for promotion', leaderboardError)
      return NextResponse.json({ error: 'No teams to promote' }, { status: 400 })
    }

    const teamIds = attempts.map((a) => a.team_id as string)

    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({ round2_status: true })
      .in('id', teamIds)

    if (updateError) {
      console.error('Error updating round2_status', updateError)
      return NextResponse.json({ error: 'Failed to promote teams' }, { status: 500 })
    }

    return NextResponse.json({ success: true, promoted_team_ids: teamIds }, { status: 200 })
  } catch (error) {
    console.error('Unexpected admin promote error', error)
    return NextResponse.json({ error: 'Failed to promote teams' }, { status: 500 })
  }
}

