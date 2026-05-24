import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/coach/SettingsForm"
import { UpgradeButton } from "@/components/coach/UpgradeButton"
import { PLANS, PLAN_LABELS, formatCOP } from "@/lib/plan/limits"
import { effectivePlan } from "@/lib/plan/expiration"

export default async function CoachSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const { payment: paymentRef } = await searchParams
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
    .select("name, slug, tagline, bio, contact_email, whatsapp, brand_color, plan, plan_expires_at")
    .eq("id", profile.organization_id)
    .single()

  if (!org) redirect("/onboarding")

  const { count: activeClientsCount } = await supabase
    .from("client_profiles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)
    .in("status", ["lead", "active"])

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
  const publicUrl  = `${siteOrigin}/${org.slug}`

  const plan         = effectivePlan(org.plan ?? "free", org.plan_expires_at)
  const planLimits   = PLANS[plan]
  const isPro        = plan === "pro" || plan === "enterprise"
  const expiresAt    = org.plan_expires_at && plan === "pro"
    ? new Date(org.plan_expires_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : null
  const current      = activeClientsCount ?? 0
  const limit        = planLimits.maxActiveClients
  const usagePct     = isPro ? 0 : Math.min(100, (current / limit) * 100)
  const nearLimit    = !isPro && current >= limit - 1

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Ajustes</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tu perfil público + plan de la organización.
        </p>
      </div>

      {/* Post-checkout banner */}
      {paymentRef && (
        <div className="bg-indigo-950/40 border border-indigo-700 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⏳</span>
          <div className="flex-1">
            <p className="text-indigo-200 text-sm font-semibold">Procesando tu pago</p>
            <p className="text-indigo-300/80 text-xs mt-0.5">
              Wompi nos confirmará en unos segundos. Si tu plan no se actualiza
              en 2 minutos, recarga esta página.
              {" "}
              <span className="font-mono text-indigo-400/60">{paymentRef}</span>
            </p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className={`rounded-xl p-5 mb-6 border ${isPro
        ? "bg-gradient-to-br from-indigo-950 to-[#0f172a] border-indigo-500/40"
        : "bg-[#0f172a] border-slate-800"
      }`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tu plan actual</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${isPro ? "text-indigo-300" : "text-slate-100"}`}>
                {PLAN_LABELS[plan]}
              </span>
              {plan === "pro" && <span className="text-2xl">⭐</span>}
            </div>
            <p className="text-slate-400 text-xs mt-1">
              {planLimits.monthlyPriceCOP > 0
                ? `${formatCOP(planLimits.monthlyPriceCOP)}/mes`
                : "Gratis"}
            </p>
            {expiresAt && (
              <p className="text-indigo-300/70 text-xs mt-1">
                Renueva el {expiresAt}
              </p>
            )}
          </div>
          {!isPro && <UpgradeButton />}
        </div>

        {/* Usage bar for Free */}
        {!isPro && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Clientes activos</span>
              <span className={nearLimit ? "text-amber-400 font-semibold" : "text-slate-300"}>
                {current} / {limit}
              </span>
            </div>
            <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usagePct}%`,
                  background: nearLimit ? "#fbbf24" : "#6366f1",
                }}
              />
            </div>
            {nearLimit && (
              <p className="text-amber-400 text-xs mt-2">
                ⚠️ Estás cerca del límite del plan Free.{" "}
                <Link href="/pricing" className="underline">Mejora a Pro</Link>
                {" "}para clientes ilimitados.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-1">Tu perfil público</h2>
        <p className="text-slate-400 text-sm">
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
