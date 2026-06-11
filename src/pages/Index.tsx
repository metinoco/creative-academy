import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Star, Play, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";

const imageBySlug = Object.fromEntries(staticCourses.map((c) => [c.id, c.image]));

interface LandingCourse {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  author: string | null;
  image_url: string | null;
  duration_text: string | null;
  lessons_count: number;
  price: number;
  reviews_count: number;
}

const Index = () => {
  const { user, role } = useAuth();
  const panelHref = role === "admin" ? "/admin" : "/alumno";

  const { data, isLoading } = useQuery({
    queryKey: ["courses-landing"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("courses")
        .select(
          "id, slug, title, category, author, image_url, duration_text, lessons_count, price, reviews_count",
          { count: "exact" }
        )
        .eq("status", "published")
        .order("reviews_count", { ascending: false })
        .limit(6);
      if (error) throw error;
      return { courses: (data ?? []) as LandingCourse[], total: count ?? 0 };
    },
  });

  const featured = data?.courses ?? [];
  const courseCount = data?.total ?? 0;
  const countLabel = courseCount > 0 ? `${courseCount} cursos disponibles` : "16 cursos disponibles";
  const catalogLabel = courseCount > 0 ? `${courseCount} cursos` : "16 cursos";

  const img = (c: LandingCourse) => c.image_url ?? imageBySlug[c.slug] ?? "";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      {/* HERO ASIMÉTRICO */}
      <section className="container min-h-[calc(100vh-5rem)] flex flex-col justify-center py-10">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Big text block */}
          <div className="lg:col-span-7 relative">
            <div className="bg-ink text-ink-foreground rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden h-full">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-secondary/30 blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 backdrop-blur px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  {countLabel}
                </span>

                <h1 className="mt-8 font-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[0.9] font-black">
                  Crea.
                  <br />
                  <span className="text-primary">Diseña.</span>
                  <br />
                  <span className="text-secondary italic">Repite.</span>
                </h1>

                <p className="mt-8 text-base md:text-lg text-ink-foreground/70 max-w-md leading-relaxed">
                  Cursos online de diseño gráfico, branding e ilustración. Impartidos por profesionales que viven de esto.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  {!user ? (
                    <Link to="/registro" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-bold hover:bg-primary-glow transition">
                      Empezar a crear <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link to={panelHref} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-bold hover:bg-primary-glow transition">
                        Ver mi panel <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <Link to="/cursos" className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 backdrop-blur px-7 py-4 text-sm font-bold hover:bg-ink-foreground/20 transition">
                        Explorar cursos
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column stack */}
          <div className="lg:col-span-5 grid grid-rows-2 gap-6">
            <div className="bg-secondary rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-black leading-none text-ink/10 select-none">12K</div>
              <div className="relative">
                <div className="flex -space-x-3">
                  {["bg-primary", "bg-ink", "bg-primary-glow", "bg-card"].map((b, i) => (
                    <div key={i} className={`w-12 h-12 rounded-full ring-4 ring-secondary ${b}`} />
                  ))}
                </div>
                <div className="mt-6 font-display text-5xl font-black text-ink leading-none">12.400</div>
                <div className="mt-2 text-sm font-bold text-ink/70 uppercase tracking-wider">Alumnos creando</div>
              </div>
            </div>

            <div className="bg-card border-2 border-ink rounded-[2.5rem] p-8 relative overflow-hidden">
              <Star className="w-7 h-7 fill-secondary text-secondary" />
              <div className="mt-4 font-display text-6xl font-black leading-none">4,9<span className="text-primary">/5</span></div>
              <div className="mt-3 text-md text-muted-foreground">
                Más de 3.200 valoraciones reales de alumnos que han terminado un curso.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE STRIP */}
      <section className="bg-primary text-primary-foreground py-5 -rotate-1 mx-[-2vw] overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap font-display text-2xl font-black uppercase tracking-tight">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              {["Branding", "★", "Ilustración", "★", "Motion", "★", "Tipografía", "★", "Editorial", "★", "Social", "★"].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO BENTO */}
      <section className="container pt-24 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/30 text-ink text-[10px] font-black uppercase tracking-widest">
              Catálogo · {catalogLabel}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl md:text-6xl font-black leading-[0.95]">
              Elige tu próxima<br /><span className="text-primary italic">obsesión creativa</span>.
            </h2>
          </div>
          <Link to="/cursos" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-5 py-3 text-sm font-bold hover:bg-ink hover:text-ink-foreground transition self-start">
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* BENTO GRID */}
        {isLoading ? (
          <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(0,1fr)]">
            <div className="col-span-12 md:col-span-7 row-span-2 rounded-[2rem] bg-muted animate-pulse min-h-[420px]" />
            <div className="col-span-12 md:col-span-5 rounded-[2rem] bg-muted animate-pulse min-h-[200px]" />
            <div className="col-span-12 md:col-span-5 rounded-[2rem] bg-muted animate-pulse min-h-[200px]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="col-span-12 sm:col-span-6 md:col-span-4 rounded-[2rem] bg-muted animate-pulse min-h-[280px]" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(0,1fr)]">
            {/* Featured big */}
            <Link to={`/curso/${featured[0].slug}`} className="col-span-12 md:col-span-7 row-span-2 group relative overflow-hidden rounded-[2rem] bg-ink min-h-[420px]">
              <img src={img(featured[0])} alt={featured[0].title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">Destacado</span>
                <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur text-ink text-[10px] font-bold uppercase">{featured[0].category}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-ink-foreground">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-4xl md:text-5xl font-black leading-tight">{featured[0].title}</h3>
                    <p className="mt-3 text-sm text-ink-foreground/70">
                      por {featured[0].author} · {featured[0].lessons_count} lecciones{featured[0].duration_text ? ` · ${featured[0].duration_text}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-4xl font-black">{featured[0].price}€</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      <Play className="w-3 h-3 fill-current" /> Empezar
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Two stacked cards right */}
            {featured.slice(1, 3).map((c, i) => (
              <Link key={c.id} to={`/curso/${c.slug}`} className="col-span-12 md:col-span-5 group relative overflow-hidden rounded-[2rem] bg-card border-2 border-ink hover:bg-ink hover:text-ink-foreground transition min-h-[200px]">
                <div className="flex h-full">
                  <div className="w-2/5 relative overflow-hidden">
                    <img src={img(c)} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{c.category}</span>
                      <h3 className="mt-2 font-display text-xl font-black leading-tight">{c.title}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-display text-2xl font-black">{c.price}€</div>
                      <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition" />
                    </div>
                  </div>
                </div>
                {i === 0 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-secondary text-ink text-[9px] font-black uppercase">Nuevo</span>
                )}
              </Link>
            ))}

            {/* Bottom row of 3 */}
            {featured.slice(3, 6).map((c) => (
              <Link key={c.id} to={`/curso/${c.slug}`} className="col-span-12 sm:col-span-6 md:col-span-4 group rounded-[2rem] overflow-hidden bg-card border-2 border-ink transition hover:-translate-y-1">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={img(c)} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-card text-ink">
                    {c.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-black leading-tight">{c.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="opacity-70">{c.lessons_count} lecciones</span>
                    <span className="font-display text-xl font-black">{c.price}€</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* WHY US — STRIP DE NÚMEROS */}
      <section className="container pb-24">
        <div className="bg-secondary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-6 right-6">
            <Zap className="w-12 h-12 text-ink" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-ink leading-[0.95] max-w-2xl">
            Por qué la gente <span className="italic">vuelve</span> a Academia Creativa.
          </h2>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Acceso de por vida", d: "Compras una vez. Es tuyo para siempre." },
              { n: "02", t: "Profes en activo", d: "Trabajan con marcas reales todos los días." },
              { n: "03", t: "Certificado oficial", d: "Verificable y descargable al completar." },
              { n: "04", t: "Comunidad privada", d: "Feedback real, no likes vacíos." },
            ].map((f) => (
              <div key={f.n} className="border-t-2 border-ink pt-5">
                <div className="font-display text-5xl font-black text-ink/30">{f.n}</div>
                <div className="mt-3 font-display text-xl font-black text-ink">{f.t}</div>
                <div className="mt-2 text-sm text-ink/70">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
