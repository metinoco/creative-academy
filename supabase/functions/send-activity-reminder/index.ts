import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail, templateActivityReminder } from "../_shared/resend.ts";

interface InactiveStudent {
  user_id: string;
  email: string;
  full_name: string | null;
  course_id: string;
  course_title: string;
  course_slug: string;
  days_since: number;
  last_activity: string;
  lessons_done: number;
}

interface RequestBody {
  /** Si es true (por defecto), solo devuelve la lista sin enviar emails. */
  dry_run?: boolean;
  /** Días de inactividad para considerar a un alumno inactivo. Defecto: 14. */
  days_inactive?: number;
  /** Si está presente, envía un email de prueba a esa dirección y termina. */
  send_test?: string;
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

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminRole) return json({ error: "Sin permisos" }, 403);

  const body: RequestBody = await req.json().catch(() => ({}));
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://academia-creativa.vercel.app";

  // ── Modo prueba: envía un email de muestra a la dirección indicada ─────────
  if (body.send_test) {
    const testEmail = body.send_test.trim();
    const { subject, html } = templateActivityReminder(
      testEmail.split("@")[0],
      "Diseño tipográfico: fundamentos y práctica",
      "diseno-tipografico",
      18,
      siteUrl,
    );
    await sendEmail({ to: testEmail, subject, html });
    return json({ ok: true, sent_to: testEmail });
  }

  // ── Detección normal ───────────────────────────────────────────────────────
  const dry_run = body.dry_run !== false;
  const days_inactive = typeof body.days_inactive === "number" ? body.days_inactive : 14;

  const { data, error: rpcError } = await supabase
    .rpc("get_inactive_enrolled_students", { days_inactive });

  if (rpcError) {
    console.error("[activity-reminder] RPC error:", rpcError);
    return json({ error: "Error al consultar alumnos inactivos" }, 500);
  }

  const students = (data ?? []) as InactiveStudent[];

  if (dry_run) {
    return json({
      dry_run: true,
      days_inactive,
      total: students.length,
      students: students.map((s) => ({
        email: s.email,
        full_name: s.full_name,
        course_title: s.course_title,
        course_slug: s.course_slug,
        days_since: s.days_since,
        lessons_done: s.lessons_done,
        last_activity: s.last_activity,
      })),
    });
  }

  let sent = 0;
  let failed = 0;
  for (const student of students) {
    try {
      const firstName = student.full_name?.split(" ")[0] ?? student.email.split("@")[0];
      const { subject, html } = templateActivityReminder(
        firstName,
        student.course_title,
        student.course_slug,
        student.days_since,
        siteUrl,
      );
      await sendEmail({ to: student.email, subject, html });
      sent++;
    } catch (err) {
      console.error(`[activity-reminder] Error enviando a ${student.email}:`, err);
      failed++;
    }
  }

  return json({ dry_run: false, days_inactive, total: students.length, sent, failed });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
