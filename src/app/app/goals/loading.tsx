export default function GoalsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-28 bg-slate-700 rounded mb-2" />
        <div className="h-3 w-48 bg-slate-800 rounded" />
      </div>

      <div className="space-y-6">
        {["En curso", "Pendientes"].map((section) => (
          <div key={section}>
            <div className="h-2.5 w-20 bg-slate-800 rounded mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 border-l-4 border-l-slate-600 rounded-xl p-4">
                  <div className="h-3.5 w-48 bg-slate-700 rounded mb-2" />
                  <div className="h-2.5 w-64 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
