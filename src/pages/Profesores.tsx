import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Star, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { courses } from "@/data/courses";

const INSTRUCTOR_AVATARS: Record<string, string> = {
  "Andrés Mora":     "https://i.pravatar.cc/600?img=12",
  "Pablo Soler":     "https://i.pravatar.cc/600?img=11",
  "Tomás Vidal":     "https://i.pravatar.cc/600?img=14",
  "Nicolás Prado":   "https://i.pravatar.cc/600?img=15",
  "Joel Marín":      "https://i.pravatar.cc/600?img=13",
  "Diego Aranda":    "https://i.pravatar.cc/600?img=33",
  "Rubén Lago":      "https://i.pravatar.cc/600?img=18",
  "Inés Calvo":      "https://i.pravatar.cc/600?img=47",
  "Marina Reyes":    "https://i.pravatar.cc/600?img=48",
  "Carla Ríos":      "https://i.pravatar.cc/600?img=49",
  "Lucía Fernández": "https://i.pravatar.cc/600?img=9",
  "Elena Sáez":      "https://i.pravatar.cc/600?img=44",
  "Aitana Bosch":    "https://i.pravatar.cc/600?img=25",
  "Sara Quintana":   "https://i.pravatar.cc/600?img=16",
  "Marta Esteve":    "https://i.pravatar.cc/600?img=5",
  "Clara Vives":     "https://i.pravatar.cc/600?img=45",
};

const TONE_RING: Record<string, string> = {
  warm:  "ring-primary",
  cream: "ring-secondary",
  sun:   "ring-secondary",
  ink:   "ring-ink",
};

const TONE_BADGE: Record<string, string> = {
  warm:  "bg-primary/15 text-primary",
  cream: "bg-secondary/40 text-ink",
  sun:   "bg-secondary/40 text-ink",
  ink:   "bg-ink/10 text-ink",
};

const instructors = courses.map((c) => ({
  name:          c.author,
  title:         c.instructorTitle,
  bio:           c.instructorBio,
  courseId:      c.id,
  courseTitle:   c.title,
  category:      c.category,
  tone:          c.tone,
  rating:        c.rating,
  reviews:       c.reviews,
  lessons:       c.lessons,
  avatarUrl:     INSTRUCTOR_AVATARS[c.author] ?? "",
}));

const categories = ["Todos", ...Array.from(new Set(instructors.map((i) => i.category)))];

