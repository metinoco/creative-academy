import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, CreditCard, BarChart3,
  Settings, LogOut, Menu, Lock,
} from "lucide-react";
import lauraImg from "@/assets/avatar-laura.jpg";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminCursos from "@/components/admin/AdminCursos";
import AdminAlumnos from "@/components/admin/AdminAlumnos";
import AdminVentas from "@/components/admin/AdminVentas";
import AdminMetricas from "@/components/admin/AdminMetricas";
import AdminNotificationPanel from "@/components/admin/AdminNotificationPanel";

// ── Design-system "Warm Ink" tokens ────────────────────────────────────────
const ADMIN_BG      = "bg-white";
const ADMIN_SURFACE = "bg-[hsl(38_40%_96%)]";
const ADMIN_BORDER  = "border-[hsl(30_20%_84%)]";

// Sidebar — uses the DS --ink palette instead of the old indigo palette
const SIDEBAR_BG    = "bg-[hsl(24_25%_12%)]";
const SIDEBAR_FG    = "text-[hsl(38_50%_98%)]";

// Primary / CTA — terracota (DS --primary)
const PRIMARY     = "bg-[hsl(14_78%_52%)]";
const PRIMARY_TXT = "text-[hsl(14_78%_52%)]";

type Section = "dashboard" | "cursos" | "alumnos" | "ventas" | "metricas" | "ajustes";

const navItems: { icon: React.ElementType; label: string; id: Section; locked?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard",  id: "dashboard" },
  { icon: BarChart3,       label: "Métricas",   id: "metricas" },
  { icon: BookOpen,        label: "Cursos",      id: "cursos" },
  { icon: Users,           label: "Alumnos",     id: "alumnos" },
  { icon: CreditCard,      label: "Ventas",      id: "ventas" },
  { icon: Settings,        label: "Ajustes",     id: "ajustes", locked: true },
];

// Nav grouped like Proposal 1
const navGroups: { label: string; ids: Section[] }[] = [
  { label: "Visión general", ids: ["dashboard", "metricas"] },
  { label: "Contenido",      ids: ["cursos"] },
  { label: "Comunidad",      ids: ["alumnos", "ventas"] },
];
const navBottom: Section[] = ["ajustes"];

const sectionTitles: Record<Section, string> = {
  dashboard: "Dashboard",
  cursos:    "Cursos",
  alumnos:   "Alumnos",
  ventas:    "Ventas",
  metricas:  "Métricas",
  ajustes:   "Ajustes",
};

function ComingSoonSection({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className={`w-16 h-16 rounded-2xl ${ADMIN_SURFACE} flex items-center justify-center`}>
        <Lock className="w-7 h-7 text-[hsl(24_12%_50%)]" />
      </div>
      <div>
        <div className="font-display text-2xl font-black text-[hsl(24_25%_12%)]">{label}</div>
        <div className="text-sm text-[hsl(24_12%_50%)] mt-1">Esta sección estará disponible próximamente.</div>
      </div>
    </div>
  );
}

