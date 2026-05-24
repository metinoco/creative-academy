import { Link } from "react-router-dom";
import { Flame, Clock, Play, Calendar, Target, ArrowUpRight, Trophy, MessageCircle, Bookmark, BookOpen, AlertCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { courses } from "@/data/courses";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STREAK_DAYS = 28;
const WEEK_TIME = "9h12";

const Alumno = () => {
  const { profile, user } = useAuth();

  const { data: enrolledProgress = [], isLoading: loadingProgress, isError: errorProgress, refetch: refetchProgress } = useQuery({
    queryKey: ["enrolled-progress", user?.id],
    queryFn: async () => {
      // 1. Matrículas activas
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, granted_at")
        .eq("user_id", user!.id)
        .is("revoked_at", null);

      if (!enrollments?.length) return [];
      const courseIds = enrollments.map((e) => e.course_id);

      // 2. Datos del curso (slug para navegar)
      const { data: dbCourses } = await supabase
        .from("courses")
        .select("id, slug, title, category")
        .in("id", courseIds);

      // 3. Total de lecciones por curso
      const { data: allLessons } = await supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds);

      // 4. Lecciones completadas por el alumno
      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id, course_id")
        .eq("user_id", user!.id)
        .in("course_id", courseIds);

      return enrollments.map((enrollment) => {
        const dbCourse = dbCourses?.find((c) => c.id === enrollment.course_id);
        const staticCourse = courses.find((c) => c.id === dbCourse?.slug);
        const total = allLessons?.filter((l) => l.course_id === enrollment.course_id).length ?? 0;
        const completed = progressRows?.filter((p) => p.course_id === enrollment.course_id).length ?? 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          courseId: enrollment.course_id,
          slug: dbCourse?.slug ?? "",
          title: dbCourse?.title ?? staticCourse?.title ?? "",
          category: dbCourse?.category ?? staticCourse?.category ?? "",
          image: staticCourse?.image,
          progress,
          completed,
          total,
        };
      });
    },
    enabled: !!user?.id,
  });

  const totalLessons = enrolledProgress.reduce((s, c) => s + c.total, 0);
  const completedLessons = enrolledProgress.reduce((s, c) => s + c.completed, 0);
  const globalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = enrolledProgress.filter((c) => c.total > 0 && c.completed === c.total).length;

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Carlos";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="student" />

      {/* HEADER + STATS BENTO */}
      <section className="container pt-10 pb-12">
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Greeting card */}
          <div className="lg:col-span-7 bg-ink text-ink-foreground rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <span className="text-xs font-black uppercase tracking-widest text-secondary">Tu panel · Lunes</span>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9]">
                Hola,<br />
                <span className="text-primary">{firstName}</span> 👋
              </h1>
              <p className="mt-5 text-ink-foreground/70 max-w-md">
                Llevas <b className="text-secondary">{STREAK_DAYS} días seguidos</b> aprendiendo. No la rompas hoy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={`/alumno/curso/${enrolledProgress[0]?.slug}`} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold hover:bg-primary-glow transition">
                  <Play className="w-4 h-4 fill-current" /> Continuar curso
                </Link>
                <Link to="/cursos" className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 backdrop-blur px-6 py-3 text-sm font-bold hover:bg-ink-foreground/20 transition">
                  Explorar más
                </Link>
              </div>
            </div>
          </div>

          {/* Stats grid (2x2) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-5">
            <div className="bg-primary text-primary-foreground rounded-[2rem] p-5 relative overflow-hidden">
              <Flame className="w-7 h-7" />
              <div className="font-display text-5xl font-black mt-3 leading-none">{STREAK_DAYS}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-80">días de racha</div>
            </div>
            <div className="bg-secondary text-ink rounded-[2rem] p-5 relative overflow-hidden">
              <Clock className="w-7 h-7" />
              <div className="font-display text-5xl font-black mt-3 leading-none">{WEEK_TIME}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">esta semana</div>
            </div>
            <div className="bg-card border-2 border-ink rounded-[2rem] p-5">
              <Trophy className="w-7 h-7 text-primary" />
              <div className="font-display text-5xl font-black mt-3 leading-none">{completedCourses}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1 text-muted-foreground">cursos completados</div>
            </div>
            <div className="bg-surface rounded-[2rem] p-5">
              <Target className="w-7 h-7 text-primary" />
              <div className="font-display text-5xl font-black mt-3 leading-none">{globalProgress}%</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1 text-muted-foreground">
                {completedLessons}/{totalLessons} lecciones
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${globalProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IN PROGRESS — LISTA HORIZONTAL CON PROGRESO LATERAL */}
      <section className="container pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Tus cursos · {enrolledProgress.length.toString().padStart(2, "0")} activos
            </span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-black">Sigue donde lo dejaste</h2>
          </div>
        </div>

        {loadingProgress ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : errorProgress ? (
          <div className="rounded-3xl border-2 border-border bg-card p-14 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto mb-4" />
            <h3 className="font-display text-xl font-black mb-2">No pudimos cargar tus cursos</h3>
            <p className="text-muted-foreground text-sm mb-6">Revisa tu conexión e intenta de nuevo.</p>
            <button
              onClick={() => refetchProgress()}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 py-3 text-sm font-bold hover:border-ink transition"
            >
              Reintentar
            </button>
          </div>
        ) : enrolledProgress.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 grid place-items-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="font-display text-2xl font-black mb-3">¡Tu aventura creativa empieza aquí!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Explora el catálogo y encuentra el curso perfecto para ti. Más de 16 cursos de diseño, ilustración y branding te esperan.
            </p>
            <Link
              to="/cursos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-bold hover:bg-primary-glow transition"
            >
              Ver cursos disponibles <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledProgress.map((c, i) => (
              <article key={c.courseId} className="group bg-card border-2 border-border rounded-3xl overflow-hidden hover:border-primary transition">
                <div className="grid grid-cols-12 items-stretch">
                  {/* Big number */}
                  <div className="hidden md:flex col-span-1 items-center justify-center bg-surface">
                    <span className="font-display text-5xl font-black text-muted-foreground/40">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  {/* Image */}
                  <div className="col-span-12 md:col-span-3 relative aspect-video md:aspect-auto overflow-hidden bg-muted">
                    {c.image && (
                      <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="col-span-12 md:col-span-5 p-5 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{c.category}</span>
                    <h3 className="mt-1 font-display text-2xl font-black leading-tight">{c.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {c.completed === 0
                        ? "Sin empezar"
                        : c.completed === c.total
                        ? "Completado ✓"
                        : `${c.completed} lección${c.completed !== 1 ? "es" : ""} completada${c.completed !== 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {/* Progress + CTA */}
                  <div className="col-span-12 md:col-span-3 p-5 flex flex-col justify-center gap-3 bg-surface/40">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-3xl font-black">
                        {c.progress}<span className="text-base text-muted-foreground">%</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{c.completed}/{c.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-warm rounded-full transition-all duration-500" style={{ width: `${c.progress}%` }} />
                    </div>
                    <Link
                      to={`/alumno/curso/${c.slug}`}
                      className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-4 py-2.5 text-xs font-bold hover:bg-primary transition"
                    >
                      Continuar <Play className="w-3 h-3 fill-current" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ACHIEVEMENTS + CALENDAR */}
      <section className="container pb-16 grid lg:grid-cols-12 gap-5">
        {/* Achievements */}
        <div className="lg:col-span-7 bg-card border-2 border-border rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Logros</span>
              <h3 className="font-display text-3xl font-black mt-1">Tus medallas</h3>
            </div>
            <span className="text-xs text-muted-foreground">5 / 12 desbloqueadas</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { icon: "🔥", label: "Racha 7d", on: true },
              { icon: "⚡", label: "Racha 30d", on: false },
              { icon: "🎓", label: "Primer cert.", on: true },
              { icon: "🏆", label: "5 cursos", on: false },
              { icon: "🎨", label: "Branding pro", on: true },
              { icon: "✏️", label: "Ilustrador", on: true },
              { icon: "📐", label: "Tipográfico", on: true },
              { icon: "🚀", label: "Top 1%", on: false },
              { icon: "💬", label: "Comentarista", on: false },
              { icon: "⭐", label: "Reseña", on: false },
              { icon: "🎬", label: "Motion", on: false },
              { icon: "👑", label: "Maestro", on: false },
            ].map((a, i) => (
              <div key={i} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition ${
                a.on ? "bg-secondary border-ink" : "bg-surface border-transparent grayscale opacity-40"
              }`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[9px] font-bold text-center px-1 leading-tight">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar / activity dots */}
        <div className="lg:col-span-5 bg-ink text-ink-foreground rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <span className="text-xs font-black uppercase tracking-widest text-secondary">Actividad</span>
            <h3 className="font-display text-3xl font-black mt-1">Últimas 5 semanas</h3>

            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => {
                const intensity = Math.floor(Math.random() * 4);
                const colors = ["bg-ink-foreground/10", "bg-secondary/40", "bg-secondary/70", "bg-primary"];
                return <div key={i} className={`aspect-square rounded-md ${colors[intensity]}`} />;
              })}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-ink-foreground/60">
              <span>Menos</span>
              <div className="flex gap-1">
                {["bg-ink-foreground/10", "bg-secondary/40", "bg-secondary/70", "bg-primary"].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
              </div>
              <span>Más</span>
            </div>

            <div className="mt-6 pt-6 border-t border-ink-foreground/10 flex items-center justify-between">
              <div>
                <div className="font-display text-3xl font-black">42h</div>
                <div className="text-xs text-ink-foreground/60">total este mes</div>
              </div>
              <button className="rounded-full bg-secondary text-ink px-4 py-2 text-xs font-bold hover:bg-secondary/80 transition">
                Ver más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="container pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">Para ti</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-black">Pensados para tu nivel</h2>
          </div>
          <Link to="/cursos" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.slice(2, 6).map((c) => (
            <Link key={c.id} to={`/curso/${c.id}`} className="group bg-card rounded-2xl overflow-hidden border-2 border-border hover:border-primary transition">
              <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur grid place-items-center hover:bg-primary hover:text-primary-foreground transition">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{c.category}</span>
                <h3 className="mt-1 font-display text-base font-black leading-tight line-clamp-2">{c.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-xl font-black">{c.price}€</span>
                  <span className="text-xs text-muted-foreground">{c.lessons} lec.</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="container pb-24">
        <div className="bg-secondary rounded-[2.5rem] p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center relative overflow-hidden">
          <MessageCircle className="absolute -bottom-10 -right-10 w-64 h-64 text-ink/10" strokeWidth={1.5} />
          <div className="relative">
            <span className="text-xs font-black uppercase tracking-widest text-ink/70">Comunidad</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-black text-ink leading-[0.95]">
              No tienes que crear <span className="italic">en solitario</span>.
            </h2>
            <p className="mt-4 text-ink/70 max-w-md">
              Únete al canal privado de alumnos. 12K diseñadores compartiendo proyectos, briefings y feedback real.
            </p>
          </div>
          <div className="relative md:text-right">
            <button className="inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-7 py-4 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition">
              Entrar a la comunidad <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Alumno;
