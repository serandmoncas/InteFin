import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import React from "react"

vi.mock("./client", () => ({
  getResendClient: vi.fn(),
  _resetResendClient: vi.fn(),
}))

import { sendEmail } from "./send"
import { getResendClient } from "./client"

const mockSend = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getResendClient).mockReturnValue({ emails: { send: mockSend } } as never)
})

const baseParams = {
  to: "user@example.com",
  subject: "Test subject",
  react: React.createElement("div", null, "Hello"),
  text: "Hello",
}

describe("sendEmail", () => {
  describe("when RESEND_API_KEY is set", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key"
    })
    afterEach(() => {
      delete process.env.RESEND_API_KEY
    })

    it("sends email and returns empty object on success", async () => {
      mockSend.mockResolvedValue({ data: { id: "msg_123" }, error: null })

      const result = await sendEmail(baseParams)

      expect(result).toEqual({})
      expect(mockSend).toHaveBeenCalledOnce()
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Test subject",
        })
      )
    })

    it("returns { error } without throwing when Resend API returns an error", async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: "Resend API error" } })

      const result = await sendEmail(baseParams)

      expect(result.error).toBe("Resend API error")
    })

    it("returns { error } without throwing when send() rejects", async () => {
      mockSend.mockRejectedValue(new Error("Network failure"))

      const result = await sendEmail(baseParams)

      expect(result.error).toBe("Network failure")
    })

    it("uses EMAIL_FROM env var as sender", async () => {
      process.env.EMAIL_FROM = "MiApp <hola@miapp.com>"
      mockSend.mockResolvedValue({ data: { id: "x" }, error: null })

      await sendEmail(baseParams)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ from: "MiApp <hola@miapp.com>" })
      )
      delete process.env.EMAIL_FROM
    })
  })

  describe("when RESEND_API_KEY is not set", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY
    })

    it("skips the send and logs subject to console", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

      const result = await sendEmail(baseParams)

      expect(result).toEqual({})
      expect(mockSend).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test subject")
      )
      consoleSpy.mockRestore()
    })
  })
})
