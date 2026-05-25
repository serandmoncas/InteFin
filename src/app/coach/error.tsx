"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[/coach error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-slate-100 mb-2">
          Algo salió mal
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al panel.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/coach/overview"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors border border-slate-700"
          >
            Volver al panel
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-slate-600 text-xs font-mono">
            ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
