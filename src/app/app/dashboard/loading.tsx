export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Hero — patrimonio neto + score */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-slate-700 rounded" />
            <div className="h-10 w-48 bg-slate-700 rounded" />
            <div className="flex gap-4 mt-4">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-800 rounded" />
            </div>
          </div>
          {/* Score badge */}
          <div className="w-20 h-20 rounded-full bg-slate-700" />
        </div>
      </div>

      {/* 4 Account cards */}
      <div className="space-y-3">
        {["border-l-red-500", "border-l-orange-500", "border-l-violet-500", "border-l-emerald-500"].map((border, i) => (
          <div key={i} className={`bg-[#0f172a] border border-slate-800 border-l-4 ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 bg-slate-700 rounded" />
              <div className="h-3 w-16 bg-slate-700 rounded" />
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-slate-700 rounded-full" />
            </div>
            <div className="flex justify-between mt-1.5">
              <div className="h-2.5 w-12 bg-slate-800 rounded" />
              <div className="h-2.5 w-8 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Evolution chart */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div className="h-3 w-28 bg-slate-700 rounded mb-1" />
        <div className="h-2.5 w-44 bg-slate-800 rounded mb-6" />
        <div className="h-64 bg-slate-800 rounded-lg" />
      </div>
    </div>
  )
}
