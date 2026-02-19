import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await supabaseAdmin.from('team_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('teams').update({ attempt_status: 'pending', round2_status: false }).neq('id', '00000000-0000-0000-0000-000000000000')

  return Response.json({ ok: true })
}