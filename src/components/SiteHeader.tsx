import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const SiteHeader = ({ variant = "public" }: { variant?: "public" | "student" }) => {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Catálogo" },
    { to: "/curso", label: "Ver curso" },
    { to: "/alumno", label: "Mis cursos" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-full bg-ink text-ink-foreground font-display text-lg font-bold">
            A
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Academia Creativa<span className="text-primary">.</span>
          </span>
        </Link>

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
          {variant === "public" ? (
            <>
              <Link to="/alumno" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
                Iniciar sesión
              </Link>
              <Link
                to="/curso"
                className="inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium hover:bg-ink/90 transition"
              >
                Empezar
              </Link>
            </>
          ) : (
            <>
              <button className="relative grid place-items-center w-10 h-10 rounded-full bg-surface hover:bg-muted transition">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center text-[10px] font-semibold rounded-full bg-primary text-primary-foreground">2</span>
              </button>
              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-surface">
                <div className="w-8 h-8 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground text-xs font-semibold">MG</div>
                <span className="text-sm pr-2 hidden sm:inline">María G.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
