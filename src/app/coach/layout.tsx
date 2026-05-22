import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/coach/Sidebar"

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, organization_id, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) redirect("/onboarding")
  if (profile.role !== "coach" && profile.role !== "super_admin") {
    redirect("/app/dashboard")
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", profile.organization_id!)
    .single()

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      <Sidebar
        coachName={profile.full_name ?? "Coach"}
        orgName={org?.name ?? "Mi organización"}
        orgSlug={org?.slug ?? ""}
      />
      <main className="flex-1 ml-56 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
