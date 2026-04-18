import { Link } from "react-router-dom";
import { Clock, BookOpen, Star, Lock, Play, Award, Infinity, Users, Check, ArrowUpRight, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import branding from "@/assets/course-branding.jpg";
import lauraImg from "@/assets/avatar-laura.jpg";
import { useState } from "react";

const modules = [
  { title: "Fundamentos del branding", duration: "2h 15min", lessons: [
    { name: "Bienvenida y mapa del curso", duration: "04:12", preview: true },
    { name: "Qué es (y qué no es) una marca", duration: "12:45", preview: true },
    { name: "Investigación y posicionamiento", duration: "18:20" },
    { name: "Mood boards estratégicos", duration: "15:08" },
  ]},
  { title: "Identidad visual", duration: "3h 40min", lessons: [
    { name: "Sistema de logotipo", duration: "22:10" },
    { name: "Construcción tipográfica", duration: "19:45" },
    { name: "Sistema cromático", duration: "16:30" },
    { name: "Iconografía y patrones", duration: "14:22" },
  ]},
  { title: "Aplicación y manual", duration: "4h 50min", lessons: [
    { name: "Manual de marca completo", duration: "28:50" },
    { name: "Plantillas de papelería", duration: "21:15" },
    { name: "Marca en redes sociales", duration: "17:40" },
  ]},
];

const Curso = () => {
  const [openModule, setOpenModule] = useState(0);

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
              <Link to="/" className="hover:text-secondary">Identidad de marca</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-ink-foreground">Branding desde cero</span>
            </nav>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">Identidad de marca</span>
              <span className="px-3 py-1.5 rounded-full bg-ink-foreground/10 text-ink-foreground text-[10px] font-bold uppercase tracking-widest">Nivel intermedio</span>
            </div>

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9]">
              Branding<br />
              <span className="text-primary">desde</span> <span className="italic text-secondary">cero</span>.
            </h1>

            <p className="text-lg text-ink-foreground/70 max-w-xl leading-relaxed">
              Aprende a construir marcas memorables: del briefing al manual final. Con plantillas reales que vas a poder reutilizar en tus proyectos.
            </p>

            {/* META INLINE */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /><span>12 h 45 min</span></div>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" /><span>48 lecciones</span></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary fill-secondary" /><span><b>4,9</b> · 1.284 valoraciones</span></div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /><span>12.400 alumnos</span></div>
            </div>

            {/* PROFESOR INLINE */}
            <div className="flex items-center gap-3 pt-2">
              <img src={lauraImg} alt="Andrés Mora" loading="lazy" width={48} height={48} className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary" />
              <div className="text-sm">
                <div>Imparte <span className="font-bold">Andrés Mora</span></div>
                <div className="text-xs text-ink-foreground/60">Director creativo · Estudio Mora & Co.</div>
              </div>
            </div>
          </div>

          {/* PRICE FLOATING CARD */}
          <div className="lg:col-span-5">
            <div className="bg-card text-foreground rounded-[2rem] overflow-hidden shadow-glow">
              <div className="relative aspect-video group cursor-pointer">
                <img src={branding} alt="Tráiler curso" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink/30 grid place-items-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition shadow-glow">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur text-xs font-bold">Ver tráiler · 1:42</span>
              </div>

              <div className="p-7 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-black">197€</span>
                  <span className="text-base text-muted-foreground line-through">247€</span>
                  <span className="ml-auto px-2.5 py-1 rounded-full bg-secondary text-ink text-[10px] font-black uppercase">-20%</span>
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
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
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

      {/* WHAT YOU'LL LEARN — CHIPS */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Lo que vas a dominar</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black leading-[0.95]">
              Skills que vas a llevarte <span className="italic text-primary">a casa</span>.
            </h2>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
            {[
              "Construir un briefing sólido con cualquier cliente",
              "Diseñar sistemas de logotipo escalables",
              "Crear paletas cromáticas con estrategia",
              "Elegir y combinar tipografías profesionales",
              "Documentar marcas en un manual completo",
              "Justificar cada decisión visual al cliente",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border-2 border-border hover:border-primary transition">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0 font-black text-xs">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="text-sm font-medium leading-snug pt-0.5">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMARIO — TABS LATERALES */}
      <section className="container pb-20">
        <div className="bg-surface rounded-[2.5rem] p-6 md:p-10">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Temario completo</span>
              <h2 className="mt-2 font-display text-4xl font-black">3 módulos · 11 lecciones de muestra</h2>
            </div>
            <span className="text-sm text-muted-foreground">Las 2 primeras son gratis 👀</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Module tabs */}
            <div className="lg:col-span-4 space-y-2">
              {modules.map((m, i) => (
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
                        0{i + 1}
                      </div>
                      <div className="font-display text-lg font-black mt-1 leading-tight">{m.title}</div>
                      <div className={`text-xs mt-1 ${openModule === i ? "text-ink-foreground/60" : "text-muted-foreground"}`}>
                        {m.lessons.length} lecciones · {m.duration}
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 transition ${openModule === i ? "rotate-0 text-secondary" : "rotate-45"}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Lessons list */}
            <div className="lg:col-span-8 bg-card rounded-2xl p-2">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-xl font-black">{modules[openModule].title}</h3>
                <span className="text-xs text-muted-foreground">{modules[openModule].duration}</span>
              </div>
              <ul className="divide-y divide-border">
                {modules[openModule].lessons.map((l, i) => (
                  <li key={i} className="flex items-center gap-4 px-4 py-4 hover:bg-surface/60 transition rounded-xl">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${l.preview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {l.preview ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{String(i + 1).padStart(2, "0")} — {l.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {l.preview ? "Acceso libre · Preview" : "Requiere compra"}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums font-bold">{l.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESOR BLOCK */}
      <section className="container pb-24">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-secondary relative">
              <img src={lauraImg} alt="Andrés Mora" loading="lazy" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 rotate-3 shadow-card">
              <div className="font-display text-2xl font-black leading-none">15 años</div>
              <div className="text-[10px] uppercase tracking-widest font-bold">de experiencia</div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Tu profesor</span>
            <h2 className="font-display text-5xl md:text-6xl font-black leading-[0.95]">
              Andrés Mora.<br /><span className="italic text-muted-foreground">El que te lleva.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Director creativo con más de 15 años trabajando con marcas como Mahou, Loewe o Camper. Fundador del estudio Mora & Co. en Barcelona, donde lidera proyectos de identidad para clientes en todo Europa.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: "3", l: "cursos" },
                { v: "8.420", l: "alumnos" },
                { v: "4,9", l: "rating" },
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

      <SiteFooter />
    </div>
  );
};

export default Curso;
