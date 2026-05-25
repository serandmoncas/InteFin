import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GoalBoard } from "@/components/client/GoalBoard"

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) redirect("/onboarding/client")

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("client_id", clientProfile.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Mis Metas</h1>
        <p className="text-slate-400 text-sm mt-1">
          Objetivos financieros definidos con tu coach
        </p>
      </div>
      <GoalBoard goals={goals ?? []} />
    </div>
  )
}
