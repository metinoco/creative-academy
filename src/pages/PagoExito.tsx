import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function PagoExito() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const slug = searchParams.get("slug");

  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);

  // Poll enrollment hasta que el webhook lo cree (máx ~15s)
  useEffect(() => {
    if (!user || !slug) {
      setChecking(false);
      return;
    }

    let attempts = 0;
    const MAX = 8;

    const poll = async () => {
      attempts++;

      const { data: courseRow } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!courseRow) {
        setChecking(false);
        return;
      }

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseRow.id)
        .is("revoked_at", null)
        .maybeSingle();

      if (enrollment) {
        setEnrolled(true);
        setChecking(false);
      } else if (attempts < MAX) {
        setTimeout(poll, 2000);
      } else {
        setChecking(false);
      }
    };

    poll();
  }, [user, slug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader variant="public" />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Icono animado */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-5xl font-black leading-tight">
              ¡Pago completado!
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tu acceso al curso ha sido activado.<br />
              Ya puedes empezar a aprender.
            </p>
          </div>

          {/* CTA según estado de matrícula */}
          {checking ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Activando tu acceso…</span>
            </div>
          ) : enrolled && slug ? (
            <Link
              to={`/alumno/curso/${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary-glow transition text-sm"
            >
              Ir al curso ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/alumno"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary-glow transition text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Ver mis cursos
            </Link>
          )}

          {/* Garantía */}
          <div className="bg-surface rounded-2xl p-5 text-sm text-muted-foreground space-y-1.5">
            <p className="font-bold text-foreground">¿Algún problema?</p>
            <p>
              Tienes 30 días de garantía. Si el curso no es lo que esperabas,
              escríbenos y te reembolsamos sin preguntas.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
