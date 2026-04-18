import { Link } from "react-router-dom";
import { Clock, BookOpen, Star, Lock, Play, Award, Infinity, Users, Check, ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import branding from "@/assets/course-branding.jpg";
import lauraImg from "@/assets/avatar-laura.jpg";

const modules = [
  { title: "Fundamentos del branding", lessons: [
    { name: "Bienvenida y mapa del curso", duration: "04:12", preview: true },
    { name: "Qué es (y qué no es) una marca", duration: "12:45", preview: true },
    { name: "Investigación y posicionamiento", duration: "18:20" },
    { name: "Mood boards estratégicos", duration: "15:08" },
  ]},
  { title: "Identidad visual", lessons: [
    { name: "Sistema de logotipo", duration: "22:10" },
    { name: "Construcción tipográfica", duration: "19:45" },
    { name: "Sistema cromático", duration: "16:30" },
    { name: "Iconografía y patrones", duration: "14:22" },
  ]},
  { title: "Aplicación y manual", lessons: [
    { name: "Manual de marca completo", duration: "28:50" },
    { name: "Plantillas de papelería", duration: "21:15" },
    { name: "Marca en redes sociales", duration: "17:40" },
  ]},
];

const Curso = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="public" />

      {/* Breadcrumb */}
      <div className="container pt-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/" className="hover:text-foreground">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Branding desde cero</span>
      </div>

      {/* HERO */}
      <section className="container pt-8 pb-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest">
              Identidad de marca
            </span>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
              Branding <span className="italic text-primary">desde cero</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Aprende a construir marcas memorables: del briefing y la investigación al manual final. Con plantillas reales que vas a poder reutilizar en tus proyectos.
            </p>

            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />)}</div>
                <span className="font-semibold">4,9</span>
                <span className="text-muted-foreground">(1.284 valoraciones)</span>
              </div>
              <span className="text-muted-foreground">· 12.400 alumnos</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <img src={lauraImg} alt="Andrés Mora" loading="lazy" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="text-sm">Imparte <span className="font-semibold">Andrés Mora</span></div>
                <div className="text-xs text-muted-foreground">Director creativo · Estudio Mora & Co.</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/3] shadow-card group cursor-pointer">
              <img src={branding} alt="Branding desde cero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/30 grid place-items-center">
                <div className="w-20 h-20 rounded-full bg-card/90 backdrop-blur grid place-items-center group-hover:scale-110 transition">
                  <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                </div>
              </div>
              <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur text-xs font-medium">
                Tráiler · 1:42
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* META BAR */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { icon: Clock, label: "Duración", value: "12 h 45 min" },
            { icon: BookOpen, label: "Lecciones", value: "48 vídeos" },
            { icon: Award, label: "Certificado", value: "Al completar" },
            { icon: Infinity, label: "Acceso", value: "De por vida" },
          ].map((m) => (
            <div key={m.label} className="bg-card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center">
                <m.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                <div className="font-display text-base">{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMARIO + SIDEBAR */}
      <section className="container pt-16 pb-24 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Temario</span>
            <h2 className="mt-3 font-display text-4xl">3 módulos · 11 lecciones de muestra</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">Las dos primeras lecciones son de acceso libre. El resto se desbloquea con la compra.</p>
          </div>

          <div className="space-y-4">
            {modules.map((m, mi) => (
              <details key={mi} open={mi === 0} className="group bg-card rounded-2xl border border-border/60 overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-surface/50">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-2xl text-primary tabular-nums">0{mi + 1}</span>
                    <div>
                      <h3 className="font-display text-xl">{m.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.lessons.length} lecciones</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition" />
                </summary>
                <ul className="border-t border-border/60 divide-y divide-border/60">
                  {m.lessons.map((l, li) => (
                    <li key={li} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40 transition">
                      <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${l.preview ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {l.preview ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <span className="flex-1 text-sm">{l.name}</span>
                      {l.preview && <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Preview</span>}
                      <span className="text-xs text-muted-foreground tabular-nums">{l.duration}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          {/* PROFESOR */}
          <div className="bg-surface/50 rounded-3xl p-7 flex flex-col sm:flex-row gap-6 items-start">
            <img src={lauraImg} alt="Profesor" loading="lazy" width={96} height={96} className="w-24 h-24 rounded-full object-cover shrink-0" />
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Tu profesor</span>
                <h3 className="font-display text-2xl mt-1">Andrés Mora</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Director creativo con más de 15 años trabajando con marcas como Mahou, Loewe o Camper. Fundador del estudio Mora & Co. en Barcelona.
              </p>
              <div className="flex gap-5 text-xs text-muted-foreground">
                <span><span className="font-semibold text-foreground">3</span> cursos</span>
                <span><span className="font-semibold text-foreground">8.420</span> alumnos</span>
                <span><span className="font-semibold text-foreground">4,9</span> ★</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-soft">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">197€</span>
                <span className="text-sm text-muted-foreground line-through">247€</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">IVA incluido · Pago único</div>

              <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 transition shadow-glow">
                Añadir al carrito
              </button>
              <button className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-6 py-3.5 text-sm font-medium hover:bg-ink/90 transition">
                Comprar ahora
              </button>

              <div className="mt-6 space-y-3 text-sm">
                {[
                  { i: Infinity, t: "Acceso de por vida" },
                  { i: Award, t: "Certificado al completar" },
                  { i: Users, t: "Comunidad privada de alumnos" },
                  { i: Check, t: "30 días de garantía" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <f.i className="w-4 h-4 text-primary shrink-0" />
                    <span>{f.t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/20 rounded-3xl p-5 text-center">
              <div className="text-xs uppercase tracking-widest text-ink/70 font-semibold">Plan completo</div>
              <div className="font-display text-lg mt-1">¿Buscas más cursos?</div>
              <Link to="/" className="inline-block mt-2 text-sm font-medium text-primary hover:underline">Ver pack 3 cursos · 397€</Link>
            </div>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Curso;
