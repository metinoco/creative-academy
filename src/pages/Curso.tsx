import { Link, useParams, Navigate } from "react-router-dom";
import { Clock, BookOpen, Star, Lock, Play, Award, Infinity, Users, Check, ArrowUpRight, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useState } from "react";
import { courses } from "@/data/courses";

const INSTRUCTOR_AVATARS: Record<string, string> = {
  "Andrés Mora":     "https://randomuser.me/api/portraits/men/32.jpg",
  "Pablo Soler":     "https://randomuser.me/api/portraits/men/14.jpg",
  "Tomás Vidal":     "https://randomuser.me/api/portraits/men/67.jpg",
  "Nicolás Prado":   "https://randomuser.me/api/portraits/men/45.jpg",
  "Joel Marín":      "https://randomuser.me/api/portraits/men/21.jpg",
  "Diego Aranda":    "https://randomuser.me/api/portraits/men/58.jpg",
  "Rubén Lago":      "https://randomuser.me/api/portraits/men/36.jpg",
  "Inés Calvo":      "https://randomuser.me/api/portraits/women/44.jpg",
  "Marina Reyes":    "https://randomuser.me/api/portraits/women/17.jpg",
  "Carla Ríos":      "https://randomuser.me/api/portraits/women/63.jpg",
  "Lucía Fernández": "https://randomuser.me/api/portraits/women/28.jpg",
  "Elena Sáez":      "https://randomuser.me/api/portraits/women/51.jpg",
  "Aitana Bosch":    "https://randomuser.me/api/portraits/women/9.jpg",
  "Sara Quintana":   "https://randomuser.me/api/portraits/women/72.jpg",
  "Marta Esteve":    "https://randomuser.me/api/portraits/women/35.jpg",
  "Clara Vives":     "https://randomuser.me/api/portraits/women/48.jpg",
};

