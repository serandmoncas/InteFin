interface ScoreBadgeProps {
  score: number
}

const scoreColor = (s: number) =>
  s >= 70 ? "#34d399" : s >= 40 ? "#fbbf24" : "#f87171"

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const color = scoreColor(score)
  return (
    <div
      className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-2"
      style={{ borderColor: color, background: `${color}18` }}
    >
      <span className="font-black text-lg leading-none" style={{ color }}>
        {score}
      </span>
      <span className="text-slate-500 text-[9px] leading-none">/100</span>
    </div>
  )
}
