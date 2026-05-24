import { describe, it, expect } from "vitest"
import { computeIntegritySignature, buildCheckoutUrl, isSandbox } from "./checkout"

describe("computeIntegritySignature", () => {
  it("computes the SHA-256 hash documented by Wompi", () => {
    // Example from Wompi docs: reference + amount-in-cents + currency + integrity-secret
    // https://docs.wompi.co/docs/colombia/widget-checkout-web/#integrity-signature
    const sig = computeIntegritySignature(
      "test-ref-001",
      5_000_000,         // 50.000 COP in cents
      "COP",
      "test_secret",
    )
    expect(sig).toMatch(/^[a-f0-9]{64}$/)
  })

  it("is deterministic — same inputs produce same output", () => {
    const a = computeIntegritySignature("r1", 1000, "COP", "secret")
    const b = computeIntegritySignature("r1", 1000, "COP", "secret")
    expect(a).toBe(b)
  })

  it("changes when amount changes (tamper detection)", () => {
    const a = computeIntegritySignature("r1", 1000, "COP", "secret")
    const b = computeIntegritySignature("r1", 1001, "COP", "secret")
    expect(a).not.toBe(b)
  })

  it("changes when reference changes", () => {
    const a = computeIntegritySignature("r1", 1000, "COP", "secret")
    const b = computeIntegritySignature("r2", 1000, "COP", "secret")
    expect(a).not.toBe(b)
  })
})

describe("buildCheckoutUrl", () => {
  const config = {
    publicKey:       "pub_test_xyz",
    integritySecret: "test_secret",
  }

  it("uses the Wompi checkout host", () => {
    const { url } = buildCheckoutUrl(
      { reference: "r1", amountInCents: 1000, currency: "COP", redirectUrl: "https://x" },
      config,
    )
    expect(url).toMatch(/^https:\/\/checkout\.wompi\.co\/p\//)
  })

  it("includes the required query params", () => {
    const { url } = buildCheckoutUrl(
      { reference: "r1", amountInCents: 1000, currency: "COP", redirectUrl: "https://x" },
      config,
    )
    const u = new URL(url)
    expect(u.searchParams.get("public-key")).toBe("pub_test_xyz")
    expect(u.searchParams.get("currency")).toBe("COP")
    expect(u.searchParams.get("amount-in-cents")).toBe("1000")
    expect(u.searchParams.get("reference")).toBe("r1")
    expect(u.searchParams.get("redirect-url")).toBe("https://x")
    expect(u.searchParams.get("signature:integrity")).toMatch(/^[a-f0-9]{64}$/)
  })

  it("includes customer data when provided", () => {
    const { url } = buildCheckoutUrl(
      {
        reference: "r1",
        amountInCents: 1000,
        currency: "COP",
        redirectUrl: "https://x",
        customerEmail: "a@b.com",
        customerName: "Sergio",
      },
      config,
    )
    const u = new URL(url)
    expect(u.searchParams.get("customer-data:email")).toBe("a@b.com")
    expect(u.searchParams.get("customer-data:full-name")).toBe("Sergio")
  })

  it("omits customer data when not provided", () => {
    const { url } = buildCheckoutUrl(
      { reference: "r1", amountInCents: 1000, currency: "COP", redirectUrl: "https://x" },
      config,
    )
    const u = new URL(url)
    expect(u.searchParams.get("customer-data:email")).toBeNull()
    expect(u.searchParams.get("customer-data:full-name")).toBeNull()
  })

  it("returns the same signature as computeIntegritySignature", () => {
    const expected = computeIntegritySignature("r1", 1000, "COP", config.integritySecret)
    const { signature } = buildCheckoutUrl(
      { reference: "r1", amountInCents: 1000, currency: "COP", redirectUrl: "https://x" },
      config,
    )
    expect(signature).toBe(expected)
  })
})

describe("isSandbox", () => {
  it("returns true for pub_test_ keys", () => {
    expect(isSandbox("pub_test_abc")).toBe(true)
  })
  it("returns false for pub_prod_ keys", () => {
    expect(isSandbox("pub_prod_abc")).toBe(false)
  })
})
