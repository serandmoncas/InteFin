"use client"

import { useState, useMemo, useTransition } from "react"
import { QUESTIONS } from "@/lib/quiz/questions"
import { computeQuizResult, VERDICT_COPY, CATEGORY_LABELS, type QuizAnswer } from "@/lib/quiz/score"
import { submitQuizResult } from "@/actions/quiz"

type Stage = "intro" | "questions" | "result" | "lead"

interface QuizFlowProps {
  organizationId: string
  coachName:      string
  brandColor:     string
  contactEmail:   string | null
  whatsapp:       string | null
}

export function QuizFlow({ organizationId, coachName, brandColor, contactEmail, whatsapp }: QuizFlowProps) {
  const [stage, setStage]     = useState<Stage>("intro")
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])

  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [phone, setPhone]     = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError]     = useState("")
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(
    () => (answers.length === QUESTIONS.length ? computeQuizResult(answers) : null),
    [answers]
  )

  function answer(value: string, points: number) {
    const newAnswers = [...answers, { questionId: QUESTIONS[step].id, value, points }]
    setAnswers(newAnswers)
    if (step + 1 < QUESTIONS.length) {
      setStep((s) => s + 1)
    } else {
      setStage("result")
    }
  }

  function goBack() {
    if (step === 0) {
      setStage("intro")
    } else {
      setStep((s) => s - 1)
      setAnswers((a) => a.slice(0, -1))
    }
  }

  function submitLead() {
    if (!result) return
    setError("")
    startTransition(async () => {
      const res = await submitQuizResult({
        organizationId,
        score:    result.total,
        answers,
        visitorName:     name,
        visitorEmail:    email,
        visitorWhatsapp: phone,
      })
      if (res.error) { setError(res.error); return }
      setSubmitted(true)
    })
  }

  // ── INTRO ─────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{ background: `${brandColor}20`, color: brandColor }}>
          <span className="text-3xl">📊</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
          Test gratuito de salud financiera
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          10 preguntas. 3 minutos. Descubre dónde estás y qué áreas necesitas trabajar.
        </p>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 mb-6 text-left">
          <p className="text-slate-300 text-sm mb-4 font-semibold">¿Qué vas a descubrir?</p>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              "Tu score de salud financiera (0–100)",
              "En qué área estás más fuerte y en cuál más débil",
              "Si tu base está lista para empezar a invertir",
              "Próximos pasos según el método de las 4 cuentas",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span style={{ color: brandColor }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setStage("questions")}
          className="w-full sm:w-auto text-white font-medium px-8 py-3 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: brandColor }}
        >
          Empezar el test →
        </button>
        <p className="text-slate-600 text-xs mt-3">Es 100% gratis. No necesitas crear cuenta.</p>
      </div>
    )
  }

  // ── QUESTIONS ─────────────────────────────────────────────
  if (stage === "questions") {
    const q = QUESTIONS[step]
    const progress = ((step + 1) / QUESTIONS.length) * 100
    const isLikert = q.options.length > 5

    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
            <span>Pregunta {step + 1} de {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: brandColor }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2 leading-snug">
          {q.title}
        </h2>
        {q.subtitle && <p className="text-slate-400 text-sm mb-8 leading-relaxed">{q.subtitle}</p>}
        {!q.subtitle && <div className="mb-8" />}

        {/* Options */}
        <div className={isLikert ? "grid grid-cols-5 gap-2" : "flex flex-col gap-2"}>
          {q.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => answer(opt.value, opt.points)}
              className={`bg-[#0f172a] border border-slate-800 hover:border-slate-600 rounded-xl text-slate-200 transition-all ${
                isLikert
                  ? "py-4 text-sm font-semibold hover:bg-slate-800/80"
                  : "px-5 py-4 text-left text-sm hover:bg-slate-800/40 flex items-center justify-between group"
              }`}
              style={{ borderColor: undefined }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = brandColor)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
            >
              {isLikert ? opt.value : (
                <>
                  <span>{opt.label}</span>
                  <span className="text-slate-600 group-hover:text-slate-300 transition-colors">→</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={goBack}
          className="mt-8 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Atrás
        </button>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────
  if (stage === "result" && result) {
    const verdict = VERDICT_COPY[result.verdict]

    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Score reveal */}
        <div className="text-center mb-8">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
            Tu score de salud financiera
          </p>
          <div className="relative inline-block">
            <div
              className="text-7xl sm:text-8xl font-black tracking-tighter mb-2"
              style={{ color: verdict.tone }}
            >
              {result.total}
              <span className="text-3xl text-slate-600">/100</span>
            </div>
          </div>
          <p className="text-xl font-semibold text-slate-200 mt-4 max-w-md mx-auto">
            {verdict.title}
          </p>
        </div>

        {/* Category breakdown (blurred — partial reveal) */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
          <p className="text-slate-300 text-sm font-semibold mb-4">Detalle por área</p>
          <div className="space-y-3">
            {result.byCategory.map((cat, i) => {
              const blurred = i >= 2 // first 2 visible, rest blurred
              return (
                <div
                  key={cat.category}
                  className={`flex items-center gap-3 ${blurred ? "select-none" : ""}`}
                  style={blurred ? { filter: "blur(4px)" } : undefined}
                >
                  <span className="text-xs text-slate-400 w-40 shrink-0">
                    {CATEGORY_LABELS[cat.category]}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.pct}%`, background: brandColor }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">{cat.pct}%</span>
                </div>
              )
            })}
          </div>

          {/* Blur overlay CTA */}
          <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
            <span
              className="inline-block bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-300"
              style={{ borderColor: brandColor }}
            >
              🔒 Resto del análisis disponible con {coachName.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* CTA to lead */}
        <div
          className="rounded-2xl p-6 border text-center"
          style={{
            background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)`,
            borderColor: `${brandColor}40`,
          }}
        >
          <h3 className="text-lg font-bold mb-2">Recibe tu análisis completo</h3>
          <p className="text-slate-300 text-sm mb-5">
            {coachName} revisará tus respuestas y te dará un plan personalizado.
          </p>
          <button
            onClick={() => setStage("lead")}
            className="w-full text-white font-medium px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: brandColor }}
          >
            Quiero mi análisis completo →
          </button>
        </div>
      </div>
    )
  }

  // ── LEAD CAPTURE / SUBMITTED ─────────────────────────────
  if (stage === "lead") {
    if (submitted) {
      return (
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-3">¡Listo!</h2>
          <p className="text-slate-300 mb-6">
            {coachName} recibirá tus resultados y se pondrá en contacto contigo.
          </p>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hola ${coachName.split(" ")[0]}, acabo de hacer el test gratuito y obtuve ${result?.total ?? 0}/100. Me interesa el análisis completo.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm"
            >
              💬 Escribir ahora por WhatsApp
            </a>
          )}

          <p className="text-slate-600 text-xs mt-6">
            Mientras tanto, puedes cerrar esta página.
          </p>
        </div>
      )
    }

    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-2">¿Cómo te contactamos?</h2>
        <p className="text-slate-400 text-sm mb-6">
          Solo necesitamos un dato — el que prefieras.
        </p>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              WhatsApp <span className="text-slate-500">(opcional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={submitLead}
            disabled={isPending || (!email && !phone)}
            className="w-full text-white font-medium px-5 py-3 rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: brandColor }}
          >
            {isPending ? "Enviando..." : "Enviar mis resultados →"}
          </button>
          <p className="text-slate-600 text-xs text-center">
            Tu información solo la recibe {coachName.split(" ")[0]}.
          </p>
        </div>

        {/* Inline note: at least one contact method needed */}
        <p className="text-slate-500 text-xs mt-3 text-center">
          {(!email && !phone) && "Necesitamos email o WhatsApp para contactarte."}
          {(email || phone) && <>&nbsp;</>}
        </p>

        {/* Direct contact options as backup */}
        {(contactEmail || whatsapp) && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs mb-3">¿Prefieres contactar directo?</p>
            <div className="flex justify-center gap-2">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
                >
                  💬 WhatsApp
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  ✉️ {contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
