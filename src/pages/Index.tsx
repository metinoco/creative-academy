import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Star, Quote } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";

const categories = ["Todos", "Diseño Gráfico", "Identidad de marca", "Animación", "Ilustración", "Tipografía", "Social media", "Editorial"];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="public" />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cream pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl" />

        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-medium shadow-soft border border-border/60">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Nueva temporada · 6 cursos disponibles
          </span>

          <h1 className="mt-8 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] text-balance max-w-5xl mx-auto">
            Aprende diseño,<br />
            branding e ilustración{" "}
            <span className="italic text-primary">a tu ritmo</span>
          </h1>

          <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Cursos creados por profesionales en activo. Acceso de por vida, certificado incluido y una comunidad que te acompaña en cada proyecto.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/curso" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:bg-primary/90 transition shadow-glow">
              Explorar catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/curso" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium hover:bg-surface transition">
              Ver curso destacado
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-primary", "bg-secondary", "bg-primary-glow", "bg-ink"].map((b, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ring-2 ring-background ${b}`} />
                ))}
              </div>
              <span className="font-medium">+12.400 alumnos creando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />)}</div>
              <span className="font-medium">4,9 en valoraciones</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="container py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Catálogo</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight max-w-2xl">
              Los mejor valorados por la comunidad
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Filtra por la disciplina que más te llame y empieza hoy mismo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm transition ${
                i === 0
                  ? "bg-ink text-ink-foreground"
                  : "bg-card border border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => <CourseCard key={c.id} {...c} />)}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-surface">
            Ver todo el catálogo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* CTA INK */}
      <section className="container">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-ink p-10 md:p-14 text-ink-foreground">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-4xl md:text-5xl leading-tight max-w-md">
                ¿Y si este es el año en que <span className="italic text-secondary">por fin</span> te dedicas a crear?
              </h3>
              <p className="mt-5 text-ink-foreground/70 max-w-md text-sm leading-relaxed">
                Empieza con cualquier curso desde 97€. Acceso de por vida, sin suscripciones, sin letra pequeña.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/alumno" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-medium hover:bg-primary-glow transition">
                Crear mi cuenta <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-24 md:py-32">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Lo que dicen nuestros alumnos</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Historias reales de gente que se atrevió a empezar
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Marta Reyes", role: "Diseñadora freelance · Madrid", quote: "El curso de Branding me ha dado por fin un método. He duplicado mis tarifas y trabajo con muchísima más seguridad ante mis clientes.", course: "Branding desde cero", initials: "MR" },
            { name: "Diego Aranda", role: "Director creativo · Valencia", quote: "Carla explica After Effects con una claridad brutal. En tres semanas estaba entregando piezas animadas a clientes reales.", course: "Motion Graphics", initials: "DA" },
            { name: "Lucía Bermejo", role: "Estudiante de Bellas Artes · Sevilla", quote: "Encontré mi propio estilo gracias a este curso. La comunidad es maravillosa y los feedback de Marina te empujan a salir de la zona de confort.", course: "Ilustración digital", initials: "LB" },
          ].map((t, i) => (
            <article key={i} className="bg-card rounded-3xl p-7 shadow-soft border border-border/40">
              <Quote className="w-7 h-7 text-primary mb-4" />
              <p className="text-foreground/90 leading-relaxed text-[15px]">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/60">
                <div className="w-11 h-11 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground font-semibold text-sm">{t.initials}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />)}</div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Curso · {t.course}</div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
