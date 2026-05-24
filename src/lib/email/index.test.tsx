import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("./send", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}))

import {
  sendClientInviteEmail,
  sendCoachWelcomeEmail,
  sendPlanUpgradeEmail,
} from "./index"
import { sendEmail } from "./send"

const mockSendEmail = vi.mocked(sendEmail)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("sendClientInviteEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendClientInviteEmail({
      clientEmail: "client@example.com",
      clientName: "Ana García",
      coachName: "Mabel Álvarez",
      orgName: "Finanzas con Mabel",
      inviteLink: "https://intefin.app/invite/abc",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("client@example.com")
    expect(call.subject).toContain("Mabel Álvarez")
    expect(call.text).toContain("Ana García")
    expect(call.text).toContain("https://intefin.app/invite/abc")
  })
})

describe("sendCoachWelcomeEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendCoachWelcomeEmail({
      coachEmail: "coach@example.com",
      coachName: "Mabel Álvarez",
      orgName: "Finanzas con Mabel",
      siteUrl: "https://intefin.vercel.app",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("coach@example.com")
    expect(call.subject).toContain("Mabel Álvarez")
    expect(call.text).toContain("Finanzas con Mabel")
  })
})

describe("sendPlanUpgradeEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendPlanUpgradeEmail({
      coachEmail: "coach@example.com",
      coachName: "Mabel Álvarez",
      planExpiresAt: "2026-06-24T00:00:00Z",
      siteUrl: "https://intefin.vercel.app",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("coach@example.com")
    expect(call.subject).toContain("Pro")
    expect(call.text).toContain("Mabel Álvarez")
  })

  it("handles null planExpiresAt without throwing", async () => {
    await expect(
      sendPlanUpgradeEmail({
        coachEmail: "coach@example.com",
        coachName: "Mabel",
        planExpiresAt: null,
        siteUrl: "https://intefin.vercel.app",
      })
    ).resolves.toBeUndefined()
  })
})
