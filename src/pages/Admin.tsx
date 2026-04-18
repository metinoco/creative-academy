import { Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, CreditCard, Settings, BarChart3, Search, Bell, Plus, MoreHorizontal, ArrowUp, ArrowDown, Eye, Pencil, TrendingUp } from "lucide-react";
import { courses } from "@/data/courses";
import lauraImg from "@/assets/avatar-laura.jpg";
import Logo from "@/components/Logo";

/**
 * Admin — paleta VIBRANTE alternativa al portal:
 *  - Fondo: blanco puro (panel limpio)
 *  - Sidebar: índigo profundo
 *  - Acentos: magenta eléctrico, violeta, turquesa, lima
 */

const ADMIN_BG = "bg-white";
const ADMIN_SURFACE = "bg-[hsl(250_30%_96%)]";
const ADMIN_CARD = "bg-white";
const ADMIN_BORDER = "border-[hsl(250_20%_90%)]";
const SIDEBAR_BG = "bg-[hsl(250_60%_14%)]";
const SIDEBAR_FG = "text-[hsl(250_30%_94%)]";
const SIDEBAR_ACCENT = "bg-[hsl(250_50%_22%)]";
const HONEY = "bg-[hsl(326_85%_55%)]"; // magenta vibrante
const HONEY_TXT = "text-[hsl(326_85%_50%)]";
const CLAY = "bg-[hsl(265_82%_58%)]"; // violeta eléctrico
const MOSS = "bg-[hsl(172_75%_42%)]"; // turquesa

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Cursos" },
  { icon: Users, label: "Alumnos" },
  { icon: CreditCard, label: "Ventas" },
  { icon: BarChart3, label: "Métricas" },
  { icon: Settings, label: "Ajustes" },
];

const stats = [
  { label: "Ingresos del mes", value: "18.420€", change: "+12,4%", up: true, accent: HONEY },
  { label: "Nuevos alumnos", value: "284", change: "+8,2%", up: true, accent: CLAY },
  { label: "Tasa de conversión", value: "4,8%", change: "-0,3%", up: false, accent: MOSS },
  { label: "Cursos activos", value: "16", change: "+2", up: true, accent: HONEY },
];

const recentSales = [
  { name: "Marta Reyes", email: "marta@studio.es", course: "Marca magnética", amount: 197, date: "Hace 2 min" },
  { name: "Diego Aranda", email: "diego.a@gmail.com", course: "Movimiento y color", amount: 297, date: "Hace 18 min" },
  { name: "Lucía Bermejo", email: "lucia.b@hotmail.com", course: "Trazos en píxel", amount: 147, date: "Hace 1 h" },
  { name: "Pablo Núñez", email: "pablo.n@me.com", course: "Letras vivas", amount: 97, date: "Hace 2 h" },
  { name: "Inés Calvo", email: "ines.c@gmail.com", course: "Papel y rejilla", amount: 147, date: "Hace 3 h" },
];

