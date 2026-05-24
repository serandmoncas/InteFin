"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const NAV = [
  { href: "/coach/overview",  label: "Resumen",   icon: "🏠" },
  { href: "/coach/clients",   label: "Clientes",  icon: "👥" },
  { href: "/coach/leads",     label: "Leads",     icon: "🎯" },
  { href: "/coach/invite",    label: "Invitar",   icon: "✉️" },
  { href: "/coach/settings",  label: "Ajustes",   icon: "⚙️" },
]

interface SidebarProps {
  coachName: string
  orgName: string
  orgSlug: string
}

export function Sidebar({ coachName, orgName, orgSlug }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-[#0f172a] border-r border-slate-800 flex flex-col">
      {/* Logo + org */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            IF
          </div>
          <span className="text-slate-100 font-semibold text-sm truncate">InteFin</span>
        </div>
        <div className="bg-slate-800 rounded-lg px-3 py-2">
          <p className="text-slate-300 text-xs font-medium truncate">{orgName}</p>
          <p className="text-slate-500 text-xs truncate">/{orgSlug}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {coachName?.[0]?.toUpperCase() ?? "C"}
          </div>
          <span className="text-slate-300 text-xs truncate">{coachName}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
