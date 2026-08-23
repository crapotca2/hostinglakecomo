import { createHash, randomInt } from "crypto";
import { collections } from "@/lib/mongodb/collections";
import { sendOtpEmail } from "@/lib/email/send-otp";
import type { OtpCodeDoc } from "@/types/database";

const OTP_TTL_MS = 10 * 60_000; // 10 minuti
const MAX_ATTEMPTS = 5;

function hashCode(code: string, email: string): string {
  return createHash("sha256").update(`${code}:${email}`).digest("hex");
}

/**
 * Genera e invia un OTP SOLO se l'email corrisponde a un utente esistente.
 * Anti-enumeration: non rivela mai se l'email esiste (il chiamante risponde
 * sempre 200). Un solo codice attivo per email (upsert).
 */
export async function requestOtp(email: string): Promise<void> {
  const e = email.trim().toLowerCase();
  const usersCol = await collections.users();
  const user = await usersCol.findOne({ email: e });
  if (!user) return; // silenzioso

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = new Date();
  const otp = await collections.otpCodes();
  const existing = (await otp.findOne({ email: e })) as OtpCodeDoc | null;
  const patch = {
    email: e,
    codeHash: hashCode(code, e),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    updatedAt: now,
  };
  if (existing) {
    await otp.updateOne({ email: e }, { $set: patch });
  } else {
    await otp.insertOne({ ...patch, createdAt: now });
  }
  await sendOtpEmail(e, code, user.name);
}

/**
 * Verifica il codice. One-time: cancella il record su successo o su
 * scadenza/troppi tentativi. Incrementa attempts sui tentativi errati.
 */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  const otp = await collections.otpCodes();
  const rec = (await otp.findOne({ email: e })) as OtpCodeDoc | null;
  if (!rec) return false;
  if (rec.expiresAt < new Date() || (rec.attempts ?? 0) >= MAX_ATTEMPTS) {
    await otp.deleteOne({ email: e });
    return false;
  }
  if (rec.codeHash !== hashCode(code.trim(), e)) {
    await otp.updateOne(
      { email: e },
      { $set: { attempts: (rec.attempts ?? 0) + 1, updatedAt: new Date() } },
    );
    return false;
  }
  await otp.deleteOne({ email: e }); // consumo one-time
  return true;
}
