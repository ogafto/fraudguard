import "server-only";
import { getIntegration } from "./integrations";

// Emails go out through Resend (https://resend.com), connected in the admin panel under Integracje
// (or RESEND_API_KEY). Without a key, `next dev` prints the message to the server console.

type Mail = { to: string; subject: string; html: string; text: string };

/** Thrown when no Resend key is connected (admin panel → Integracje, or RESEND_API_KEY). */
export class MailNotConfiguredError extends Error {
  constructor() {
    super("Resend is not connected.");
  }
}

export async function sendMail(mail: Mail) {
  // The key and sender come from the admin panel first, then from the environment.
  const { apiKey: key, from } = await getIntegration("resend");
  if (!key) {
    // Only `next dev` prints to the console; a running site reports the missing integration instead.
    if (process.env.NODE_ENV !== "development") throw new MailNotConfiguredError();
    console.info(`\n[mail] Do: ${mail.to}\n[mail] Temat: ${mail.subject}\n${mail.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: from || "FraudGuard <onboarding@resend.dev>",
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif";

function layout(title: string, body: string) {
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#08090a;color:#f7f8f8;font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08090a;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="padding:0 4px 28px;font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#f7f8f8;">FraudGuard</td></tr>
<tr><td style="background:#0f1012;border:1px solid #1f2023;border-radius:16px;padding:36px 32px;">
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;font-weight:500;letter-spacing:-0.03em;color:#f7f8f8;">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:24px 4px 0;font-size:12px;line-height:1.6;color:#5c6068;">Dostajesz tę wiadomość, bo ktoś użył Twojego adresu na stronie FraudGuard. Jeśli to nie Ty, po prostu ją zignoruj.</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#8a8f98;">${html}</p>`;

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:#f7f8f8;color:#08090a;font-size:14.5px;font-weight:500;text-decoration:none;padding:13px 26px;border-radius:999px;">${esc(label)}</a>`;

const fallbackLink = (href: string) =>
  `<p style="margin:24px 0 0;font-size:12.5px;line-height:1.6;color:#5c6068;">Przycisk nie działa? Skopiuj ten adres do przeglądarki:<br><a href="${esc(href)}" style="color:#8a8f98;word-break:break-all;">${esc(href)}</a></p>`;

export function verificationMail(to: string, nick: string, code: string, link: string): Mail {
  const html = layout(
    "Potwierdź adres e-mail",
    p(`Cześć <span style="color:#f7f8f8;">${esc(nick)}</span>, wpisz ten kod na stronie rejestracji, żeby aktywować konto FraudGuard. Kod jest ważny 30 minut.`) +
      `<div style="margin:0 0 28px;padding:18px 0;border-radius:12px;background:#08090a;border:1px solid #1f2023;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;letter-spacing:10px;color:#f7f8f8;">${code}</div>` +
      p("Możesz też po prostu kliknąć przycisk:") +
      button(link, "Potwierdź adres") +
      fallbackLink(link),
  );
  const text = `Cześć ${nick},\n\nTwój kod weryfikacyjny FraudGuard: ${code}\nKod jest ważny 30 minut.\n\nMożesz też otworzyć ten link:\n${link}\n\nJeśli to nie Ty, zignoruj tę wiadomość.`;
  return { to, subject: `${code} to Twój kod FraudGuard`, html, text };
}

export function resetMail(to: string, nick: string, link: string): Mail {
  const html = layout(
    "Ustaw nowe hasło",
    p(`Cześć <span style="color:#f7f8f8;">${esc(nick)}</span>, ktoś poprosił o zmianę hasła do Twojego konta FraudGuard. Link jest ważny 60 minut.`) +
      button(link, "Ustaw nowe hasło") +
      fallbackLink(link),
  );
  const text = `Cześć ${nick},\n\nUstaw nowe hasło do konta FraudGuard tutaj (link ważny 60 minut):\n${link}\n\nJeśli to nie Ty, zignoruj tę wiadomość. Hasło pozostanie bez zmian.`;
  return { to, subject: "Zmiana hasła FraudGuard", html, text };
}
