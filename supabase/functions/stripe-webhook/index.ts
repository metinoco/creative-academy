import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail, templatePurchaseConfirmation } from "../_shared/resend.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing stripe-signature or webhook secret", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  // Solo procesamos pago completado
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.user_id;
  const courseId = session.metadata?.course_id;

  if (!userId || !courseId) {
    console.error("Missing metadata in session:", session.id);
    return new Response("Missing user_id or course_id in metadata", { status: 400 });
  }

  // Usamos service role para operaciones privilegiadas
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotencia: si ya existe el pago, no hacemos nada
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    console.log("Payment already processed:", session.id);
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Crear o reactivar matrícula (upsert por unique(user_id, course_id))
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        source: "purchase",
        granted_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: "user_id,course_id" },
    )
    .select("id")
    .single();

  if (enrollmentError) {
    console.error("Error creating enrollment:", enrollmentError);
    // Devolver 500 para que Stripe reintente
    return new Response("Error creating enrollment", { status: 500 });
  }

  // Registrar el pago
  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: userId,
    course_id: courseId,
    enrollment_id: enrollment?.id ?? null,
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === "string"
      ? session.payment_intent
      : null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    status: "succeeded",
  });

  if (paymentError) {
    // El pago ya existe o hubo otro error — loguear pero devolver 200
    console.error("Error recording payment:", paymentError);
  }

  // Enviar email de confirmación de compra (fire-and-forget)
  try {
    const userEmail = session.customer_details?.email ?? session.customer_email;
    if (userEmail) {
      const [{ data: profile }, { data: course }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
        supabase.from("courses").select("title, slug").eq("id", courseId).maybeSingle(),
      ]);
      if (course) {
        const name = (profile?.full_name as string | null)?.split(" ")[0] ?? "";
        const siteUrl = Deno.env.get("SITE_URL") ?? "https://academia-creativa.vercel.app";
        const { subject, html } = templatePurchaseConfirmation(name, course.title, course.slug, siteUrl);
        await sendEmail({ to: userEmail, subject, html });
      }
    }
  } catch (emailErr) {
    console.error("Error sending purchase email:", emailErr);
  }

  console.log(`Payment succeeded: user=${userId} course=${courseId} session=${session.id}`);

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
