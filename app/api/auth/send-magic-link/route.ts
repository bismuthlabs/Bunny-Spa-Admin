// DEPRECATED: magic link endpoint removed in favor of server-verified passcodes.
// If you need to re-enable email magic links, restore the old endpoint with caution.

import { NextResponse } from 'next/server'

export async function POST() {
  return new NextResponse(JSON.stringify({ error: 'Removed' }), { status: 410 })
}
