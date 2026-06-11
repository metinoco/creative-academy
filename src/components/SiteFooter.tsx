import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const SiteFooter = () => (
  <footer className="mt-32 border-t border-border/60 bg-surface/40">
    <div className="container py-16 grid md:grid-cols-4 gap-10">
      <div className="space-y-4">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Disciplinas creativas impartidas por profesionales en activo. A tu ritmo, desde cualquier lugar.
        </p>
      </div>

      {[
        { title: "Cursos", items: [
          { label: "Fotografía",        to: "/cursos?categoria=Fotografía" },
          { label: "Branding",        to: "/cursos?categoria=Identidad+de+marca" },
          { label: "Ilustración",     to: "/cursos?categoria=Ilustración" },
          { label: "Motion",          to: "/cursos?categoria=Animación" },
          { label: "Ver todos",       to: "/cursos" },
        ]},
        { title: "Academia", items: [
          { label: "Sobre nosotros",  to: "/" },
          { label: "Profesores",      to: "/profesores" },
          { label: "Blog",            to: "/" },
        ]},
        { title: "Soporte", items: [
          { label: "Centro de ayuda", to: "/" },
          { label: "Contacto",        to: "/" },
          { label: "Términos",        to: "/" },
          { label: "Privacidad",      to: "/" },
        ]},
      ].map((col) => (
        <div key={col.title} className="space-y-3">
          <h4 className="font-display text-base">{col.title}</h4>
          <ul className="space-y-2">
            {col.items.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border/60">
      <div className="container py-5 flex flex-wrap gap-3 justify-between items-center text-xs text-muted-foreground">
        <span>© 2026 Academia Creativa. Hecho con ☕ y 🥐 en Zaragoza.</span>
        <div className="flex gap-5">
          <span>Cookies</span><span>Aviso legal</span>
        </div>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
