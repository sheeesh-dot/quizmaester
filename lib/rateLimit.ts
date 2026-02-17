type Bucket = {
  count: number
  resetAt: number
}

class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>()

  constructor(private limit: number, private windowMs: number) {}

  check(key: string): { success: boolean; retryAfter?: number } {
    const now = Date.now()
    const bucket = this.buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
      return { success: true }
    }

    if (bucket.count < this.limit) {
      bucket.count += 1
      return { success: true }
    }

    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return { success: false, retryAfter }
  }
}

const loginLimiter = new MemoryRateLimiter(5, 60 * 1000)
const defaultLimiter = new MemoryRateLimiter(60, 60 * 1000)

export type RateLimitType = 'login' | 'default'

export function getClientIp(
  headers: Headers,
  fallback: string | null = null,
): string {
  const xff = headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp

  return fallback ?? 'unknown'
}

export function checkRateLimit(
  type: RateLimitType,
  ip: string,
): { success: boolean; retryAfter?: number } {
  const limiter = type === 'login' ? loginLimiter : defaultLimiter
  return limiter.check(ip)
}

