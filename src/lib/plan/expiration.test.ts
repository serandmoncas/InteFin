import { describe, it, expect } from "vitest"
import { effectivePlan, extendExpiration } from "./expiration"

const NOW = new Date("2026-06-15T12:00:00Z")

describe("effectivePlan", () => {
  it("Free is always Free regardless of expiration", () => {
    expect(effectivePlan("free", null,                NOW)).toBe("free")
    expect(effectivePlan("free", "2099-01-01T00:00:00Z", NOW)).toBe("free")
  })

  it("Enterprise is always Enterprise (managed manually)", () => {
    expect(effectivePlan("enterprise", null,             NOW)).toBe("enterprise")
    expect(effectivePlan("enterprise", "2020-01-01Z",    NOW)).toBe("enterprise")
  })

  it("Pro with future expiration → pro", () => {
    expect(effectivePlan("pro", "2026-07-15T12:00:00Z", NOW)).toBe("pro")
  })

  it("Pro with past expiration → free", () => {
    expect(effectivePlan("pro", "2026-05-15T12:00:00Z", NOW)).toBe("free")
  })

  it("Pro with null expiration → free (defensive)", () => {
    expect(effectivePlan("pro", null, NOW)).toBe("free")
  })

  it("Pro with exact-now expiration → free (boundary: expired the instant the timer hits)", () => {
    expect(effectivePlan("pro", NOW.toISOString(), NOW)).toBe("free")
  })
})

describe("extendExpiration", () => {
  it("starts from now() when no current expiration", () => {
    const result = extendExpiration(null, 1, NOW)
    expect(result.toISOString()).toBe("2026-07-15T12:00:00.000Z")
  })

  it("starts from now() when current expiration is in the past", () => {
    const result = extendExpiration("2026-05-01T00:00:00Z", 1, NOW)
    expect(result.toISOString()).toBe("2026-07-15T12:00:00.000Z")
  })

  it("extends from existing expiration when still valid (don't lose unused days)", () => {
    const result = extendExpiration("2026-07-01T00:00:00Z", 1, NOW)
    expect(result.toISOString()).toBe("2026-08-01T00:00:00.000Z")
  })

  it("supports multi-month extensions", () => {
    const result = extendExpiration(null, 3, NOW)
    expect(result.toISOString()).toBe("2026-09-15T12:00:00.000Z")
  })
})
