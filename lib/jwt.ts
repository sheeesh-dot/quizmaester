import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

export interface QuizTokenPayload {
  team_id: string
  start_time: string
  exp: number
}

export function signQuizToken(teamId: string, startTime: string): string {
  const start = new Date(startTime)
  const exp = Math.floor(start.getTime() / 1000) + 30 * 60

  const payload: QuizTokenPayload = {
    team_id: teamId,
    start_time: start.toISOString(),
    exp,
  }

  return jwt.sign(payload, JWT_SECRET)
}

export function verifyQuizToken(token: string): QuizTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as QuizTokenPayload
  } catch {
    return null
  }
}

