export default function ClientsLoading() {
  return (
    <div className="animate-pulse p-8">
      <div className="mb-6">
        <div className="h-7 w-28 bg-slate-700 rounded mb-2" />
        <div className="h-3 w-48 bg-slate-800 rounded" />
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800">
          {[40, 28, 20, 12].map((w, i) => (
            <div key={i} className={`h-2.5 w-${w} bg-slate-800 rounded`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-36 bg-slate-700 rounded" />
              <div className="h-2.5 w-24 bg-slate-800 rounded" />
            </div>
            <div className="h-5 w-16 bg-slate-800 rounded-full" />
            <div className="h-3 w-12 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
