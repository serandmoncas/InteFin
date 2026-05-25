import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
          <span className="text-white font-bold text-xl">IF</span>
        </div>

        <p className="text-indigo-400 font-mono text-sm font-semibold mb-3">404</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">
          Página no encontrada
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          La página que buscas no existe o fue movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app/dashboard"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/coach/overview"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors border border-slate-700"
          >
            Panel del coach
          </Link>
        </div>
      </div>
    </div>
  )
}
