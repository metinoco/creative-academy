import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail, templateCertificateIssued } from "../_shared/resend.ts";

interface CertData {
  recipientName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  verificationCode: string;
  verificationUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autenticado" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: "No autenticado" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { course_id, recipient_name } = await req.json();
    if (!course_id || !recipient_name?.trim()) {
      return json({ error: "Faltan parámetros: course_id y recipient_name" }, 400);
    }

    // Check for existing certificate
    const { data: existing } = await admin
      .from("certificates")
      .select("id, verification_code, pdf_url, issued_at, recipient_name")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .maybeSingle();

    // Only return early if PDF was already generated successfully
    if (existing?.pdf_url) return json(existing);

    // Verify 100% completion (only on first attempt, not on retry)
    if (!existing) {
      const [{ count: total }, { count: completed }] = await Promise.all([
        admin.from("lessons").select("*", { count: "exact", head: true }).eq("course_id", course_id),
        admin.from("lesson_progress").select("*", { count: "exact", head: true })
          .eq("user_id", user.id).eq("course_id", course_id),
      ]);

      if (!total || (completed ?? 0) < total) {
        return json({ error: "El curso no está completado al 100%" }, 400);
      }
    }

    const { data: course } = await admin
      .from("courses")
      .select("title, author")
      .eq("id", course_id)
      .single();

    if (!course) return json({ error: "Curso no encontrado" }, 404);

    // Use existing cert (retry after failed PDF generation) or insert new one
    let certRecord: { id: string; verification_code: string; issued_at: string };

    if (existing) {
      certRecord = { id: existing.id, verification_code: existing.verification_code, issued_at: existing.issued_at };
    } else {
      const { data: cert, error: certError } = await admin
        .from("certificates")
        .insert({ user_id: user.id, course_id, recipient_name: recipient_name.trim() })
        .select("id, verification_code, issued_at")
        .single();
      if (certError) throw certError;
      certRecord = cert;
    }

    const origin = req.headers.get("origin") ??
      Deno.env.get("SITE_URL") ??
      "https://academia-creativa.vercel.app";

