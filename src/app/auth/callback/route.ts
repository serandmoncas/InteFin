import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/login`)

  // Check if this is a client invited via inviteUserByEmail
  const meta = user.user_metadata as {
    role?: string
    organization_id?: string
    coach_id?: string
    full_name?: string
  }

  const isInvitedClient =
    meta?.role === "client" &&
    meta?.organization_id &&
    meta?.coach_id

  if (isInvitedClient) {
    // Look up existing profile (auto-created by trigger with role=client)
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, organization_id")
      .eq("id", user.id)
      .single()

    // Attach to the inviting org if not yet done
    if (!profile?.organization_id) {
      await supabase
        .from("profiles")
        .update({
          full_name:       meta.full_name ?? "",
          role:            "client",
          organization_id: meta.organization_id,
        })
        .eq("id", user.id)
    }

    // Create client_profile if it doesn't exist yet
    const { data: existingClient } = await supabase
      .from("client_profiles")
      .select("id, onboarding_completed: status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!existingClient) {
      await supabase.from("client_profiles").insert({
        user_id:         user.id,
        organization_id: meta.organization_id!,
        coach_id:        meta.coach_id!,
        status:          "lead",
      })
    }

    // Mark invitation as used
    await supabase
      .from("client_invitations")
      .update({ used: true })
      .eq("email", user.email!)
      .eq("organization_id", meta.organization_id!)

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/onboarding/client`)
    }
    return NextResponse.redirect(`${origin}/app/dashboard`)
  }

  // Regular login — redirect by role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  if (profile.role === "coach" || profile.role === "super_admin") {
    return NextResponse.redirect(`${origin}/coach/overview`)
  }

  return NextResponse.redirect(`${origin}/app/dashboard`)
}
