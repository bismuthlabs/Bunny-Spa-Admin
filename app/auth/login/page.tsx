import { redirect } from "next/navigation"

export default function LoginRedirect() {
  // Keep the legacy /auth/login route working by redirecting to /unlock
  redirect('/unlock')
}
