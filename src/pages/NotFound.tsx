import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Logo from "@/components/Logo";
import img404 from "@/assets/3d-404.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">

      {/* Blobs móvil */}
      <div aria-hidden className="lg:hidden absolute -top-28 -right-20 w-80 h-80 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
      <div aria-hidden className="lg:hidden absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-secondary/[0.12] blur-3xl pointer-events-none" />

      {/* ── LEFT — imagen ── */}
      <aside className="hidden lg:block relative overflow-hidden">
        <img
          src={img404}
          alt="Artista de arcilla en pánico junto a una escultura rota"
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
        {/* Degradado sutil en el borde derecho para fundir con el panel de contenido */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </aside>

      {/* ── RIGHT — contenido ── */}
      <main className="flex flex-col justify-center items-center px-6 sm:px-12 py-12 text-center">

        {/* Logo — solo visible en móvil */}
        <div className="lg:hidden mb-10 self-start">
          <Logo />
        </div>

        {/* Imagen compacta en móvil */}
        <div className="lg:hidden mb-8 w-64 rounded-3xl overflow-hidden shadow-card">
          <img
            src={img404}
            alt="Artista de arcilla en pánico"
            className="w-full h-auto object-cover"
            draggable={false}
          />
        </div>

        <div className="max-w-md w-full">

          {/* Badge */}
          <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground mb-6">
            Error 404
          </span>

          {/* Título */}
          <h1
            className="text-4xl md:text-5xl font-black leading-tight text-foreground mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Ooops!! Esta página se perdió en el cosmos creativo
          </h1>

          {/* Subtexto */}
          <p className="text-base leading-relaxed text-muted-foreground mb-10 max-w-sm mx-auto">
            Parece que esta ruta no existe… pero tu creatividad sí.
            Vuelve al inicio y sigue explorando.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
            >
              Volver al inicio
            </Link>
            <Link
              to="/cursos"
              className="inline-flex items-center rounded-full bg-foreground px-8 py-3.5 text-sm font-bold text-background transition-all hover:bg-foreground/85 active:scale-95"
            >
              Ver el catálogo
            </Link>
          </div>

        </div>

        {/* Footer del panel */}
        <p className="mt-16 text-xs text-muted-foreground/60 hidden lg:block">
          © 2026 Academia Creativa
        </p>
      </main>

    </div>
  );
};

export default NotFound;
