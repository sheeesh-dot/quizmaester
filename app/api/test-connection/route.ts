import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Check env vars exist
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return Response.json({
      status: '❌ FAILED',
      reason: 'Missing env vars',
      NEXT_PUBLIC_SUPABASE_URL: url ? '✅ set' : '❌ missing',
      SUPABASE_SERVICE_ROLE_KEY: key ? '✅ set' : '❌ missing',
    }, { status: 500 });
  }

  // Try to reach Supabase
  try {
    const supabase = createClient(url, key);

    // This will succeed even if the table doesn't exist yet —
    // it just tells us if the connection and credentials work
    const { error } = await supabase.from('teams').select('id').limit(1);

    if (error) {
      return Response.json({
        status: '⚠️ CONNECTED but got DB error',
        error: error.message,
        hint: error.message.includes('does not exist')
          ? 'Tables not created yet — run the schema SQL in Supabase SQL Editor'
          : 'Check your service role key',
      });
    }

    return Response.json({
      status: '✅ SUCCESS — Supabase is connected and tables exist!',
    });

  } catch (err: any) {
    return Response.json({
      status: '❌ FAILED — Could not reach Supabase',
      error: err.message,
    }, { status: 500 });
  }
}