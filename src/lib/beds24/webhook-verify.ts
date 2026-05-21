import crypto from "node:crypto";

/**
 * Verifica la firma HMAC SHA-256 di un webhook Beds24.
 * Beds24 invia l'header `x-beds24-signature` con `sha256=<hex>`.
 * Il body raw va passato così com'è (non parsato).
 */
export function verifyBeds24Signature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const provided = signatureHeader.replace(/^sha256=/i, "").trim();

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
