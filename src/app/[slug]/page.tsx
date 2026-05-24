import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from("organizations")
    .select("name, tagline")
    .eq("slug", slug)
    .maybeSingle()
  if (!org) return { title: "Coach no encontrado" }
  return {
    title: `${org.name} — Coach Financiero`,
    description: org.tagline ?? "Coach financiero · Método de las 4 cuentas",
    openGraph: {
      title: org.name,
      description: org.tagline ?? "Coach financiero",
      type: "profile",
    },
  }
}

// ── Reserved slugs that shouldn't reach this page ──
const RESERVED = new Set([
  "auth", "app", "coach", "admin", "onboarding", "api", "_next", "static",
])

export default async function PublicCoachPage({ params }: PageProps) {
  const { slug } = await params
  if (RESERVED.has(slug)) notFound()

  const supabase = await createClient()

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, brand_color, tagline, bio, contact_email, whatsapp")
    .eq("slug", slug)
    .maybeSingle()

  if (!org) notFound()

  // Get the coach (org founder)
  const { data: coach } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("organization_id", org.id)
    .eq("role", "coach")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  const coachName = coach?.full_name ?? org.name
  const accent    = org.brand_color ?? "#6366f1"
  const initials  = coachName
    .split(" ").slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()

  // WhatsApp deeplink (strip non-digits)
  const whatsappNumber = org.whatsapp?.replace(/\D/g, "")
  const waMessage = encodeURIComponent(
    `Hola ${coachName.split(" ")[0]}, vi tu perfil en InteFin y quiero agendar una sesión de diagnóstico financiero.`
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Mini nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/80 border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              IF
            </div>
            InteFin
          </Link>
          <Link
            href="/auth/login"
            className="text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[100px] rounded-full opacity-30"
            style={{ background: accent }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Avatar */}
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo_url} alt={coachName} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            {coachName}
          </h1>

          {org.tagline ? (
            <p className="text-lg text-slate-300 mb-2">{org.tagline}</p>
          ) : (
            <p className="text-lg text-slate-400 mb-2">Coach financiero</p>
          )}

          <p className="text-slate-500 text-sm mb-6">{org.name}</p>

          {/* Free test CTA — primary action */}
          <Link
            href={`/${slug}/test`}
            className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-xl transition-opacity hover:opacity-90 text-sm"
            style={{ background: accent }}
          >
            📊 Hacer mi test gratuito (3 min)
          </Link>
        </div>
      </section>

      {/* About */}
      {org.bio && (
        <section className="px-6 mb-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Sobre mí
              </p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{org.bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* Method — 4 accounts */}
      <section className="px-6 mb-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Mi método
            </p>
            <h2 className="text-xl font-bold mb-5">Las 4 cuentas para una vida financiera sana</h2>

            <div className="space-y-3">
              {[
                { emoji: "🛡", label: "Imprevisto",  color: "#f87171", desc: "Fondo de emergencia equivalente a 1 mes de salario." },
                { emoji: "💨", label: "Oxígeno",     color: "#fb923c", desc: "Reserva de 6 meses para sostener tu vida si pierdes tu fuente de ingreso." },
                { emoji: "🏦", label: "Retiro",      color: "#a78bfa", desc: "Seguro de vida y protección a largo plazo." },
                { emoji: "📈", label: "Inversiones", color: "#34d399", desc: "Crecimiento de capital — se activa cuando tienes tu base sólida." },
              ].map((acc) => (
                <div key={acc.label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base"
                    style={{ background: `${acc.color}20`, color: acc.color }}
                  >
                    {acc.emoji}
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-semibold" style={{ color: acc.color }}>
                      {acc.label}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{acc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 mb-16">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-7 border text-center"
            style={{
              background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
              borderColor: `${accent}40`,
            }}
          >
            <h2 className="text-2xl font-bold mb-2">¿Listo para empezar?</h2>
            <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
              Agenda una sesión de diagnóstico y conoce el estado real de tus finanzas.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  💬 Escribir por WhatsApp
                </a>
              )}
              {org.contact_email && (
                <a
                  href={`mailto:${org.contact_email}?subject=Diagn%C3%B3stico%20financiero`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-5 py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-slate-700"
                >
                  ✉️ Enviar correo
                </a>
              )}
              {!whatsappNumber && !org.contact_email && (
                <p className="text-slate-500 text-sm italic">
                  Datos de contacto pendientes — pídele al coach que actualice su perfil.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-600 text-xs">
            Página creada con{" "}
            <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors">
              InteFin
            </Link>
            {" "}· Inteligencia Financiera
          </p>
        </div>
      </footer>
    </div>
  )
}
