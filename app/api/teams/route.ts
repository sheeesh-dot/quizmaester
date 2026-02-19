import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('teams')
    .select('id, team_name')
    .order('team_name')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ teams: data })
}