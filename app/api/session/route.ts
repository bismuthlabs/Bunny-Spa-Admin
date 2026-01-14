import { NextResponse } from 'next/server'
import { parseSessionFromRequest } from '@/lib/session'

export async function GET(req: Request) {
  const payload = parseSessionFromRequest(req)
  if (!payload) return NextResponse.json({ session: null })
  // Verify not expired
  if (payload.expiresAt < Date.now()) return NextResponse.json({ session: null })
  return NextResponse.json({ session: payload })
}
