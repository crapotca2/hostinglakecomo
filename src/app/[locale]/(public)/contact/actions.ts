"use server";

import { Resend } from "resend";
import { z } from "zod";

const INTEREST_VALUES = [
  "consulenza",
  "home-staging",
  "gestione",
  "valutazione",
  "partnership",
  "altro",
] as const;

const INTEREST_LABELS: Record<(typeof INTEREST_VALUES)[number], string> = {
  consulenza: "Consulenza",
  "home-staging": "Home staging",
  gestione: "Gestione affitti brevi",
  valutazione: "Valutazione immobile",
  partnership: "Partnership",
  altro: "Altro",
};

const ContactSchema = z.object({
  nome: z.string().trim().min(1).max(100),
  cognome: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  telefono: z.string().trim().max(30).optional().default(""),
  interesse: z.enum(INTEREST_VALUES),
  indirizzo: z.string().trim().max(200).optional().default(""),
  onPlatform: z.string().optional(),
  linkAnnuncio: z.string().trim().max(500).optional().default(""),
  messaggio: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().default(""),
  mountedAt: z.string().regex(/^\d+$/),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitContact(formData: FormData): Promise<SubmitResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }
  const data = parsed.data;

  // Anti-bot: honeypot must stay empty
  if (data.website) {
    return { ok: true };
  }

  // Anti-bot: form submitted faster than 2s = almost certainly a bot
  const elapsed = Date.now() - parseInt(data.mountedAt, 10);
  if (elapsed < 2000) {
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY not set");
    return { ok: false, error: "config" };
  }

  const onPlatformBool = data.onPlatform === "on";
  const subject = `Nuovo lead Host Como — ${data.nome} ${data.cognome} (${INTEREST_LABELS[data.interesse]})`;
  const html = renderEmail({
    nome: data.nome,
    cognome: data.cognome,
    email: data.email,
    telefono: data.telefono,
    interesse: data.interesse,
    indirizzo: data.indirizzo,
    onPlatform: onPlatformBool,
    linkAnnuncio: data.linkAnnuncio,
    messaggio: data.messaggio,
  });

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "Host Como Form <noreply@hostcomo.com>",
      to: "info@hostcomo.com",
      replyTo: data.email,
      subject,
      html,
    });
    if (result.error) {
      console.error("[contact] Resend error:", result.error);
      return { ok: false, error: "send" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] Send exception:", err);
    return { ok: false, error: "send" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(data: {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  interesse: (typeof INTEREST_VALUES)[number];
  indirizzo: string;
  onPlatform: boolean;
  linkAnnuncio: string;
  messaggio: string;
}): string {
  const row = (label: string, value: string): string =>
    value
      ? `<tr><td style="padding:10px 0;color:#888;width:160px;vertical-align:top;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${label}</td><td style="padding:10px 0;color:#1D3A62;font-size:14px;line-height:1.5;">${escapeHtml(value)}</td></tr>`
      : "";

  const onPlatformRow = data.onPlatform
    ? row(
        "Già su piattaforma",
        data.linkAnnuncio ? `Sì — ${data.linkAnnuncio}` : "Sì",
      )
    : "";

  const timestamp = new Date().toLocaleString("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Nuovo lead Host Como</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:36px 32px;border:1px solid #e8eaee;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#0C7489;font-weight:700;">Lead dal sito</div>
      <h1 style="margin:6px 0 28px 0;color:#1D3A62;font-size:22px;font-weight:600;line-height:1.3;">${escapeHtml(data.nome)} ${escapeHtml(data.cognome)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Email", data.email)}
        ${row("Telefono", data.telefono)}
        ${row("Interesse", INTEREST_LABELS[data.interesse])}
        ${row("Indirizzo immobile", data.indirizzo)}
        ${onPlatformRow}
      </table>
      <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e8eaee;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;margin-bottom:10px;">Messaggio</div>
        <p style="margin:0;color:#1D3A62;font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(data.messaggio)}</p>
      </div>
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8eaee;font-size:12px;color:#999;line-height:1.6;">
        Per rispondere direttamente, premi <strong>Rispondi</strong>: la mail andrà a <strong>${escapeHtml(data.email)}</strong>.<br>
        Ricevuto da <strong>hostcomo.com/contact</strong> · ${timestamp}
      </div>
    </div>
  </div>
</body></html>`;
}
