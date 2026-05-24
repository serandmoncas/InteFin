import { createHash } from "node:crypto"

/**
 * Wompi sends webhook events with a signature for verification.
 * Docs: https://docs.wompi.co/docs/colombia/eventos/
 *
 * The signature is SHA-256 of:
 *   <concatenated property values, in the order listed> + <timestamp> + <events_secret>
 *
 * Example: properties = ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
 *   payload = "01-1567884444-21344" + "APPROVED" + "4490000" + "1545341611" + "<secret>"
 */

export interface WompiTransaction {
  id: string
  reference: string
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING"
  amount_in_cents: number
  currency: string
  payment_method_type?: string
}

export interface WompiEvent {
  event: string                              // "transaction.updated"
  data: { transaction: WompiTransaction }
  sent_at: string
  timestamp: number
  signature: {
    properties: string[]
    checksum: string
  }
}

/**
 * Resolves a dot-path like "transaction.amount_in_cents" against the event data.
 */
function getValue(data: unknown, path: string): string {
  const parts = path.split(".")
  let cursor: unknown = data
  for (const p of parts) {
    if (cursor && typeof cursor === "object" && p in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[p]
    } else {
      return ""
    }
  }
  return cursor == null ? "" : String(cursor)
}

/**
 * Computes the checksum that Wompi sent us. Pure function — no side effects.
 */
export function computeEventChecksum(event: WompiEvent, eventsSecret: string): string {
  const valuesConcat = event.signature.properties
    .map((path) => getValue(event.data, path))
    .join("")
  const payload = `${valuesConcat}${event.timestamp}${eventsSecret}`
  return createHash("sha256").update(payload).digest("hex")
}

/**
 * Verifies an incoming Wompi webhook. Returns true if signature matches.
 */
export function verifyEventSignature(event: WompiEvent, eventsSecret: string): boolean {
  const expected = computeEventChecksum(event, eventsSecret)
  return expected.toLowerCase() === event.signature.checksum.toLowerCase()
}
