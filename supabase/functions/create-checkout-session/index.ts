import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "No autenticado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: "No autenticado" }, 401);
    }

    const { course_id, slug } = await req.json();
    if (!course_id || !slug) {
      return json({ error: "Faltan parámetros: course_id y slug" }, 400);
    }

    // Verificar que el curso existe y está publicado
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, status, image_url")
      .eq("id", course_id)
      .eq("status", "published")
      .single();

    if (courseError || !course) {
      return json({ error: "Curso no encontrado o no publicado" }, 404);
    }

    // Evitar checkout duplicado si ya tiene matrícula activa
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .is("revoked_at", null)
      .maybeSingle();

    if (existing) {
      return json({ error: "Ya estás matriculado en este curso" }, 400);
    }

    const origin = req.headers.get("origin") ?? "http://localhost:8080";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: course.title,
              description: `Acceso de por vida · Academia Creativa`,
              ...(course.image_url ? { images: [course.image_url] } : {}),
            },
            // price es integer en EUR → multiplicar ×100 para céntimos
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/pago/exito?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
      cancel_url: `${origin}/curso/${slug}`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        course_id: course_id,
        course_slug: slug,
      },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
