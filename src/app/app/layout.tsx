import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientNav } from "@/components/client/ClientNav"
import { ClientBottomNav } from "@/components/client/ClientBottomNav"

export default async function ClientAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed, full_name")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) redirect("/onboarding/client")
  if (profile.role === "coach" || profile.role === "super_admin") redirect("/coach/overview")

  const initials = profile.full_name
    ?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "C"

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Top nav */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            IF
          </div>
          <span className="text-slate-100 font-semibold text-sm">InteliFin</span>
        </div>
        <ClientNav />
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </header>
      {/* pb-20 on mobile gives space above the bottom nav */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">{children}</main>
      <ClientBottomNav />
    </div>
  )
}
