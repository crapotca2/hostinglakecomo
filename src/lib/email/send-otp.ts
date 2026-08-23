import { Resend } from "resend";

// Invia il codice OTP di accesso. In assenza di RESEND_API_KEY (dev) NON invia
// nulla ma logga il codice in console, così il flusso è testabile in locale.
export async function sendOtpEmail(
  email: string,
  code: string,
  name?: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[otp] (dev, no RESEND_API_KEY) codice per ${email}: ${code}`);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "Host Como <noreply@hostcomo.com>",
      to: email,
      subject: "Il tuo codice di accesso Host Como",
      html: renderOtpEmail(code, name),
    });
    if (result.error) console.error("[otp] Resend error:", result.error);
  } catch (err) {
    // Non lanciare: il chiamante risponde sempre 200 (anti-enumeration).
    console.error("[otp] send exception:", err);
  }
}

function renderOtpEmail(code: string, name?: string): string {
  const hi = name ? `Ciao ${escapeHtml(name)},` : "Ciao,";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Codice di accesso Host Como</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:36px 32px;border:1px solid #e8eaee;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#0C7489;font-weight:700;">Accesso proprietari</div>
      <h1 style="margin:6px 0 20px 0;color:#1D3A62;font-size:20px;font-weight:600;">Il tuo codice di accesso</h1>
      <p style="margin:0 0 20px 0;color:#1D3A62;font-size:14px;line-height:1.6;">${hi} usa questo codice per accedere al tuo portale Host Como:</p>
      <div style="font-size:34px;font-weight:700;letter-spacing:0.24em;color:#1D3A62;background:#f2f5f8;border-radius:10px;padding:18px 0;text-align:center;">${escapeHtml(code)}</div>
      <p style="margin:20px 0 0 0;color:#888;font-size:12px;line-height:1.6;">Il codice scade tra 10 minuti. Se non hai richiesto l'accesso, ignora questa email.</p>
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
