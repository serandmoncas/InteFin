export default function OverviewLoading() {
  return (
    <div className="animate-pulse p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="h-7 w-40 bg-slate-700 rounded mb-2" />
        <div className="h-3 w-56 bg-slate-800 rounded" />
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <div className="h-3 w-20 bg-slate-700 rounded mb-3" />
            <div className="h-8 w-12 bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div>
        <div className="h-4 w-36 bg-slate-700 rounded mb-4" />
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 last:border-0">
              <div className="w-9 h-9 rounded-full bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-slate-700 rounded" />
                <div className="h-2.5 w-20 bg-slate-800 rounded" />
              </div>
              <div className="h-3 w-12 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
