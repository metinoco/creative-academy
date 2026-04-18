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
        { title: "Cursos", items: ["Diseño gráfico", "Branding", "Ilustración", "Motion", "Ver todos"] },
        { title: "Academia", items: ["Sobre nosotros", "Profesores", "Blog"] },
        { title: "Soporte", items: ["Centro de ayuda", "Contacto", "Términos", "Privacidad"] },
      ].map((col) => (
        <div key={col.title} className="space-y-3">
          <h4 className="font-display text-base">{col.title}</h4>
          <ul className="space-y-2">
            {col.items.map((i) => (
              <li key={i}>
                <Link
                  to={i === "Ver todos" ? "/cursos" : "/"}
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  {i}
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
