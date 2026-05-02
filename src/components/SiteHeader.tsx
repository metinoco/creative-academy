import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const SiteHeader = ({ variant = "public" }: { variant?: "public" | "student" }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, profile, signOut } = useAuth();

  const links: { to: string; label: string }[] = [{ to: "/cursos", label: "Cursos" }];
  if (role === "student") links.push({ to: "/alumno", label: "Mis cursos" });
  if (role === "admin") links.push({ to: "/admin", label: "Admin" });

  const initials = (profile?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="container flex items-center justify-between h-20">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative transition-colors hover:text-foreground ${
                pathname === l.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l.label}
              {pathname === l.to && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition"
              >
                Empezar
              </Link>
            </>
          ) : (
            <>
              {variant === "student" && (
                <button className="relative grid place-items-center w-10 h-10 rounded-full bg-surface hover:bg-muted transition">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center text-[10px] font-semibold rounded-full bg-primary text-primary-foreground">2</span>
                </button>
              )}
              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-surface">
                <div className="w-8 h-8 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground text-xs font-semibold">
                  {initials}
                </div>
                <span className="text-sm pr-2 hidden sm:inline">{displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="grid place-items-center w-10 h-10 rounded-full bg-surface hover:bg-muted transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