const Curso = () => {
  const { id } = useParams<{ id: string }>();
  const course = courses.find((c) => c.id === id);

  const [openModule, setOpenModule] = useState(0);

  if (!course) {
    return <Navigate to="/cursos" replace />;
  }

  const instructorAvatar = INSTRUCTOR_AVATARS[course.author] ?? "https://randomuser.me/api/portraits/lego/1.jpg";
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="public" />

      {/* SPLIT HERO */}
      <section className="relative bg-ink text-ink-foreground overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/30 blur-3xl" />

        <div className="container relative pt-12 pb-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-8">
            <nav className="flex items-center gap-2 text-xs text-ink-foreground/60">
              <Link to="/" className="hover:text-secondary">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/cursos?categoria=${encodeURIComponent(course.category)}`} className="hover:text-secondary">{course.category}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-ink-foreground truncate max-w-[200px]">{course.title}</span>
            </nav>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
                {course.category}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-ink-foreground/10 text-ink-foreground text-[10px] font-bold uppercase tracking-widest">
                Nivel intermedio
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9]">
              {course.title.includes(":") ? (
                <>
                  {course.title.split(":")[0]}
                  <span className="text-primary">:</span>
                  <br />
                  <span className="italic text-secondary text-4xl md:text-5xl lg:text-6xl">
                    {course.title.split(":")[1].trim()}
                  </span>
                </>
              ) : (
                <span>{course.title}</span>
              )}
            </h1>

            <p className="text-lg text-ink-foreground/70 max-w-xl leading-relaxed">
              {course.description}
            </p>

            {/* META INLINE */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /><span>{course.duration}</span></div>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" /><span>{course.lessons} lecciones</span></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary fill-secondary" /><span><b>{course.rating}</b> · {course.reviews.toLocaleString("es-ES")} valoraciones</span></div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /><span>{(course.reviews * 9).toLocaleString("es-ES")} alumnos</span></div>
            </div>

            {/* INSTRUCTOR INLINE */}
            <div className="flex items-center gap-3 pt-2">
              <img
                src={instructorAvatar}
                alt={course.author}
                loading="lazy"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary"
              />
              <div className="text-sm">
                <div>Imparte <span className="font-bold">{course.author}</span></div>
                <div className="text-xs text-ink-foreground/60">{course.instructorTitle}</div>
              </div>
            </div>
          </div>

          {/* PRICE FLOATING CARD */}
          <div className="lg:col-span-5">
            <div className="bg-card text-foreground rounded-[2rem] overflow-hidden shadow-glow">
              <div className="relative aspect-video group cursor-pointer">
                <img src={course.image} alt={`Tráiler ${course.title}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink/30 grid place-items-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition shadow-glow">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur text-xs font-bold">Ver tráiler · 1:42</span>
              </div>

              <div className="p-7 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-black">{course.price}€</span>
                  <span className="text-base text-muted-foreground line-through">{course.originalPrice}€</span>
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-secondary text-ink text-[10px] font-black uppercase">-{discount}%</span>
                </div>

                <button className="w-full rounded-full bg-primary text-primary-foreground py-4 text-sm font-bold hover:bg-primary-glow transition">
                  Comprar ahora
                </button>
                <button className="w-full rounded-full border-2 border-ink py-4 text-sm font-bold hover:bg-ink hover:text-ink-foreground transition">
                  Añadir al carrito
                </button>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  {[
                    { i: Infinity, t: "De por vida" },
                    { i: Award, t: "Certificado" },
                    { i: Users, t: "Comunidad" },
                    { i: Check, t: "30d garantía" },
                  ].map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <f.i className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold">{f.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL LEARN */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Lo que vas a dominar</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black leading-[0.95]">
              Skills que vas a llevarte <span className="italic text-primary">a casa</span>.
            </h2>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
            {course.learns.map((skill, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border-2 border-border hover:border-primary transition">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0 font-black text-xs">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="text-sm font-medium leading-snug pt-0.5">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMARIO */}
      <section className="container pb-20">
        <div className="bg-surface rounded-[2.5rem] p-6 md:p-10">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Temario completo</span>
              <h2 className="mt-2 font-display text-4xl font-black">
                {course.modules.length} módulos · {course.lessons} lecciones
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">Las 2 primeras son gratis 👀</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Module tabs */}
            <div className="lg:col-span-4 space-y-2">
              {course.modules.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setOpenModule(i)}
                  className={`w-full text-left rounded-2xl p-5 transition border-2 ${
                    openModule === i
                      ? "bg-ink text-ink-foreground border-ink"
                      : "bg-card border-transparent hover:border-ink"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`font-display text-3xl font-black ${openModule === i ? "text-primary" : "text-muted-foreground"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="font-display text-lg font-black mt-1 leading-tight">{m.title}</div>
                      <div className={`text-xs mt-1 ${openModule === i ? "text-ink-foreground/60" : "text-muted-foreground"}`}>
                        {m.lessons} lecciones · {m.duration}
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 transition shrink-0 ${openModule === i ? "rotate-0 text-secondary" : "rotate-45"}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Lessons list */}
            <div className="lg:col-span-8 bg-card rounded-2xl p-2">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-xl font-black">{course.modules[openModule].title}</h3>
                <span className="text-xs text-muted-foreground">{course.modules[openModule].duration}</span>
              </div>
              <ul className="divide-y divide-border">
                {Array.from({ length: course.modules[openModule].lessons }, (_, i) => {
                  const isPreview = openModule === 0 && i < 2;
                  return (
                    <li key={i} className="flex items-center gap-4 px-4 py-4 hover:bg-surface/60 transition rounded-xl">
                      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${isPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {isPreview ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">
                          {String(i + 1).padStart(2, "0")} — {
                            i === 0 && openModule === 0 ? "Bienvenida y presentación del curso" :
                            i === 1 && openModule === 0 ? "Conceptos fundamentales (preview gratuito)" :
                            `Lección ${i + 1}`
                          }
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {isPreview ? "Acceso libre · Preview" : "Requiere compra"}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums font-bold">
                        {String(((i * 7 + openModule * 3) % 22) + 7).padStart(2, "0")}:{String(((i * 13 + 11) % 59) + 1).padStart(2, "0")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section className="container pb-24">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-secondary relative">
              <img src={instructorAvatar} alt={course.author} loading="lazy" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 rotate-3 shadow-card">
              <div className="font-display text-2xl font-black leading-none">
                {course.instructorBio.match(/(\d+) años/)?.[1] ?? "10"} años
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold">de experiencia</div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Quien imparte</span>
            <h2 className="font-display text-5xl md:text-6xl font-black leading-[0.95]">
              {course.author.split(" ")[0]}.<br />
              <span className="italic text-muted-foreground">Quien te lleva.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {course.instructorBio}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: String(Math.floor(course.lessons / 12) + 1), l: "cursos" },
                { v: (course.reviews * 9).toLocaleString("es-ES"), l: "alumnos" },
                { v: String(course.rating), l: "rating" },
              ].map((s) => (
                <div key={s.l} className="bg-surface rounded-2xl p-4">
                  <div className="font-display text-3xl font-black">{s.v}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="container pb-24">
        <div className="bg-ink text-ink-foreground rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-primary">¿Lista para empezar?</span>
            <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">
              Acceso de por vida.<br />
              <span className="text-secondary italic">Empieza cuando quieras.</span>
            </h2>
            <p className="text-ink-foreground/60 text-sm max-w-md">
              Sin fechas límite. Aprende a tu ritmo y vuelve al material las veces que necesites.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="font-display text-5xl font-black">
              {course.price}€
            </div>
            <button className="px-10 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary-glow transition text-sm whitespace-nowrap">
              Comprar ahora
            </button>
            <span className="text-xs text-ink-foreground/50">30 días de garantía · Sin compromisos</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Curso;
