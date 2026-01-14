import crypto from 'crypto'

const COOKIE_NAME = 'bsa_session'
const ALGO = 'sha256'

function getSecret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('Missing SESSION_SECRET env var')
  return s
}

function base64url(input: Buffer | string) {
  const b = typeof input === 'string' ? Buffer.from(input) : input
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sign(payload: object) {
  const json = JSON.stringify(payload)
  const payloadB64 = base64url(Buffer.from(json))
  const hmac = crypto.createHmac(ALGO, getSecret()).update(payloadB64).digest()
  const sig = base64url(hmac)
  return `${payloadB64}.${sig}`
}

function verify(token: string) {
  try {
    const [payloadB64, sig] = token.split('.')
    if (!payloadB64 || !sig) return null
    const expected = base64url(crypto.createHmac(ALGO, getSecret()).update(payloadB64).digest())
    const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    if (!valid) return null
    const json = Buffer.from(payloadB64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch (err) {
    return null
  }
}

export function createSessionCookie(res: any, payload: { role: string; issuedAt: number; expiresAt: number }, ttlSeconds?: number) {
  const token = sign(payload)
  const cookieParts = [`${COOKIE_NAME}=${token}`, `Path=/`, `HttpOnly`, `SameSite=Strict`]
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure')
  if (typeof ttlSeconds === 'number') cookieParts.push(`Max-Age=${ttlSeconds}`)
  else cookieParts.push(`Max-Age=${Math.floor((payload.expiresAt - payload.issuedAt) / 1000)}`)
  const header = cookieParts.join('; ')
  // Vercel/Next expects res.headers.set or NextResponse
  if (res && typeof res.headers?.set === 'function') {
    res.headers.set('Set-Cookie', header)
  } else if (res && typeof res.setHeader === 'function') {
    res.setHeader('Set-Cookie', header)
  }
}

export function clearSessionCookie(res: any) {
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  if (res && typeof res.headers?.set === 'function') {
    res.headers.set('Set-Cookie', cookie)
  } else if (res && typeof res.setHeader === 'function') {
    res.setHeader('Set-Cookie', cookie)
  }
}

export function parseSessionFromRequest(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const token = match.split('=')[1]
  if (!token) return null
  const payload = verify(token)
  if (!payload) return null
  return payload as { role: string; issuedAt: number; expiresAt: number }
}

export { COOKIE_NAME }
