import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { signQuizToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validate'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers, null)
    const rate = checkRateLimit('login', ip)
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {} },
      )
    }

    const json = await request.json().catch(() => null)
    const parsed = loginSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { team_id, secret_code } = parsed.data

    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, secret_hash, attempt_status')
      .eq('id', team_id)
      .maybeSingle()

    if (teamError) {
      console.error('Error fetching team', teamError)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!team) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(secret_code, team.secret_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (team.attempt_status === 'attempted') {
      return NextResponse.json({ error: 'Attempt already used' }, { status: 403 })
    }

    // Atomically claim the attempt using a conditional update to minimise race conditions.
    const { data: updatedTeam, error: updateError } = await supabaseAdmin
      .from('teams')
      .update({ attempt_status: 'attempted' })
      .eq('id', team_id)
      .eq('attempt_status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating attempt_status', updateError)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!updatedTeam) {
      // Another request likely flipped attempt_status first.
      return NextResponse.json({ error: 'Attempt already used' }, { status: 403 })
    }

    const startTime = new Date().toISOString()

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('attempts')
      .upsert(
        {
          team_id,
          start_time: startTime,
          ip_address: ip,
        },
        {
          onConflict: 'team_id',
        },
      )
      .select('start_time')
      .maybeSingle()

    if (attemptError || !attempt) {
      console.error('Error creating attempt', attemptError)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signQuizToken({ team_id, start_time: attempt.start_time })

    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.set('quiz_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 60,
    })

    return response
  } catch (error) {
    console.error('Unexpected login error', error)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}

