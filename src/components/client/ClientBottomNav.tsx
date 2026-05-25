"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/app/goals",     label: "Metas",     icon: "🎯" },
  { href: "/app/sessions",  label: "Sesiones",  icon: "📋" },
]

export function ClientBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:hidden bg-[#0f172a] border-t border-slate-800 z-40">
      <div className="grid grid-cols-3">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              {label}
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
