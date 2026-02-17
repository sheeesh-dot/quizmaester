import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyQuizToken } from '@/lib/jwt'

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers, request.ip ?? null)
    const rate = checkRateLimit('default', ip)
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : {} },
      )
    }

    const token = request.cookies.get('quiz_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyQuizToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teamId = payload.team_id

    const { data: teamQuestions, error: tqError } = await supabaseAdmin
      .from('team_questions')
      .select('question_ids')
      .eq('team_id', teamId)
      .maybeSingle()

    if (tqError) {
      console.error('Error fetching team_questions', tqError)
      return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
    }

    let questionIds: string[]

    if (teamQuestions && Array.isArray(teamQuestions.question_ids)) {
      questionIds = teamQuestions.question_ids as string[]
    } else {
      const { data: allQuestions, error: questionsError } = await supabaseAdmin
        .from('questions')
        .select('id, question_text, option_a, option_b, option_c, option_d')

      if (questionsError || !allQuestions || allQuestions.length === 0) {
        console.error('Error fetching questions', questionsError)
        return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
      }

      const shuffled = shuffleArray(allQuestions)
      const selected = shuffled.slice(0, 10)

      questionIds = selected.map((q) => q.id as string)

      const { error: insertError } = await supabaseAdmin.from('team_questions').insert({
        team_id: teamId,
        question_ids: questionIds,
      })

      if (insertError) {
        console.error('Error inserting team_questions', insertError)
        return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
      }
    }

    const { data: questions, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d')
      .in('id', questionIds)

    if (fetchError || !questions) {
      console.error('Error fetching selected questions', fetchError)
      return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
    }

    const responseQuestions = questions.map((q) => {
      const options = shuffleArray([
        { key: 'a', text: q.option_a },
        { key: 'b', text: q.option_b },
        { key: 'c', text: q.option_c },
        { key: 'd', text: q.option_d },
      ])

      return {
        id: q.id,
        question_text: q.question_text,
        options,
      }
    })

    return NextResponse.json({ questions: responseQuestions }, { status: 200 })
  } catch (error) {
    console.error('Unexpected quiz error', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

