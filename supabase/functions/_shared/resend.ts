const RESEND_API = "https://api.resend.com/emails";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping");
    return;
  }
  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    console.error("[email] Resend error:", await res.text());
  }
}

// ─── Design helpers ───────────────────────────────────────────────────────────

function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F5EFE6;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td style="background:#261D17;border-radius:12px 12px 0 0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#F5EFE6;font-size:11px;font-weight:700;letter-spacing:3px;">ACADEMIA CREATIVA</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px 36px;border-radius:0 0 12px 12px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:20px;text-align:center;">
            <p style="margin:0;color:#9B8A82;font-size:11px;">© 2026 Academia Creativa &middot; Si no esperabas este email, ignóralo.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const h1 = (t: string) =>
  `<h1 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#261D17;line-height:1.2;">${t}</h1>`;
const p = (t: string) =>
  `<p style="margin:0 0 20px;font-size:15px;color:#5A4A42;line-height:1.6;">${t}</p>`;
const box = (t: string) =>
  `<div style="background:#F5EFE6;border-radius:8px;padding:16px 20px;margin:0 0 24px;"><p style="margin:0;font-weight:700;color:#261D17;font-size:16px;">${t}</p></div>`;
const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#E45225;color:#ffffff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:50px;text-decoration:none;">${label}</a>`;
const note = (t: string) =>
  `<p style="margin:20px 0 0;font-size:12px;color:#9B8A82;">${t}</p>`;

// ─── Templates ────────────────────────────────────────────────────────────────

export function templateWelcome(
  name: string,
  siteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `¡Bienvenido/a a Academia Creativa, ${name}!`,
    html: shell(
      h1(`¡Hola, ${name}! 🎉`) +
      p("Tu cuenta en <strong>Academia Creativa</strong> está lista. Explora el catálogo y empieza a aprender hoy.") +
      btn(`${siteUrl}/alumno`, "Ir a mi dashboard") +
      note("Si no creaste esta cuenta, ignora este mensaje.")
    ),
  };
}

export function templatePurchaseConfirmation(
  name: string,
  courseTitle: string,
  courseSlug: string,
  siteUrl: string,
): { subject: string; html: string } {
  const greeting = name ? `Gracias, ${name}.` : "¡Gracias por tu compra!";
  return {
    subject: `¡Compra confirmada! Tu acceso a «${courseTitle}» está listo`,
    html: shell(
      h1("¡Compra confirmada! 🎊") +
      p(`${greeting} Ya tienes acceso a:`) +
      box(courseTitle) +
      btn(`${siteUrl}/alumno/curso/${courseSlug}`, "Empezar el curso") +
      note("Guarda este email como comprobante de tu compra.")
    ),
  };
}

export function templateCourseAccess(
  courseTitle: string,
  courseSlug: string,
  siteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `Tienes acceso a «${courseTitle}» en Academia Creativa`,
    html: shell(
      h1("¡Nuevo curso disponible!") +
      p("El equipo de Academia Creativa te ha dado acceso a:") +
      box(courseTitle) +
      btn(`${siteUrl}/alumno/curso/${courseSlug}`, "Ir al curso")
    ),
  };
}

export function templateCertificateIssued(
  name: string,
  courseTitle: string,
  pdfUrl: string,
  verificationCode: string,
  siteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `🎓 Tu certificado de «${courseTitle}» está listo`,
    html: shell(
      h1(`¡Enhorabuena, ${name}!`) +
      p(`Has completado <strong>${courseTitle}</strong>. Tu certificado oficial de finalización ya está disponible.`) +
      btn(pdfUrl, "Descargar certificado PDF") +
      `<p style="margin:20px 0 0;font-size:13px;color:#5A4A42;">También puedes <a href="${siteUrl}/certificado/${verificationCode}" style="color:#E45225;font-weight:700;">verificar tu certificado online</a>.</p>`
    ),
  };
}

export function templateAccessRevoked(
  courseTitle: string,
): { subject: string; html: string } {
  return {
    subject: `Cambio en tu acceso a «${courseTitle}»`,
    html: shell(
      h1("Acceso modificado") +
      p(`Tu acceso al curso <strong>${courseTitle}</strong> ha sido revisado por nuestro equipo.`) +
      p("Si crees que esto es un error o tienes alguna duda, contáctanos respondiendo a este email.")
    ),
  };
}

export function templateActivityReminder(
  name: string,
  courseTitle: string,
  courseSlug: string,
  daysInactive: number,
  siteUrl: string,
): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] ?? "creador";
  return {
    subject: `¿Seguimos? Te esperamos en «${courseTitle}»`,
    html: shell(
      h1(`Hola ${firstName}, ¿retomamos el curso?`) +
      p(`Llevas <strong>${daysInactive} días</strong> sin entrar a <strong>${courseTitle}</strong>. ¡Tus avances siguen ahí esperándote!`) +
      btn(`${siteUrl}/alumno/curso/${courseSlug}`, "Continuar el curso") +
      note("Recibes este recordatorio porque tienes acceso activo al curso. Si no quieres más avisos, contáctanos respondiendo a este email.")
    ),
  };
}
