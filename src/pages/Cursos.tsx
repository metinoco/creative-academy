import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal, Star, SearchX, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";

// Slug → local image (los slugs de Supabase coinciden con los IDs de courses.ts)
const imageBySlug = Object.fromEntries(staticCourses.map((c) => [c.id, c.image]));

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  author: string | null;
  image_url: string | null;
  duration_text: string | null;
  lessons_count: number;
  rating: number | null;
  reviews_count: number;
  price: number;
}

const Cursos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"populares" | "precio" | "rating">("populares");

  const { data: allCourses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["courses-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, category, author, image_url, duration_text, lessons_count, rating, reviews_count, price")
        .eq("status", "published")
        .order("reviews_count", { ascending: false });
      if (error) throw error;
      return data as CourseRow[];
    },
  });

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(allCourses.map((c) => c.category ?? "").filter(Boolean)))],
    [allCourses]
  );

  const active = searchParams.get("categoria") ?? "Todos";

  const filtered = useMemo(() => {
    let list = allCourses.filter((c) => active === "Todos" || c.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.author ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "precio") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "populares") list = [...list].sort((a, b) => b.reviews_count - a.reviews_count);
    return list;
  }, [allCourses, active, query, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="public" />

      {/* HEADER */}
      <section className="container pt-12 pb-8">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/30 text-ink text-[10px] font-black uppercase tracking-widest">
              Catálogo · {allCourses.length} cursos
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl md:text-7xl font-black leading-[0.92]">
              Todos los cursos<br />
              <span className="italic text-primary">a un click</span>.
            </h1>
            <p className="mt-5 text-muted-foreground max-w-xl">
              Explora nuestra biblioteca creativa. Filtra por disciplina, ordena como quieras y empieza cuando te apetezca.
            </p>
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            {[
              { v: allCourses.length, l: "Cursos" },
              { v: categories.length - 1, l: "Disciplinas" },
              { v: "12K", l: "Alumnos" },
            ].map((s) => (
              <div key={s.l} className="bg-card border-2 border-ink rounded-2xl p-4 text-center">
                <div className="font-display text-3xl font-black">{s.v}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="container pb-8">
        <div className="bg-ink text-ink-foreground rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-foreground/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar curso o profesor..."
              className="w-full bg-ink-foreground/10 placeholder:text-ink-foreground/50 text-ink-foreground rounded-full pl-11 pr-4 py-3 text-sm border border-transparent transition-[border-color,box-shadow] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(14_78%_52%/0.12)]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-ink-foreground/60 mr-1 hidden sm:block" />
            {[
              { k: "populares", l: "Populares" },
              { k: "rating", l: "Mejor valorados" },
              { k: "precio", l: "Precio" },
            ].map((s) => (
              <button
                key={s.k}
                onClick={() => setSort(s.k as typeof sort)}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  sort === s.k
                    ? "bg-primary text-primary-foreground"
                    : "bg-ink-foreground/10 text-ink-foreground/70 hover:bg-ink-foreground/20"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchParams(cat === "Todos" ? {} : { categoria: cat })}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition ${
                active === cat
                  ? "bg-ink text-ink-foreground border-ink"
                  : "bg-card border-border hover:border-ink"
              }`}
            >
              {cat}
              {active === cat && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px]">
                  {cat === "Todos"
                    ? allCourses.length
                    : allCourses.filter((c) => c.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="container pb-20">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Cargando cursos…"
            ) : (
              <>
                <b className="text-foreground">{filtered.length}</b> cursos encontrados
              </>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-3xl overflow-hidden border-2 border-border animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded-lg w-3/4" />
                  <div className="h-3 bg-muted rounded-lg w-1/2" />
                  <div className="h-8 bg-muted rounded-lg w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-card border-2 border-border rounded-3xl p-16 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-black mb-2">No pudimos cargar el catálogo</h3>
            <p className="text-muted-foreground mb-8">Verifica tu conexión e intenta de nuevo.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-8 py-3 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface rounded-3xl p-16 text-center">
            <SearchX className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <div className="font-display text-3xl font-black mb-2">Sin resultados</div>
            <p className="text-muted-foreground mb-8">Prueba con otra disciplina o limpia los filtros.</p>
            <button
              onClick={() => { setQuery(""); setSearchParams({}); }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-8 py-3 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/curso/${c.slug}`}
                className="group bg-card rounded-3xl overflow-hidden border-2 border-border hover:border-ink transition flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                    src={c.image_url ?? imageBySlug[c.slug]}
                    alt={c.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-card/95 backdrop-blur text-ink text-[10px] font-black uppercase tracking-widest">
                    {c.category}
                  </span>
                  {c.rating && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ink/85 text-ink-foreground text-[10px] font-bold">
                      <Star className="w-2.5 h-2.5 fill-secondary text-secondary" />
                      {c.rating}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-lg font-black leading-tight line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">por {c.author}</p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border mt-4">
                    <div>
                      <div className="font-display text-2xl font-black">{c.price}€</div>
                      <div className="text-[10px] text-muted-foreground">
                        {c.lessons_count} lecciones
                        {c.duration_text ? ` · ${c.duration_text}` : ""}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-ink text-ink-foreground grid place-items-center group-hover:bg-primary transition">
                      <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
};

export default Cursos;
