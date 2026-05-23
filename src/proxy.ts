import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = ["/app", "/coach", "/admin", "/onboarding"]

export async function proxy(request: NextRequest) {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, allow request through (don't 500)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // Refresh session — required for Server Components to read auth state
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isProtected  = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

    if (isProtected && !user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/auth/login"
      loginUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch {
    // On any unexpected error, let the request through
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