const Admin = () => {
  return (
    <div className={`min-h-screen ${ADMIN_BG} flex`}>
      {/* SIDEBAR */}
      <aside className={`hidden md:flex w-64 ${SIDEBAR_BG} ${SIDEBAR_FG} flex-col fixed inset-y-0`}>
        <div className="p-6">
          <Logo variant="ink" size="sm" />
          <div className="mt-1 ml-12 text-[10px] uppercase tracking-widest text-[hsl(250_30%_94%/0.55)]">Admin</div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                item.active
                  ? `${SIDEBAR_ACCENT} text-[hsl(250_30%_94%)]`
                  : `text-[hsl(250_30%_94%/0.65)] hover:${SIDEBAR_ACCENT} hover:text-[hsl(250_30%_94%)]`
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.active && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${HONEY}`} />}
            </button>
          ))}
        </nav>

        <div className={`p-4 m-3 rounded-2xl ${SIDEBAR_ACCENT}`}>
          <div className="flex items-center gap-3">
            <img src={lauraImg} alt="Laura" loading="lazy" width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-[hsl(326_85%_55%)]" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Laura Fernández</div>
              <div className="text-[10px] text-[hsl(250_30%_94%/0.6)] truncate">Owner · admin@</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-64">
        {/* TOPBAR */}
        <header className={`sticky top-0 z-30 bg-white/85 backdrop-blur border-b ${ADMIN_BORDER}`}>
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <div className="relative max-w-sm w-full hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(250_20%_50%)]" />
              <input
                placeholder="Buscar alumnos, cursos, ventas..."
                className={`w-full ${ADMIN_SURFACE} rounded-full pl-11 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[hsl(326_85%_55%)]/40`}
              />
            </div>
            <div className="flex items-center gap-3">
              <button className={`relative w-10 h-10 rounded-full ${ADMIN_SURFACE} hover:bg-[hsl(250_30%_92%)] grid place-items-center transition`}>
                <Bell className="w-4 h-4" />
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${HONEY}`} />
              </button>
              <button className={`inline-flex items-center gap-2 rounded-full ${HONEY} text-white px-4 py-2 text-sm font-bold hover:bg-[hsl(326_85%_48%)] transition`}>
                <Plus className="w-4 h-4" /> Nuevo curso
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px]">
          {/* HEADER */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${HONEY_TXT}`}>Panel de control</span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight text-[hsl(250_60%_14%)]">
                Buenos días, <span className="italic text-[hsl(265_82%_58%)]">Laura</span>
              </h1>
              <p className="text-[hsl(250_20%_45%)] mt-2">Esto es lo que está pasando hoy en la academia.</p>
            </div>
            <div className="flex gap-2">
              {["Hoy", "7 días", "30 días", "Año"].map((p, i) => (
                <button
                  key={p}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                    i === 2
                      ? `${SIDEBAR_BG} text-[hsl(250_30%_94%)]`
                      : `${ADMIN_CARD} border ${ADMIN_BORDER} hover:border-[hsl(326_85%_55%)]/40`
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 hover:shadow-lg transition relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${s.accent}`} />
                <div className="text-xs uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold">{s.label}</div>
                <div className="font-display text-3xl mt-2 font-black text-[hsl(250_60%_14%)]">{s.value}</div>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${s.up ? HONEY_TXT : "text-[hsl(250_20%_50%)]"}`}>
                  {s.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {s.change}
                  <span className="text-[hsl(250_20%_55%)] font-medium">vs mes anterior</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* CHART */}
            <div className={`lg:col-span-2 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl font-black text-[hsl(250_60%_14%)]">Ingresos · últimos 30 días</h3>
                  <p className="text-xs text-[hsl(250_20%_50%)] mt-1">Comparado con periodo anterior</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${HONEY}`} />Este mes</span>
                  <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[hsl(250_20%_60%)]/40" />Anterior</span>
                </div>
              </div>

              <div className="relative h-56">
                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(326 85% 55%)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(326 85% 55%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,160 C60,140 100,120 160,110 C220,100 260,130 320,90 C380,50 420,70 480,40 C540,20 580,30 600,25 L600,200 L0,200 Z" fill="url(#g1)" />
                  <path d="M0,160 C60,140 100,120 160,110 C220,100 260,130 320,90 C380,50 420,70 480,40 C540,20 580,30 600,25" fill="none" stroke="hsl(326 85% 55%)" strokeWidth="2.5" />
                  <path d="M0,170 C60,165 100,150 160,155 C220,160 260,140 320,130 C380,120 420,125 480,100 C540,90 580,85 600,80" fill="none" stroke="hsl(172 75% 42%)" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 4" />
                </svg>
              </div>

              <div className={`grid grid-cols-4 gap-4 pt-6 border-t ${ADMIN_BORDER} mt-4 text-center`}>
                {[
                  { l: "Ticket medio", v: "163€" },
                  { l: "Mejor día", v: "Mar 14" },
                  { l: "Refunds", v: "1,2%" },
                  { l: "LTV alumno", v: "342€" },
                ].map((k) => (
                  <div key={k.l}>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold">{k.l}</div>
                    <div className="font-display text-lg mt-1 font-black text-[hsl(250_60%_14%)]">{k.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP COURSES */}
            <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">Top cursos</h3>
                <button className={`w-7 h-7 rounded-full hover:${ADMIN_SURFACE} grid place-items-center`}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {courses.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="font-display text-2xl text-[hsl(250_20%_60%)]/60 tabular-nums w-6 font-black">0{i + 1}</span>
                    <img src={c.image} alt={c.title} loading="lazy" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-[hsl(250_60%_14%)]">{c.title}</div>
                      <div className="text-xs text-[hsl(250_20%_50%)]">{c.lessons} lecciones</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{c.price * 12}€</div>
                      <div className={`text-[10px] ${HONEY_TXT} inline-flex items-center gap-0.5 font-bold`}><TrendingUp className="w-2.5 h-2.5" />+{12 + i * 4}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COURSES TABLE + RECENT SALES */}
          <div className="grid lg:grid-cols-5 gap-5">
            <div className={`lg:col-span-3 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} overflow-hidden`}>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-black text-[hsl(34_22%_18%)]">Cursos del catálogo</h3>
                  <p className="text-xs text-[hsl(34_18%_45%)] mt-0.5">16 cursos · 14 publicados · 2 borradores</p>
                </div>
                <Link to="/cursos" className={`text-xs ${HONEY_TXT} font-bold hover:underline`}>Gestionar</Link>
              </div>
              <table className="w-full">
                <thead className={`${ADMIN_SURFACE}/60 text-[10px] uppercase tracking-widest text-[hsl(34_18%_45%)]`}>
                  <tr>
                    <th className="text-left font-bold px-6 py-3">Curso</th>
                    <th className="text-left font-bold px-2 py-3">Estado</th>
                    <th className="text-right font-bold px-2 py-3">Alumnos</th>
                    <th className="text-right font-bold px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${ADMIN_BORDER} text-sm`}>
                  {courses.slice(0, 5).map((c, i) => (
                    <tr key={c.id} className={`hover:${ADMIN_SURFACE}/40 transition`}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt={c.title} loading="lazy" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-[hsl(34_22%_18%)]">{c.title}</div>
                            <div className="text-xs text-[hsl(34_18%_45%)]">{c.price}€</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            i === 4
                              ? "bg-[hsl(60_22%_42%)]/15 text-[hsl(60_22%_28%)]"
                              : "bg-[hsl(36_82%_48%)]/15 text-[hsl(36_82%_38%)]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${i === 4 ? MOSS : HONEY}`} />
                          {i === 4 ? "Borrador" : "Publicado"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums font-bold">{(c.reviews * 2).toLocaleString("es")}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className={`w-8 h-8 rounded-full hover:${ADMIN_SURFACE} grid place-items-center`}><Eye className="w-3.5 h-3.5" /></button>
                          <button className={`w-8 h-8 rounded-full hover:${ADMIN_SURFACE} grid place-items-center`}><Pencil className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RECENT SALES */}
            <div className={`lg:col-span-2 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl font-black text-[hsl(34_22%_18%)]">Ventas recientes</h3>
                  <p className="text-xs text-[hsl(34_18%_45%)] mt-0.5">+5 ventas hoy</p>
                </div>
                <button className={`text-xs ${HONEY_TXT} font-bold hover:underline`}>Ver todas</button>
              </div>
              <div className="space-y-4">
                {recentSales.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${i % 2 === 0 ? CLAY : HONEY} grid place-items-center text-white text-xs font-black shrink-0`}
                    >
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-[hsl(34_22%_18%)]">{s.name}</div>
                      <div className="text-xs text-[hsl(34_18%_45%)] truncate">{s.course}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold">+{s.amount}€</div>
                      <div className="text-[10px] text-[hsl(34_18%_50%)]">{s.date}</div>
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
