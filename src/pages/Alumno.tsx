import { Link } from "react-router-dom";
import { Flame, Clock, Award, ArrowRight, Play, BookOpen, TrendingUp } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";

const inProgress = [
  { ...courses[0], moduleName: "Módulo 3 · Sistema cromático", progress: 62, completed: 30 },
  { ...courses[1], moduleName: "Módulo 1 · Familias tipográficas", progress: 28, completed: 7 },
];

const Alumno = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="student" />

      <section className="container pt-12 pb-10">
        <span className="text-sm text-muted-foreground">Panel de alumno</span>
        <h1 className="mt-2 font-display text-5xl md:text-6xl leading-tight">
          Hola, María. <span className="text-muted-foreground italic">Continúa aprendiendo</span>
        </h1>
      </section>

      {/* STATS */}
      <section className="container">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Flame, label: "Racha actual", value: "12 días", tone: "bg-primary/10 text-primary" },
            { icon: Clock, label: "Tiempo esta semana", value: "4 h 35 min", tone: "bg-secondary/30 text-ink" },
            { icon: Award, label: "Certificados", value: "2 obtenidos", tone: "bg-ink text-ink-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-3xl border border-border/60 p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl grid place-items-center ${s.tone}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="font-display text-2xl mt-0.5">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IN PROGRESS */}
      <section className="container pt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Mis cursos</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">En progreso</h2>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {inProgress.map((c) => (
            <article key={c.id} className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-soft hover:shadow-card transition group">
              <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 aspect-video sm:aspect-auto shrink-0 overflow-hidden bg-muted">
                  <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 grid place-items-center bg-ink/20 opacity-0 group-hover:opacity-100 transition">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-5 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{c.category}</span>
                  <h3 className="font-display text-xl leading-tight">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.moduleName}</p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{c.progress}% completado</span>
                      <span className="text-muted-foreground">{c.completed} / {c.lessons} lecciones</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-warm rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2 text-xs font-medium hover:bg-ink/90 transition">
                    Continuar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* RECOMENDED */}
      <section className="container pt-20">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Para ti</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Descubre más cursos</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {courses.slice(2, 5).map((c) => <CourseCard key={c.id} {...c} />)}
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="container pt-20">
        <div className="bg-gradient-ink rounded-3xl p-8 md:p-12 text-ink-foreground relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative grid md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              <TrendingUp className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-display text-3xl leading-tight">Tu actividad esta semana</h3>
              <p className="text-sm text-ink-foreground/70 mt-2">Has dedicado <span className="text-secondary font-semibold">4h 35min</span> a tu desarrollo creativo.</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-7 gap-2 items-end h-32">
              {[40, 65, 30, 80, 55, 95, 70].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-glow" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-ink-foreground/50 uppercase">{["L","M","X","J","V","S","D"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Alumno;
