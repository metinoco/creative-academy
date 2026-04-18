import { Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, CreditCard, Settings, BarChart3, Search, Bell, Plus, MoreHorizontal, ArrowUp, ArrowDown, Eye, Pencil, TrendingUp } from "lucide-react";
import { courses } from "@/data/courses";
import lauraImg from "@/assets/avatar-laura.jpg";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Cursos" },
  { icon: Users, label: "Alumnos" },
  { icon: CreditCard, label: "Ventas" },
  { icon: BarChart3, label: "Métricas" },
  { icon: Settings, label: "Ajustes" },
];

const stats = [
  { label: "Ingresos del mes", value: "18.420€", change: "+12,4%", up: true },
  { label: "Nuevos alumnos", value: "284", change: "+8,2%", up: true },
  { label: "Tasa de conversión", value: "4,8%", change: "-0,3%", up: false },
  { label: "Cursos activos", value: "20", change: "+2", up: true },
];

const recentSales = [
  { name: "Marta Reyes", email: "marta@studio.es", course: "Branding desde cero", amount: 197, date: "Hace 2 min" },
  { name: "Diego Aranda", email: "diego.a@gmail.com", course: "Motion Graphics", amount: 297, date: "Hace 18 min" },
  { name: "Lucía Bermejo", email: "lucia.b@hotmail.com", course: "Ilustración digital", amount: 147, date: "Hace 1 h" },
  { name: "Pablo Núñez", email: "pablo.n@me.com", course: "Tipografía aplicada", amount: 97, date: "Hace 2 h" },
  { name: "Inés Calvo", email: "ines.c@gmail.com", course: "Diseño editorial", amount: 147, date: "Hace 3 h" },
];

const Admin = () => {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col fixed inset-y-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative grid place-items-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-display text-lg font-bold">
              A<span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary" />
            </span>
            <div>
              <div className="font-display text-base font-semibold leading-tight">Academia Creativa</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <img src={lauraImg} alt="Laura" loading="lazy" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Laura Fernández</div>
              <div className="text-[10px] text-sidebar-foreground/60 truncate">Owner · admin@</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-64">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <div className="relative max-w-sm w-full hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Buscar alumnos, cursos, ventas..."
                className="w-full bg-surface rounded-full pl-11 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 rounded-full bg-surface hover:bg-muted grid place-items-center transition">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" /> Nuevo curso
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px]">
          {/* HEADER */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Panel de control</span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight">
                Buenos días, <span className="italic">Laura</span>
              </h1>
              <p className="text-muted-foreground mt-2">Esto es lo que está pasando hoy en la academia.</p>
            </div>
            <div className="flex gap-2">
              {["Hoy", "7 días", "30 días", "Año"].map((p, i) => (
                <button key={p} className={`px-4 py-2 rounded-full text-xs font-medium transition ${i === 2 ? "bg-ink text-ink-foreground" : "bg-card border border-border hover:border-primary/40"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-3xl border border-border/60 p-6 hover:shadow-soft transition">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="font-display text-3xl mt-2">{s.value}</div>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${s.up ? "text-primary" : "text-muted-foreground"}`}>
                  {s.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {s.change}
                  <span className="text-muted-foreground">vs mes anterior</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* CHART */}
            <div className="lg:col-span-2 bg-card rounded-3xl border border-border/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl">Ingresos · últimos 30 días</h3>
                  <p className="text-xs text-muted-foreground mt-1">Comparado con periodo anterior</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Este mes</span>
                  <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-muted-foreground/40" />Anterior</span>
                </div>
              </div>

              <div className="relative h-56">
                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,160 C60,140 100,120 160,110 C220,100 260,130 320,90 C380,50 420,70 480,40 C540,20 580,30 600,25 L600,200 L0,200 Z" fill="url(#g1)" />
                  <path d="M0,160 C60,140 100,120 160,110 C220,100 260,130 320,90 C380,50 420,70 480,40 C540,20 580,30 600,25" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                  <path d="M0,170 C60,165 100,150 160,155 C220,160 260,140 320,130 C380,120 420,125 480,100 C540,90 580,85 600,80" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-border/60 mt-4 text-center">
                {[
                  { l: "Ticket medio", v: "163€" },
                  { l: "Mejor día", v: "Mar 14" },
                  { l: "Refunds", v: "1,2%" },
                  { l: "LTV alumno", v: "342€" },
                ].map((k) => (
                  <div key={k.l}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
                    <div className="font-display text-lg mt-1">{k.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP COURSES */}
            <div className="bg-card rounded-3xl border border-border/60 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl">Top cursos</h3>
                <button className="w-7 h-7 rounded-full hover:bg-surface grid place-items-center">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {courses.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="font-display text-2xl text-muted-foreground/60 tabular-nums w-6">0{i + 1}</span>
                    <img src={c.image} alt={c.title} loading="lazy" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.lessons} lecciones</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{c.price * 12}€</div>
                      <div className="text-[10px] text-primary inline-flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+{12 + i * 4}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT SALES + COURSES TABLE */}
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 bg-card rounded-3xl border border-border/60 overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl">Cursos del catálogo</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">20 cursos · 18 publicados · 2 borradores</p>
                </div>
                <button className="text-xs text-primary hover:underline">Gestionar</button>
              </div>
              <table className="w-full">
                <thead className="bg-surface/60 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Curso</th>
                    <th className="text-left font-medium px-2 py-3">Estado</th>
                    <th className="text-right font-medium px-2 py-3">Alumnos</th>
                    <th className="text-right font-medium px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {courses.slice(0, 5).map((c, i) => (
                    <tr key={c.id} className="hover:bg-surface/40 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt={c.title} loading="lazy" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="font-medium">{c.title}</div>
                            <div className="text-xs text-muted-foreground">{c.price}€</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${i === 4 ? "bg-secondary/30 text-ink" : "bg-primary/10 text-primary"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${i === 4 ? "bg-secondary" : "bg-primary"}`} />
                          {i === 4 ? "Borrador" : "Publicado"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums">{(c.reviews * 2).toLocaleString("es")}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center"><Pencil className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RECENT SALES */}
            <div className="lg:col-span-2 bg-card rounded-3xl border border-border/60 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl">Ventas recientes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">+5 ventas hoy</p>
                </div>
                <button className="text-xs text-primary hover:underline">Ver todas</button>
              </div>
              <div className="space-y-4">
                {recentSales.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground text-xs font-semibold shrink-0">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.course}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">+{s.amount}€</div>
                      <div className="text-[10px] text-muted-foreground">{s.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
