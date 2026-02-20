import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SHARED_PASSWORD_HASH = '$2a$12$5L/XQa90P/6s8sakxl98bOmToU7modf3OFzSuNuXyBebGdUcg2Wvm'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || ''
    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token || token !== process.env.ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const team_name = body?.team_name?.trim()
    if (!team_name) {
      return Response.json({ error: 'Team name is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .insert({
        team_name,
        secret_hash: SHARED_PASSWORD_HASH,
        attempt_status: 'pending',
        round2_status: false,
      })

    if (error) {
      return Response.json({
        error: error.message.includes('unique')
          ? 'A team with that name already exists'
          : error.message
      }, { status: 400 })
    }

    return Response.json({ ok: true, team_name })
  } catch (error) {
    console.error('Create team error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}