const Profesores = () => {
  const [active, setActive] = useState("Todos");

  const filtered = useMemo(
    () => active === "Todos" ? instructors : instructors.filter((i) => i.category === active),
    [active],
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader variant="public" />

      {/* HERO — fills the viewport so the filter is below the fold */}
      <section className="container flex flex-col justify-center" style={{ minHeight: "calc(100dvh - 5rem)" }}>
        <div className="grid lg:grid-cols-12 gap-6 items-stretch py-8 md:py-12">
          {/* Heading block */}
          <div className="lg:col-span-8 bg-ink text-ink-foreground rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <span className="inline-block px-3 py-1.5 rounded-full bg-ink-foreground/10 text-[10px] font-black uppercase tracking-widest">
                {instructors.length} profesores · En activo
              </span>
              <h1 className="mt-6 md:mt-8 font-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[6rem] font-black leading-[0.88]">
                Los que<br />
                <span className="text-primary">viven</span> de<br />
                <span className="text-secondary italic">esto.</span>
              </h1>
              <p className="mt-6 md:mt-8 text-sm md:text-lg text-ink-foreground/70 max-w-lg leading-relaxed">
                Cada profesor de Academia Creativa es un profesional en activo. No teóricos: gente que trabaja con marcas, editoriales, estudios y clientes reales.
              </p>
            </div>
          </div>

          {/* Stats — horizontal on mobile, vertical stack on desktop */}
          <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 lg:grid-rows-3 gap-4 lg:gap-5">
            <div className="bg-secondary rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-7 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 text-[6rem] font-black leading-none text-ink/10 select-none hidden lg:block">16</div>
              <div className="relative">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-ink mb-2 lg:mb-3" />
                <div className="font-display text-3xl lg:text-4xl font-black text-ink leading-none">16</div>
                <div className="mt-1 text-[9px] lg:text-xs font-black uppercase tracking-wider text-ink/60">Instructores</div>
              </div>
            </div>

            <div className="bg-card border-2 border-ink rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-7">
              <Star className="w-5 h-5 lg:w-6 lg:h-6 fill-secondary text-secondary mb-2 lg:mb-3" />
              <div className="font-display text-3xl lg:text-4xl font-black leading-none">4,8<span className="text-primary">/5</span></div>
              <div className="mt-1 text-[9px] lg:text-xs font-black uppercase tracking-wider text-muted-foreground">Val. media</div>
            </div>

            <div className="bg-primary text-primary-foreground rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-7">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 mb-2 lg:mb-3 opacity-80" />
              <div className="font-display text-3xl lg:text-4xl font-black leading-none">16</div>
              <div className="mt-1 text-[9px] lg:text-xs font-black uppercase tracking-wider opacity-70">Disciplinas</div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCIPLINE FILTER */}
      <section className="container pb-10">
        <div className="bg-ink rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-ink-foreground/10 text-ink-foreground/70 hover:bg-ink-foreground/20"
              }`}
            >
              {cat}
              {active === cat && (
                <span className="ml-2 opacity-70">
                  {cat === "Todos" ? instructors.length : instructors.filter((i) => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* INSTRUCTOR GRID */}
      <section className="container pb-16 md:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((instructor) => (
            <div
              key={instructor.name}
              className="group bg-card border-2 border-border hover:border-ink rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
            >
              {/* Photo */}
              <div className="relative p-4 md:p-6 pb-0 flex justify-center">
                <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full ring-4 ${TONE_RING[instructor.tone]} overflow-hidden bg-muted flex-shrink-0`}>
                  <img
                    src={instructor.avatarUrl}
                    alt={instructor.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Rating badge */}
                <span className="absolute top-3 right-3 md:top-5 md:right-5 inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-ink/85 text-ink-foreground text-[9px] md:text-[10px] font-bold">
                  <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-secondary text-secondary" />
                  {instructor.rating}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="text-center">
                  <h2 className="font-display text-base md:text-xl font-black leading-tight">{instructor.name}</h2>
                  <p className="mt-1 text-[10px] md:text-xs text-muted-foreground leading-snug">{instructor.title}</p>
                </div>

                <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 hidden sm:block">
                  {instructor.bio}
                </p>

                {/* Stats row */}
                <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-[10px] md:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {instructor.lessons} lec.
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(instructor.reviews * 9).toLocaleString("es-ES")} alum.
                  </span>
                </div>

                {/* Course chip */}
                <div className="mt-auto pt-3 md:pt-5 border-t border-border mt-3 md:mt-5">
                  <div className="mb-1.5 md:mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${TONE_BADGE[instructor.tone]}`}>
                      {instructor.category}
                    </span>
                  </div>
                  <Link
                    to={`/curso/${instructor.courseId}`}
                    className="flex items-start justify-between gap-1 md:gap-2 group/link"
                  >
                    <span className="text-xs md:text-sm font-bold leading-tight line-clamp-2 group-hover/link:text-primary transition">
                      {instructor.courseTitle}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5 group-hover/link:rotate-45 transition text-muted-foreground group-hover/link:text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="container pb-16 md:pb-24">
        <div className="bg-secondary rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-ink/10 text-ink text-[10px] font-black uppercase tracking-widest">
              Para creadores
            </span>
            <h2 className="mt-4 md:mt-5 font-display text-3xl md:text-5xl font-black text-ink leading-[0.95]">
              ¿Enseñas algo<br />
              <span className="italic">increíble</span>?
            </h2>
            <p className="mt-3 md:mt-4 text-sm text-ink/70 max-w-md leading-relaxed">
              Si eres profesional en activo y quieres compartir tu disciplina con miles de alumnos, nos encantaría conocer tu propuesta.
            </p>
          </div>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-6 md:px-8 py-3.5 md:py-4 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition flex-shrink-0 self-start md:self-auto"
          >
            Propón tu curso <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Profesores;
