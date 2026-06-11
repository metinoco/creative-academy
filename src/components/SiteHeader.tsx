import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SiteHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const links: { to: string; label: string }[] = [
    { to: "/cursos", label: "Catálogo" },
    { to: "/profesores", label: "Nuestros Profesores" },
  ];
  if (role === "admin") links.push({ to: "/admin", label: "Admin" });

  // Close on click outside (covers mobile tap-outside)
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const initials = (profile?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  const handleLogout = async () => {
    setDropOpen(false);
    await signOut();
    navigate("/", { replace: true });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="container flex items-center justify-between h-20">
        <Logo />

        {/* Desktop nav */}
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

        <div className="flex items-center gap-2 md:gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground hidden md:block"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition"
              >
                Empezar
              </Link>
            </>
          ) : (
            // Wrapper is the single hover zone — content is a direct child, no portal
            <div
              ref={wrapperRef}
              className="relative hidden md:block"
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <button
                onClick={() => setDropOpen((p) => !p)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-surface hover:bg-muted transition focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground text-xs font-semibold">
                  {initials}
                </div>
                <span className="text-sm pr-2 hidden sm:inline">{displayName}</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full pt-1.5 z-50">
                <div className="min-w-[11rem] rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1">
                  {role === "student" && (
                    <>
                      <Link
                        to="/alumno"
                        onClick={() => setDropOpen(false)}
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        Mis cursos
                      </Link>
                      <div className="h-px -mx-1 my-1 bg-border" />
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent hover:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Abrir menú"
                className="md:hidden grid place-items-center w-10 h-10 rounded-full bg-surface hover:bg-muted transition"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0 flex flex-col">
              {/* Header: avatar si hay sesión, logo si no */}
              <div className="p-5 border-b border-border">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {profile?.full_name ?? user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Logo />
                )}
              </div>

              <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                {role === "student" && (
                  <>
                    <Link
                      to="/alumno"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition ${
                        pathname === "/alumno"
                          ? "bg-ink text-ink-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      Mis cursos
                    </Link>
                    <div className="h-px bg-border my-1" />
                  </>
                )}
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition ${
                      pathname === l.to
                        ? "bg-ink text-ink-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-border space-y-2.5">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center rounded-full border-2 border-border px-5 py-3 text-sm font-bold hover:bg-muted transition"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/registro"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-3 text-sm font-bold hover:bg-ink/90 transition"
                    >
                      Empezar gratis
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-border px-5 py-3 text-sm font-bold hover:bg-muted transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
