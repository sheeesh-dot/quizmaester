import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables');

const secret = new TextEncoder().encode(JWT_SECRET);

export interface QuizTokenPayload {
  team_id: string;
  start_time: string;
}

export async function signQuizToken(payload: QuizTokenPayload): Promise<string> {
  const startTime = new Date(payload.start_time);
  const expiryTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min from start

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiryTime)
    .setIssuedAt()
    .sign(secret);
}

export async function verifyQuizToken(token: string): Promise<QuizTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as QuizTokenPayload;
}