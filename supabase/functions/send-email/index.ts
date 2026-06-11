import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  sendEmail,
  templateWelcome,
  templateCourseAccess,
  templateAccessRevoked,
} from "../_shared/resend.ts";

type EmailType = "welcome" | "course_access" | "access_revoked";

interface EmailBody {
  type: EmailType;
  to?: string;          // required for admin-triggered types
  courseTitle?: string;
  courseSlug?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json("ok", 200);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "No autenticado" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json({ error: "No autenticado" }, 401);

  const body: EmailBody = await req.json();
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://academia-creativa.vercel.app";

  // ── Welcome: send to the authenticated user themselves ─────────────────────
  if (body.type === "welcome") {
    const name =
      (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
      user.email?.split("@")[0] ??
      "creador";
    const { subject, html } = templateWelcome(name, siteUrl);
    await sendEmail({ to: user.email!, subject, html });
    return json({ ok: true });
  }

  // ── Admin-only types: verify caller has admin role ─────────────────────────
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminRole) return json({ error: "Sin permisos" }, 403);

  const to = body.to;
  if (!to) return json({ error: "Falta el destinatario" }, 400);

  if (body.type === "course_access") {
    if (!body.courseTitle || !body.courseSlug) {
      return json({ error: "Faltan courseTitle o courseSlug" }, 400);
    }
    const { subject, html } = templateCourseAccess(body.courseTitle, body.courseSlug, siteUrl);
    await sendEmail({ to, subject, html });
    return json({ ok: true });
  }

  if (body.type === "access_revoked") {
    if (!body.courseTitle) return json({ error: "Falta courseTitle" }, 400);
    const { subject, html } = templateAccessRevoked(body.courseTitle);
    await sendEmail({ to, subject, html });
    return json({ ok: true });
  }

  return json({ error: "Tipo de email no reconocido" }, 400);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
