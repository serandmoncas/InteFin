import { createHash } from "node:crypto"

/**
 * Wompi Web Checkout — generates a signed URL that takes the user
 * to Wompi's hosted payment page. The signature prevents tampering
 * with amount/currency from the client side.
 *
 * Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
 */

export interface WompiCheckoutParams {
  reference:    string         // unique per attempt (we use subscription_payments.id)
  amountInCents: number         // COP × 100 — Wompi expects cents
  currency:     "COP"
  redirectUrl:  string         // where Wompi sends user after payment
  customerEmail?: string
  customerName?:  string
}

export interface WompiCheckoutResult {
  url: string
  signature: string
}

/**
 * Computes the integrity signature required by Wompi.
 * Concatenation order is FIXED: reference + amountInCents + currency + secret.
 */
export function computeIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): string {
  const payload = `${reference}${amountInCents}${currency}${integritySecret}`
  return createHash("sha256").update(payload).digest("hex")
}

export function buildCheckoutUrl(
  params: WompiCheckoutParams,
  config: { publicKey: string; integritySecret: string },
): WompiCheckoutResult {
  const signature = computeIntegritySignature(
    params.reference,
    params.amountInCents,
    params.currency,
    config.integritySecret,
  )

  const url = new URL("https://checkout.wompi.co/p/")
  url.searchParams.set("public-key",   config.publicKey)
  url.searchParams.set("currency",     params.currency)
  url.searchParams.set("amount-in-cents", String(params.amountInCents))
  url.searchParams.set("reference",    params.reference)
  url.searchParams.set("signature:integrity", signature)
  url.searchParams.set("redirect-url", params.redirectUrl)

  if (params.customerEmail) url.searchParams.set("customer-data:email", params.customerEmail)
  if (params.customerName)  url.searchParams.set("customer-data:full-name", params.customerName)

  return { url: url.toString(), signature }
}

/**
 * Read Wompi config from env vars. Throws if missing — fail loud at startup
 * rather than at the moment a payment is attempted.
 */
export function getWompiConfig() {
  const publicKey       = process.env.WOMPI_PUBLIC_KEY
  const privateKey      = process.env.WOMPI_PRIVATE_KEY
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET

  if (!publicKey || !privateKey || !integritySecret) {
    throw new Error(
      "Missing Wompi credentials. Set WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET in .env.local",
    )
  }

  return { publicKey, privateKey, integritySecret }
}

export function isSandbox(publicKey: string): boolean {
  return publicKey.startsWith("pub_test_")
}
