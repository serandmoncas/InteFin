import { describe, it, expect } from "vitest"
import { createHash } from "node:crypto"
import { computeEventChecksum, verifyEventSignature, type WompiEvent } from "./webhook"

function makeEvent(
  overrides: Partial<WompiEvent> = {},
  txOverrides: Partial<WompiEvent["data"]["transaction"]> = {},
): WompiEvent {
  return {
    event: "transaction.updated",
    sent_at: "2026-05-24T00:00:00.000Z",
    timestamp: 1748000000,
    data: {
      transaction: {
        id: "01-9999999999-12345",
        reference: "intefin_abc12345_1748000000000",
        status: "APPROVED",
        amount_in_cents: 5_000_000,
        currency: "COP",
        payment_method_type: "CARD",
        ...txOverrides,
      },
    },
    signature: {
      properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
      checksum: "placeholder",
    },
    ...overrides,
  }
}

function signEvent(event: WompiEvent, secret: string): WompiEvent {
  // Helper: compute the correct checksum and inject it
  const concat = event.signature.properties.map((p) => {
    const [_, field] = p.split(".")
    return String((event.data.transaction as unknown as Record<string, unknown>)[field])
  }).join("")
  const checksum = createHash("sha256")
    .update(`${concat}${event.timestamp}${secret}`)
    .digest("hex")
  return { ...event, signature: { ...event.signature, checksum } }
}

describe("computeEventChecksum", () => {
  it("concatenates property values + timestamp + secret in order", () => {
    const event = makeEvent()
    const checksum = computeEventChecksum(event, "secret")
    // payload = "01-9999999999-12345" + "APPROVED" + "5000000" + "1748000000" + "secret"
    const expected = createHash("sha256")
      .update("01-9999999999-12345APPROVED5000000" + "1748000000" + "secret")
      .digest("hex")
    expect(checksum).toBe(expected)
  })

  it("returns a 64-char hex string", () => {
    const checksum = computeEventChecksum(makeEvent(), "secret")
    expect(checksum).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe("verifyEventSignature", () => {
  it("returns true when checksum matches", () => {
    const signed = signEvent(makeEvent(), "secret")
    expect(verifyEventSignature(signed, "secret")).toBe(true)
  })

  it("returns false when secret is wrong", () => {
    const signed = signEvent(makeEvent(), "secret")
    expect(verifyEventSignature(signed, "different_secret")).toBe(false)
  })

  it("returns false when an attacker tampered with the amount", () => {
    const signed   = signEvent(makeEvent(), "secret")
    const tampered = {
      ...signed,
      data: {
        transaction: { ...signed.data.transaction, amount_in_cents: 999_999_999 },
      },
    }
    expect(verifyEventSignature(tampered, "secret")).toBe(false)
  })

  it("returns false when status was changed from DECLINED to APPROVED", () => {
    const signed = signEvent(makeEvent({}, { status: "DECLINED" }), "secret")
    const tampered = {
      ...signed,
      data: { transaction: { ...signed.data.transaction, status: "APPROVED" as const } },
    }
    expect(verifyEventSignature(tampered, "secret")).toBe(false)
  })

  it("is case-insensitive on the checksum (defensive)", () => {
    const signed = signEvent(makeEvent(), "secret")
    const upper = { ...signed, signature: { ...signed.signature, checksum: signed.signature.checksum.toUpperCase() } }
    expect(verifyEventSignature(upper, "secret")).toBe(true)
  })
})
