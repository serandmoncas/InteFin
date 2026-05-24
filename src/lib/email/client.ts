import { Resend } from "resend"

let _client: Resend | null = null

/**
 * Returns a shared Resend SDK instance.
 * Lazy-initialized so tests can set RESEND_API_KEY before first call.
 * Pass any string as key when no key is set — sendEmail() checks for
 * the key separately and skips the actual send in dev mode.
 */
export function getResendClient(): Resend {
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY ?? "dev-no-key")
  }
  return _client
}

/** Reset singleton — used in tests only */
export function _resetResendClient(): void {
  _client = null
}
