"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/goals",     label: "Metas" },
  { href: "/app/sessions",  label: "Sesiones" },
]

export function ClientNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {NAV.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-indigo-600/20 text-indigo-300 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