    const issuedDate = new Date(certRecord.issued_at).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });

    const pdfBytes = await generateCertificatePDF({
      recipientName: recipient_name.trim(),
      courseTitle: course.title,
      instructorName: course.author ?? "Academia Creativa",
      issuedAt: issuedDate,
      verificationCode: certRecord.verification_code,
      verificationUrl: `${origin}/certificado/${certRecord.verification_code}`,
    });

    const fileName = `${certRecord.id}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("certificates")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = admin.storage.from("certificates").getPublicUrl(fileName);

    const { data: finalCert, error: updateError } = await admin
      .from("certificates")
      .update({ pdf_url: publicUrl })
      .eq("id", certRecord.id)
      .select("id, verification_code, pdf_url, issued_at, recipient_name")
      .single();

    if (updateError) throw updateError;

    // Enviar email de certificado emitido (fire-and-forget)
    try {
      if (user.email && finalCert) {
        const name = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
          user.email.split("@")[0];
        const { subject, html } = templateCertificateIssued(
          name,
          course.title,
          finalCert.pdf_url,
          finalCert.verification_code,
          origin,
        );
        await sendEmail({ to: user.email, subject, html });
      }
    } catch (emailErr) {
      console.error("Error sending certificate email:", emailErr);
    }

    return json(finalCert);
  } catch (err) {
    console.error("generate-certificate error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

// ─── Font loader ─────────────────────────────────────────────────────────────
// Google Fonts now serves WOFF2 even for legacy UA strings; @pdf-lib/fontkit
// (based on fontkit 1.8.x) does not support WOFF2. We fetch raw TTF files
// directly from the google/fonts GitHub mirror which always serves TTF.

const FONT_URLS = {
  dmSerifRegular: "https://raw.githubusercontent.com/google/fonts/main/ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf",
  dmSerifItalic:  "https://raw.githubusercontent.com/google/fonts/main/ofl/dmserifdisplay/DMSerifDisplay-Italic.ttf",
  // Variable font covers all weights (100–900); default instance ≈ Regular 400.
  nunitoSans:     "https://raw.githubusercontent.com/google/fonts/main/ofl/nunitosans/NunitoSans%5BYTLC%2Copsz%2Cwdth%2Cwght%5D.ttf",
};

async function fetchFontBytes(url: string, label: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed [${label}]: HTTP ${res.status} — ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes[0] === 0x3C) { // '<' → HTML error page, not a font binary
    throw new Error(`Font fetch [${label}] returned HTML instead of a font binary — URL may be wrong or blocked`);
  }
  return bytes;
}

// ─── PDF generation ──────────────────────────────────────────────────────────

async function generateCertificatePDF(data: CertData): Promise<Uint8Array> {
  // Load brand fonts in parallel from GitHub raw (TTF, no WOFF2 issues)
  const [dmSerifBytes, dmSerifItalicBytes, nunitoBytes] = await Promise.all([
    fetchFontBytes(FONT_URLS.dmSerifRegular, "DM Serif Regular"),
    fetchFontBytes(FONT_URLS.dmSerifItalic,  "DM Serif Italic"),
    fetchFontBytes(FONT_URLS.nunitoSans,     "Nunito Sans"),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const page = doc.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();

  const dmSerif       = await doc.embedFont(dmSerifBytes);
  const dmSerifItalic = await doc.embedFont(dmSerifItalicBytes);
  // Single variable font covers all weights; embed once and alias both roles.
  const nunitoBase    = await doc.embedFont(nunitoBytes);
  const nunitoBold    = nunitoBase;
  const nunitoReg     = nunitoBase;

  // ── Design tokens (matches index.css custom properties)
  const cream   = rgb(0.992, 0.976, 0.957); // hsl(38 50% 98%)
  const ink     = rgb(0.149, 0.114, 0.090); // hsl(24 25% 12%)
  const inkFg   = rgb(0.992, 0.976, 0.957);
  const primary = rgb(0.894, 0.321, 0.147); // hsl(14 78% 52%)
  const gold    = rgb(0.921, 0.686, 0.275); // hsl(38 80% 60%)
  const muted   = rgb(0.427, 0.380, 0.352); // hsl(24 12% 38%)

  const cx = width / 2;
  const HEADER_H = 80;

  // ── 1. Cream background
  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

  // ── 2. Corner blobs (drawn before borders so borders appear on top)
  page.drawCircle({ x: -30, y: -30, size: 220, color: primary, opacity: 0.07 });
  page.drawCircle({ x: width + 30, y: -30, size: 200, color: gold, opacity: 0.09 });
  page.drawCircle({ x: width - 60, y: height + 20, size: 160, color: primary, opacity: 0.05 });

  // ── 3. Page borders (primary outer, gold inner)
  page.drawRectangle({
    x: 16, y: 16, width: width - 32, height: height - 32,
    borderColor: primary, borderWidth: 2,
  });
  page.drawRectangle({
    x: 25, y: 25, width: width - 50, height: height - 50,
    borderColor: gold, borderWidth: 0.8,
  });

  // ── 4. Ink header band
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: HEADER_H, color: ink });

  // Glow blobs inside header
  page.drawCircle({ x: width - 50, y: height - HEADER_H / 2, size: 90, color: primary, opacity: 0.18 });
  page.drawCircle({ x: 70,         y: height,                 size: 65, color: gold,    opacity: 0.14 });

  // Logo mark: terracotta circle + "A"
  const LOGO_X = 50;
  const LOGO_Y = height - HEADER_H / 2;
  const LOGO_R = 17;
  page.drawCircle({ x: LOGO_X, y: LOGO_Y, size: LOGO_R, color: primary });
  const aText = "A";
  const aSz   = 15;
  const aW    = nunitoBold.widthOfTextAtSize(aText, aSz);
  page.drawText(aText, {
    x: LOGO_X - aW / 2,
    y: LOGO_Y - aSz * 0.33,
    size: aSz, font: nunitoBold, color: inkFg,
  });

  // Brand name centered in header
  const brandSz   = 11;
  const brandText = "ACADEMIA CREATIVA";
  const brandW    = nunitoBold.widthOfTextAtSize(brandText, brandSz);
  page.drawText(brandText, {
    x: cx - brandW / 2,
    y: height - HEADER_H / 2 - brandSz * 0.33,
    size: brandSz, font: nunitoBold, color: inkFg, characterSpacing: 3,
  });

  // ── 5. Thin gold rule just below the header
  page.drawLine({
    start: { x: 26, y: height - HEADER_H - 0.5 },
    end:   { x: width - 26, y: height - HEADER_H - 0.5 },
    thickness: 0.8, color: gold,
  });

  // ── 6. "CERTIFICADO" — DM Serif Display, large
  const certSz   = 54;
  const certText = "CERTIFICADO";
  const certW    = dmSerif.widthOfTextAtSize(certText, certSz);
  page.drawText(certText, {
    x: cx - certW / 2,
    y: height - HEADER_H - 78,
    size: certSz, font: dmSerif, color: ink,
  });

  // ── 7. "DE FINALIZACIÓN" — Nunito Sans 800, terracotta
  const subSz   = 12;
  const subText = "DE FINALIZACIÓN";
  const subW    = nunitoBold.widthOfTextAtSize(subText, subSz);
  page.drawText(subText, {
    x: cx - subW / 2,
    y: height - HEADER_H - 100,
    size: subSz, font: nunitoBold, color: primary, characterSpacing: 3.5,
  });

  // Flanking rules around subtitle
  const ruleY = height - HEADER_H - 95;
  page.drawLine({ start: { x: cx - subW / 2 - 30, y: ruleY }, end: { x: cx - subW / 2 - 8, y: ruleY }, thickness: 0.7, color: gold });
  page.drawLine({ start: { x: cx + subW / 2 + 8,  y: ruleY }, end: { x: cx + subW / 2 + 30, y: ruleY }, thickness: 0.7, color: gold });

  // ── 8. Separator
  const sep1Y = height - HEADER_H - 116;
  page.drawLine({ start: { x: cx - 90, y: sep1Y }, end: { x: cx + 90, y: sep1Y }, thickness: 0.7, color: gold });

  // ── 9. "Otorgado a"
  const preSz   = 9;
  const preText = "Otorgado a";
  const preW    = nunitoReg.widthOfTextAtSize(preText, preSz);
  page.drawText(preText, {
    x: cx - preW / 2,
    y: height - HEADER_H - 152,
    size: preSz, font: nunitoReg, color: muted,
  });

  // ── 10. Recipient name — DM Serif Display Italic
  const nameSz = 36;
  let nameText = data.recipientName;
  while (dmSerifItalic.widthOfTextAtSize(nameText, nameSz) > 700 && nameText.length > 4) {
    nameText = nameText.slice(0, -4) + "…";
  }
  const nameW = dmSerifItalic.widthOfTextAtSize(nameText, nameSz);
  const nameY = height - HEADER_H - 198;
  page.drawText(nameText, { x: cx - nameW / 2, y: nameY, size: nameSz, font: dmSerifItalic, color: ink });
  // Subtle underline
  page.drawLine({
    start: { x: cx - nameW / 2, y: nameY - 5 },
    end:   { x: cx + nameW / 2, y: nameY - 5 },
    thickness: 0.5, color: muted,
  });

  // ── 11. "por completar…"
  const compSz   = 9;
  const compText = "por completar satisfactoriamente el curso";
  const compW    = nunitoReg.widthOfTextAtSize(compText, compSz);
  page.drawText(compText, {
    x: cx - compW / 2,
    y: height - HEADER_H - 236,
    size: compSz, font: nunitoReg, color: muted,
  });

  // ── 12. Course title — Nunito Sans 800
  const cSz = 19;
  let cText = data.courseTitle;
  while (nunitoBold.widthOfTextAtSize(cText, cSz) > 700 && cText.length > 4) {
    cText = cText.slice(0, -4) + "…";
  }
  const cW = nunitoBold.widthOfTextAtSize(cText, cSz);
  page.drawText(cText, {
    x: cx - cW / 2,
    y: height - HEADER_H - 268,
    size: cSz, font: nunitoBold, color: ink,
  });

  // ── 13. Instructor
  const instrSz   = 9;
  const instrText = `Impartido por ${data.instructorName}`;
  const instrW    = nunitoReg.widthOfTextAtSize(instrText, instrSz);
  page.drawText(instrText, {
    x: cx - instrW / 2,
    y: height - HEADER_H - 294,
    size: instrSz, font: nunitoReg, color: muted,
  });

  // ── 14. Bottom separator
  page.drawLine({ start: { x: 44, y: 88 }, end: { x: width - 44, y: 88 }, thickness: 0.5, color: gold });

  // ── 15. Footer row
  const labelSz = 7;
  const valueSz = 9;

  // Left: emission date
  page.drawText("Fecha de emisión", { x: 48, y: 72, size: labelSz, font: nunitoBold, color: muted, characterSpacing: 0.3 });
  page.drawText(data.issuedAt,      { x: 48, y: 57, size: valueSz, font: nunitoReg,  color: ink });

  // Center: verification code + URL
  const codeText = `Código: ${data.verificationCode}`;
  const codeW    = nunitoBold.widthOfTextAtSize(codeText, labelSz);
  const urlW     = nunitoReg.widthOfTextAtSize(data.verificationUrl, labelSz);
  page.drawText(codeText,             { x: cx - codeW / 2, y: 72, size: labelSz, font: nunitoBold, color: muted });
  page.drawText(data.verificationUrl, { x: cx - urlW  / 2, y: 57, size: labelSz, font: nunitoReg,  color: primary });

  // Right: brand seal
  const sealText = "Academia Creativa";
  const sealW    = nunitoBold.widthOfTextAtSize(sealText, valueSz);
  const offText  = "Certificado oficial";
  const offW     = nunitoReg.widthOfTextAtSize(offText, labelSz);
  page.drawText(sealText, { x: width - 48 - sealW, y: 72, size: valueSz, font: nunitoBold, color: primary });
  page.drawText(offText,  { x: width - 48 - offW,  y: 57, size: labelSz, font: nunitoReg,  color: muted });

  return await doc.save();
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
