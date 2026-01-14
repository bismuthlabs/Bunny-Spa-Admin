// Deprecated: magic-link callback removed in favor of server-verified passcodes.
// Kept file to explicitly document removal. Redirecting to /unlock.

import { redirect } from 'next/navigation'

export default function DeprecatedCallback() {
  // This endpoint no longer handles magic-link callbacks. Please use the /unlock flow.
  redirect('/unlock')
}
}