const Admin = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const displayName = profile?.full_name ?? "Laura";

  const handleNav = (id: Section, locked?: boolean, onNavigate?: () => void) => {
    if (locked) return;
    setActiveSection(id);
    onNavigate?.();
  };

  const NavItem = ({
    item,
    onNavigate,
  }: {
    item: (typeof navItems)[number];
    onNavigate?: () => void;
  }) => {
    const isActive = item.id === activeSection;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id, item.locked, onNavigate)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition border ${
          item.locked
            ? "text-[hsl(38_30%_88%/0.30)] cursor-not-allowed border-transparent"
            : isActive
              ? "bg-[hsl(14_78%_52%/0.12)] text-[hsl(14_78%_64%)] border-[hsl(14_78%_52%/0.18)]"
              : "text-[hsl(38_30%_88%/0.6)] hover:bg-[hsl(24_20%_18%)] hover:text-[hsl(38_50%_97%)] border-transparent"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition ${
            isActive
              ? "bg-[hsl(14_78%_52%/0.2)]"
              : item.locked
                ? ""
                : "group-hover:bg-[hsl(24_20%_22%)]"
          }`}
        >
          <item.icon className="w-3.5 h-3.5" />
        </div>
        <span className="flex-1 text-left">{item.label}</span>
        {item.locked && <Lock className="w-3 h-3 opacity-40 shrink-0" />}
      </button>
    );
  };

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-[hsl(24_18%_20%)] shrink-0">
        <Logo variant="ink" size="sm" />
        <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.12em] px-2 py-0.5 rounded-full bg-[hsl(14_78%_52%/0.2)] text-[hsl(38_50%_98%)]">
          ✦ Admin
        </div>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-5 min-h-0">
        {navGroups.map((group) => (
          <div key={group.label}>
            <span className="block text-[9px] font-bold uppercase tracking-[.12em] text-[hsl(38_30%_88%/0.35)] px-2.5 mb-1.5">
              {group.label}
            </span>
            <div className="space-y-0.5">
              {group.ids.map((id) => {
                const item = navItems.find((n) => n.id === id)!;
                return <NavItem key={id} item={item} onNavigate={onNavigate} />;
              })}
            </div>
          </div>
        ))}

        {/* Divider + bottom items */}
        <div className="h-px bg-[hsl(24_18%_20%)]" />
        <div className="space-y-0.5">
          {navBottom.map((id) => {
            const item = navItems.find((n) => n.id === id)!;
            return <NavItem key={id} item={item} onNavigate={onNavigate} />;
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-[hsl(24_18%_20%)] shrink-0">
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[hsl(24_20%_16%)] hover:bg-[hsl(24_20%_20%)] transition cursor-pointer"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <img
            src={lauraImg}
            alt={displayName}
            loading="lazy"
            width={34}
            height={34}
            className="w-[34px] h-[34px] rounded-[10px] object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-bold text-[hsl(38_50%_97%)] truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[10px] text-[hsl(38_30%_88%/0.5)] truncate">
              Owner · Administradora
            </div>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[hsl(38_30%_88%/0.4)] shrink-0 hover:text-[hsl(14_78%_52%)] transition" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${ADMIN_BG} flex`}>
      {/* SIDEBAR — desktop */}
      <aside className={`hidden md:flex w-64 ${SIDEBAR_BG} ${SIDEBAR_FG} flex-col fixed inset-y-0`}>
        <SidebarNav />
      </aside>

      {/* SIDEBAR — mobile sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className={`w-72 p-0 flex flex-col overflow-hidden ${SIDEBAR_BG} ${SIDEBAR_FG} border-0`}
        >
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* MAIN */}
      <main className="flex-1 md:ml-64 overflow-x-hidden">
        {/* TOPBAR */}
        <header className={`fixed left-0 right-0 top-0 md:sticky md:left-auto md:right-auto z-30 bg-white/85 backdrop-blur border-b ${ADMIN_BORDER}`}>
          <div className="flex items-center gap-3 px-4 md:px-6 lg:px-10 h-16">
            <button
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden grid place-items-center w-10 h-10 rounded-full ${ADMIN_SURFACE} hover:bg-[hsl(38_35%_92%)] transition shrink-0`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className={`hidden sm:block text-sm font-bold text-[hsl(24_12%_50%)]`}>
              {sectionTitles[activeSection]}
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <AdminNotificationPanel
                onNavigate={(s) => setActiveSection(s)}
              />
            </div>
          </div>
        </header>

        {/* Spacer: only on mobile to push content below the fixed header */}
        <div className="h-16 md:hidden" aria-hidden="true" />

        {/* SECTION CONTENT */}
        <div className="p-4 sm:p-6 lg:p-10 w-full">
          {/* Dashboard header */}
          {activeSection === "dashboard" && (
            <div className="mb-8">
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${PRIMARY_TXT}`}>
                Panel de control
              </span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight text-[hsl(24_25%_12%)]">
                Hola, <span className="italic text-[hsl(14_78%_52%)]">{displayName.split(" ")[0]}</span>
              </h1>
              <p className="text-[hsl(24_12%_45%)] mt-2">
                Esto es lo que está pasando en la academia.
              </p>
            </div>
          )}

          {activeSection === "dashboard" && <AdminDashboard onNavigate={(s) => setActiveSection(s)} />}
          {activeSection === "cursos"    && <AdminCursos />}
          {activeSection === "alumnos"   && <AdminAlumnos />}
          {activeSection === "ventas"    && <AdminVentas />}
          {activeSection === "metricas"  && <AdminMetricas />}
          {activeSection === "ajustes"   && <ComingSoonSection label="Ajustes" />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
