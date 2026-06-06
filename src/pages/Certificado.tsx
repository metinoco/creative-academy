import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, AlertCircle, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface CertificateData {
  recipient_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  verification_code: string;
  pdf_url: string | null;
}

const Certificado = () => {
  const { codigo } = useParams<{ codigo: string }>();

  const { data: cert, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["verify-certificate", codigo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_certificate_by_code", {
        _code: codigo!,
      });
      if (error) throw error;
      return (data?.[0] ?? null) as CertificateData | null;
    },
    enabled: !!codigo,
  });

  const formattedDate = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader variant="public" />

      <main className="flex-1 container py-14 max-w-2xl">

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-28">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-muted-foreground">Verificando certificado…</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-28">
            <AlertCircle className="w-14 h-14 text-destructive/40 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black mb-2">Error al verificar</h1>
            <p className="text-muted-foreground text-sm">No se pudo acceder al sistema de verificación.</p>
          </div>
        )}

        {/* Not found */}
        {isSuccess && cert === null && (
          <div className="text-center py-28">
            <AlertCircle className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black mb-2">Certificado no encontrado</h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
              El código <span className="font-mono font-bold text-foreground">{codigo}</span> no corresponde
              a ningún certificado emitido por Academia Creativa.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold hover:bg-primary-glow transition"
            >
              Ir al inicio
            </Link>
          </div>
        )}

        {/* Certificate found */}
        {cert && (
          <div className="space-y-6">

            {/* Verification badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-4">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-green-700 text-sm">Certificado auténtico verificado</p>
                <p className="text-green-700/70 text-xs mt-0.5">
                  Emitido oficialmente por Academia Creativa el {formattedDate}.
                </p>
              </div>
            </div>

            {/* Certificate card */}
            <div className="rounded-[2rem] border-2 border-primary/25 bg-card overflow-hidden shadow-sm">

              {/* Header */}
              <div className="bg-ink px-8 py-7 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    Academia Creativa
                  </span>
                  <h1 className="font-display text-3xl font-black text-ink-foreground mt-1">
                    Certificado de Finalización
                  </h1>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-12 text-center space-y-5">
                <div>
                  <p className="text-muted-foreground text-sm">Otorgado a</p>
                  <h2 className="font-display text-4xl font-black mt-2 leading-tight">
                    {cert.recipient_name}
                  </h2>
                </div>

                <div className="w-20 h-px bg-border mx-auto" />

                <div>
                  <p className="text-muted-foreground text-sm">
                    por completar satisfactoriamente el curso
                  </p>
                  <h3 className="font-display text-2xl font-black mt-2 text-primary leading-tight">
                    {cert.course_title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1.5">
                    Impartido por{" "}
                    <span className="font-bold text-foreground">{cert.instructor_name}</span>
                  </p>
                </div>

                {/* Meta row */}
                <div className="pt-4 flex flex-wrap items-start justify-center gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Fecha de emisión
                    </p>
                    <p className="font-bold text-sm mt-1">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Código de verificación
                    </p>
                    <p className="font-mono font-bold text-sm mt-1 text-primary tracking-widest">
                      {cert.verification_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Award seal */}
              <div className="flex justify-center pb-8">
                <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center shadow-sm">
                  <Award className="w-8 h-8 text-ink" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {cert.pdf_url && (
                <a
                  href={cert.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold hover:bg-primary-glow transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </a>
              )}
              <Link
                to="/cursos"
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3 text-sm font-bold hover:border-primary transition"
              >
                <ExternalLink className="w-4 h-4" />
                Ver cursos
              </Link>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground">
              Este certificado fue emitido automáticamente al completar el 100% del contenido del curso
              en la plataforma de Academia Creativa.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Certificado;
