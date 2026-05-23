import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/coach/SettingsForm"

export default async function CoachSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) redirect("/onboarding")

  const { data: org } = await supabase
    .from("organizations")
    .select("name, slug, tagline, bio, contact_email, whatsapp, brand_color")
    .eq("id", profile.organization_id)
    .single()

  if (!org) redirect("/onboarding")

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
  const publicUrl  = `${siteOrigin}/${org.slug}`

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Tu perfil público</h1>
        <p className="text-slate-400 text-sm mt-1">
          Esta información se muestra a quien visite tu link público.
        </p>
      </div>

      {/* Public URL */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tu link público</p>
            <p className="text-slate-200 text-sm font-mono">{publicUrl}</p>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Ver →
          </a>
        </div>
      </div>

      <SettingsForm
        initialValues={{
          tagline:       org.tagline       ?? "",
          bio:           org.bio           ?? "",
          contact_email: org.contact_email ?? "",
          whatsapp:      org.whatsapp      ?? "",
          brand_color:   org.brand_color   ?? "#6366f1",
        }}
      />
    </div>
  )
}
