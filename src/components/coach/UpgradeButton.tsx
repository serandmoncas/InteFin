"use client"

import { useTransition, useState } from "react"
import { startProCheckout } from "@/actions/billing"

export function UpgradeButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleClick() {
    setError("")
    startTransition(async () => {
      const res = await startProCheckout()
      if (res.error) {
        setError(res.error)
        return
      }
      if (res.url) {
        // Hand off to Wompi
        window.location.href = res.url
      }
    })
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={
          className ??
          "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        }
      >
        {isPending ? "Redirigiendo..." : "Mejorar a Pro →"}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </>
  )
}
