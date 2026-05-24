import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QuizFlow } from "@/components/quiz/QuizFlow"
import Link from "next/link"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

const RESERVED = new Set([
  "auth", "app", "coach", "admin", "onboarding", "api", "_next", "static",
])

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("slug", slug)
    .maybeSingle()
  return {
    title: `Test de salud financiera · ${org?.name ?? "Coach"}`,
    description: "10 preguntas, 3 minutos. Descubre tu score de salud financiera.",
  }
}

export default async function PublicQuizPage({ params }: PageProps) {
  const { slug } = await params
  if (RESERVED.has(slug)) notFound()

  const supabase = await createClient()

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, brand_color, contact_email, whatsapp")
    .eq("slug", slug)
    .maybeSingle()

  if (!org) notFound()

  const { data: coach } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("organization_id", org.id)
    .eq("role", "coach")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Mini nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/80 border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            ← {org.name}
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-xs"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
              IF
            </div>
            InteFin
          </Link>
        </div>
      </nav>

      <QuizFlow
        organizationId={org.id}
        coachName={coach?.full_name ?? org.name}
        brandColor={org.brand_color ?? "#6366f1"}
        contactEmail={org.contact_email}
        whatsapp={org.whatsapp}
      />
    </div>
  )
}
