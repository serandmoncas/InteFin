"use client"

import { useTransition } from "react"
import { markLeadContacted } from "@/actions/leads"

export function MarkContactedButton({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await markLeadContacted(leadId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-slate-500 hover:text-emerald-400 text-xs transition-colors whitespace-nowrap disabled:opacity-50"
    >
      {isPending ? "..." : "Marcar como contactado ✓"}
    </button>
  )
}
