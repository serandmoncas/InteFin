import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/80 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              IF
            </div>
            <span className="font-semibold text-sm">InteFin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-slate-400 hover:text-slate-100 text-sm transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium">
              Para coaches financieros y sus clientes
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto mb-6">
            Convierte tus{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Excel financieros
            </span>{" "}
            en una experiencia que tus clientes aman.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            InteFin es la plataforma que organiza tu práctica de coaching financiero.
            Diagnósticos, dashboards y seguimiento mensual — todo en un solo lugar.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16">
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Empezar gratis →
            </Link>
            <a
              href="#metodo"
              className="text-slate-400 hover:text-slate-200 px-4 py-3 rounded-xl text-sm transition-colors"
            >
              Cómo funciona
            </a>
          </div>

          {/* Hero mockup */}
          <HeroMockup />
        </div>
      </section>

      {/* Problem section */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
            El problema
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
            Tu cliente sigue mirando un{" "}
            <span className="text-red-400 line-through decoration-2">Excel aburrido</span>
            <br />
            cuando debería ver su evolución
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Como coach, tu método transforma vidas. Pero los Excel sueltos rompen la experiencia,
            te hacen perder horas entre sesiones y dejan al cliente sin claridad de su progreso.
          </p>
        </div>
      </section>

      {/* The Method — 4 accounts */}
      <section id="metodo" className="py-24 px-6 border-t border-slate-800/50 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
              El método
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Las 4 cuentas para una vida financiera sana
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Una metodología clara que tus clientes entienden a la primera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCOUNTS.map(({ key, ...rest }) => (
              <AccountFeature key={key} {...rest} />
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
              Diseñado para ambos lados
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Una plataforma, dos experiencias
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AudienceCard
              tag="Para coaches"
              tagColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
              title="Tu práctica, organizada"
              bullets={[
                "Diagnóstico digital antes de cada sesión",
                "Vista unificada de todos tus clientes",
                "Invitación por email en 30 segundos",
                "Progreso mensual sin spreadsheets",
              ]}
              cta="Empezar como coach"
            />
            <AudienceCard
              tag="Para clientes"
              tagColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
              title="Tu evolución, visible"
              bullets={[
                "Dashboard con tus 4 cuentas siempre a mano",
                "Score de salud financiera (0–100)",
                "Patrimonio neto en tiempo real",
                "Próximos hitos y metas claras",
              ]}
              cta="Pide a tu coach que te invite"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
              En 3 pasos
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Tu primera sesión, sin fricción
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Step key={i} number={i + 1} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Empieza con tu próximo cliente
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Crea tu organización en 1 minuto. Sin tarjeta de crédito. Sin compromisos.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-base"
          >
            Crear mi cuenta gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              IF
            </div>
            <span className="text-slate-500 text-sm">
              InteFin · Inteligencia Financiera
            </span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 · Hecho con propósito
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Account showcase ───────────────────────────────────────

const ACCOUNTS = [
  {
    key: "imprevisto",
    label: "Imprevisto",
    emoji: "🛡",
    color: "#f87171",
    bg: "#450a0a",
    desc: "Fondo de emergencia",
    target: "1× tu salario mensual",
    priority: "Prioridad 1",
  },
  {
    key: "oxigeno",
    label: "Oxígeno",
    emoji: "💨",
    color: "#fb923c",
    bg: "#431407",
    desc: "Sustento sin trabajo",
    target: "6× tu salario mensual",
    priority: "Prioridad 2",
  },
  {
    key: "retiro",
    label: "Retiro",
    emoji: "🏦",
    color: "#a78bfa",
    bg: "#2e1065",
    desc: "Protección a largo plazo",
    target: "Seguro de vida activo",
    priority: "Activa siempre",
  },
  {
    key: "inversiones",
    label: "Inversiones",
    emoji: "📈",
    color: "#34d399",
    bg: "#052e16",
    desc: "Crecimiento de capital",
    target: "Definido contigo",
    priority: "Cuando tengas base",
  },
] as const

interface AccountFeatureProps {
  label: string
  emoji: string
  color: string
  bg: string
  desc: string
  target: string
  priority: string
}

function AccountFeature({ label, emoji, color, bg, desc, target, priority }: AccountFeatureProps) {
  return (
    <div
      className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
      style={{ borderLeftWidth: "4px", borderLeftColor: color }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: bg }}
        >
          {emoji}
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <p className="text-slate-200 text-sm font-semibold mb-1">{desc}</p>
      <p className="text-slate-500 text-xs mb-4">{target}</p>
      <div
        className="text-[10px] font-bold uppercase tracking-wider inline-block px-2 py-0.5 rounded-md"
        style={{ background: bg, color }}
      >
        {priority}
      </div>
    </div>
  )
}

// ── Audience card ──────────────────────────────────────────

interface AudienceCardProps {
  tag: string
  tagColor: string
  title: string
  bullets: string[]
  cta: string
}

function AudienceCard({ tag, tagColor, title, bullets, cta }: AudienceCardProps) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-colors">
      <div className={`inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${tagColor} mb-4`}>
        {tag}
      </div>
      <h3 className="text-2xl font-bold mb-5">{title}</h3>
      <ul className="space-y-2.5 mb-6">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
            <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="text-slate-500 text-xs">{cta}</p>
    </div>
  )
}

// ── How it works steps ─────────────────────────────────────

const STEPS = [
  {
    title: "Invita a tu cliente",
    desc: "Mandas un email desde InteFin. Tu cliente recibe un link mágico, sin contraseñas.",
  },
  {
    title: "Completa el diagnóstico",
    desc: "Tu cliente responde un cuestionario guiado de 4 secciones — antes de la sesión.",
  },
  {
    title: "Lleguen a la sesión con datos",
    desc: "Tú ya tienes su radiografía financiera. Él ya tiene su dashboard listo.",
  },
]

interface StepProps {
  number: number
  title: string
  desc: string
}

function Step({ number, title, desc }: StepProps) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative">
      <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center">
        {number}
      </div>
      <h3 className="text-lg font-bold mt-2 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Hero mockup (visual) ───────────────────────────────────

function HeroMockup() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {/* Subtle glow under the mockup */}
        <div className="absolute inset-x-8 -bottom-4 h-12 bg-indigo-500/30 blur-2xl rounded-full" />

        <div className="relative bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Window header */}
          <div className="bg-[#1e293b] px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-500 text-xs ml-3">intefin.app/app/dashboard</span>
          </div>

          {/* Mockup body */}
          <div className="p-6">
            {/* Hero net worth */}
            <div
              className="rounded-xl p-5 mb-5 border border-slate-800"
              style={{ background: "linear-gradient(160deg,#1a1f3c 0%,#0f172a 60%)" }}
            >
              <div className="flex items-start justify-between text-left">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">
                    Patrimonio Neto
                  </p>
                  <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
                    $48.250.000
                  </p>
                  <p className="text-emerald-400 text-xs mt-1">↑ +12% este trimestre</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500 flex flex-col items-center justify-center bg-indigo-500/10">
                  <span className="font-black text-base leading-none text-indigo-300">68</span>
                  <span className="text-indigo-500 text-[8px]">/100</span>
                </div>
              </div>
            </div>

            {/* Account rows */}
            <div className="space-y-2.5 text-left">
              {[
                { label: "Imprevisto",  color: "#f87171", bg: "#450a0a", progress: 100 },
                { label: "Oxígeno",     color: "#fb923c", bg: "#431407", progress: 67 },
                { label: "Retiro",      color: "#a78bfa", bg: "#2e1065", progress: 100 },
                { label: "Inversiones", color: "#34d399", bg: "#052e16", progress: 22 },
              ].map((r) => (
                <div
                  key={r.label}
                  className="bg-[#1e293b] rounded-lg p-3 border-l-2"
                  style={{ borderLeftColor: r.color }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: r.bg, color: r.color }}
                    >
                      {r.label}
                    </span>
                    <span className="text-slate-300 text-xs font-bold" style={{ color: r.color }}>
                      {r.progress}%
                    </span>
                  </div>
                  <div className="bg-[#0f172a] rounded-full h-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${r.progress}%`, background: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
