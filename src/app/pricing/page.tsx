import Link from "next/link"
import { PLANS, formatCOP } from "@/lib/plan/limits"

export const metadata = {
  title: "Precios — InteFin",
  description: "Empieza gratis. Crece sin límites con el plan Pro.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/80 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              IF
            </div>
            <span className="font-semibold text-sm">InteFin</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-slate-400 hover:text-slate-100 text-sm transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
          Precios simples,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            sin sorpresas
          </span>
        </h1>
        <p className="text-slate-400 text-lg">
          Empieza gratis. Crece sin límites cuando estés listo.
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* FREE */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 flex flex-col">
            <div>
              <div className="inline-block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Free
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black">{formatCOP(0)}</span>
                <span className="text-slate-500 text-sm">/mes</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Perfecto para empezar y validar tu práctica de coaching.
              </p>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/login"
              className="block text-center bg-slate-800 hover:bg-slate-700 transition-colors text-slate-100 font-medium py-3 rounded-xl text-sm"
            >
              Empezar gratis
            </Link>
          </div>

          {/* PRO */}
          <div className="relative bg-gradient-to-br from-indigo-950 to-[#0f172a] border-2 border-indigo-500 rounded-2xl p-8 flex flex-col shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Más popular
              </span>
            </div>

            <div>
              <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
                Pro
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black">{formatCOP(PLANS.pro.monthlyPriceCOP)}</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                Para coaches con práctica establecida y clientes ilimitados.
              </p>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                  <span className="text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/?text=Hola%2C%20quiero%20activar%20el%20plan%20Pro%20de%20InteFin"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium py-3 rounded-xl text-sm"
            >
              Activar Pro →
            </a>
            <p className="text-center text-slate-500 text-xs mt-3">
              Pago por WhatsApp · Activación en 24 h
            </p>
          </div>
        </div>

        {/* Enterprise note */}
        <div className="mt-8 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-center">
          <h3 className="text-slate-200 font-semibold mb-1">¿Eres un equipo de coaches?</h3>
          <p className="text-slate-400 text-sm mb-3">
            Plan Enterprise con múltiples coaches y branding personalizado.
          </p>
          <a
            href="mailto:hola@intefin.app?subject=Plan%20Enterprise"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Contáctanos →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {[
            {
              q: "¿Cómo pago el plan Pro?",
              a: "Por ahora, contáctanos por WhatsApp y te enviamos un link de pago vía PSE o Nequi. Estamos integrando pagos automáticos próximamente.",
            },
            {
              q: "¿Puedo cancelar cuando quiera?",
              a: "Sí, sin penalización. Tu plan Pro se mantiene activo hasta el fin del mes pagado y luego pasas a Free.",
            },
            {
              q: "¿Qué pasa con mis clientes si bajo a Free?",
              a: "Tus clientes y todos sus datos se mantienen. Solo no podrás invitar nuevos hasta que estés bajo el límite o vuelvas a Pro.",
            },
            {
              q: "¿Emiten factura?",
              a: "Sí, emitimos factura electrónica DIAN — pídela al contactarnos para el pago.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="bg-[#0f172a] border border-slate-800 rounded-xl group">
              <summary className="px-5 py-4 cursor-pointer text-slate-200 text-sm font-medium flex items-center justify-between">
                {q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600 text-xs">
            © 2026 · InteFin — Inteligencia Financiera
          </p>
        </div>
      </footer>
    </div>
  )
}
