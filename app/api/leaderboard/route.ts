import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers, null)
    const rate = checkRateLimit('default', ip)
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {} },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('attempts')
      .select(`
        team_id,
        score,
        total_correct,
        total_wrong,
        completion_time,
        teams ( team_name, round2_status )
      `)
      .not('end_time', 'is', null)
      .order('score', { ascending: false })
      .order('completion_time', { ascending: true })

    if (error || !data) {
      console.error('Error fetching leaderboard', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    const leaderboard = data.map((row) => ({
      team_id: row.team_id,
      team_name: (row as any).teams?.team_name,
      score: row.score,
      total_correct: row.total_correct,
      total_wrong: row.total_wrong,
      completion_time: row.completion_time,
      round2_status: (row as any).teams?.round2_status ?? false,
    }))

    return NextResponse.json({ leaderboard }, { status: 200 })
  } catch (error) {
    console.error('Unexpected leaderboard error', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}