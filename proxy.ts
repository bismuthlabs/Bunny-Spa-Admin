import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("sb-auth-token")

    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)",
  ],
}
