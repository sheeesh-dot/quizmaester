import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyQuizToken } from '@/lib/jwt'
import { submitSchema } from '@/lib/validate'

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

    const token = request.cookies.get('quiz_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyQuizToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Quiz time expired' }, { status: 401 })
    }

    const json = await request.json().catch(() => null)
    const parsed = submitSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const teamId = payload.team_id

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('attempts')
      .select('team_id, start_time, end_time')
      .eq('team_id', teamId)
      .maybeSingle()

    if (attemptError || !attempt) {
      console.error('Error fetching attempt', attemptError)
      return NextResponse.json({ error: 'Submission window closed' }, { status: 403 })
    }

    if (attempt.end_time) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }

    const now = new Date()
    const startTime = new Date(attempt.start_time as string)
    const diffMs = now.getTime() - startTime.getTime()
    const diffMinutes = diffMs / (60 * 1000)

    if (diffMinutes > 30) {
      return NextResponse.json({ error: 'Submission window closed' }, { status: 403 })
    }

    const { data: teamQuestions, error: tqError } = await supabaseAdmin
      .from('team_questions')
      .select('question_ids')
      .eq('team_id', teamId)
      .maybeSingle()

    if (tqError || !teamQuestions || !Array.isArray(teamQuestions.question_ids)) {
      console.error('Error fetching team_questions', tqError)
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const assignedIds = new Set<string>(teamQuestions.question_ids as string[])

    const submittedAnswers = parsed.data.answers.filter((answer) =>
      assignedIds.has(answer.question_id),
    )

    if (submittedAnswers.length === 0) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const questionIds = submittedAnswers.map((a) => a.question_id)

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('id, correct_option')
      .in('id', questionIds)

    if (questionsError || !questions) {
      console.error('Error fetching questions for scoring', questionsError)
      return NextResponse.json({ error: 'Failed to score submission' }, { status: 500 })
    }

    const correctMap = new Map<string, string>()
    for (const q of questions) {
      correctMap.set(q.id as string, q.correct_option as string)
    }

    let totalCorrect = 0
    let totalWrong = 0

    for (const answer of submittedAnswers) {
      const correct = correctMap.get(answer.question_id)
      if (!correct) continue
      if (answer.selected_option === correct) {
        totalCorrect += 1
      } else {
        totalWrong += 1
      }
    }

    const score = totalCorrect

    const endTime = new Date()
    const completionSeconds = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000,
    )

    const { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from('attempts')
      .update({
        end_time: endTime.toISOString(),
        score,
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        completion_time: completionSeconds,
      })
      .eq('team_id', teamId)
      .is('end_time', null)
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating attempt with score', updateError)
      return NextResponse.json({ error: 'Failed to score submission' }, { status: 500 })
    }

    if (!updatedAttempt) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }

    return NextResponse.json(
      {
        success: true,
        score,
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        completion_time: completionSeconds,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unexpected submit error', error)
    return NextResponse.json({ error: 'Failed to score submission' }, { status: 500 })
  }
}

