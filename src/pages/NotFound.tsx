import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 w-full max-w-xs">
        <svg
          viewBox="0 0 340 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* ── Manchas de pintura decorativas ── */}
          <ellipse cx="44" cy="255" rx="36" ry="14" fill="hsl(38 80% 60% / 0.28)" />
          <ellipse cx="296" cy="262" rx="28" ry="11" fill="hsl(14 78% 52% / 0.24)" />
          <circle cx="52" cy="108" r="14" fill="hsl(14 78% 52% / 0.18)" />
          <circle cx="288" cy="72" r="20" fill="hsl(38 80% 60% / 0.22)" />
          <circle cx="44" cy="268" r="6"  fill="hsl(38 80% 60% / 0.5)" />
          <circle cx="58" cy="275" r="4"  fill="hsl(38 80% 60% / 0.38)" />
          <circle cx="297" cy="273" r="5" fill="hsl(14 78% 52% / 0.45)" />
          <circle cx="310" cy="263" r="3" fill="hsl(14 78% 52% / 0.32)" />

          {/* Sombra suelo */}
          <ellipse cx="170" cy="283" rx="68" ry="17" fill="hsl(24 25% 12% / 0.07)" />

          {/* ── PIERNAS ── */}
          <rect x="147" y="238" width="20" height="46" rx="10" fill="hsl(24 25% 18%)" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          <rect x="172" y="238" width="20" height="46" rx="10" fill="hsl(24 25% 18%)" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          {/* Zapatos */}
          <ellipse cx="157" cy="285" rx="16" ry="8" fill="hsl(24 25% 12%)" />
          <ellipse cx="182" cy="285" rx="16" ry="8" fill="hsl(24 25% 12%)" />

          {/* ── CUERPO ── */}
          <rect x="128" y="168" width="84" height="76" rx="34" fill="hsl(38 50% 96%)" stroke="hsl(24 25% 12%)" strokeWidth="3" />
          {/* Detalle camiseta — franja de color */}
          <path d="M128 200 Q170 214 212 200 L212 244 Q170 252 128 244 Z" fill="hsl(14 78% 52% / 0.11)" />

          {/* ── CUELLO ── */}
          <rect x="153" y="150" width="34" height="22" rx="11" fill="hsl(30 30% 80%)" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />

          {/* ── CABEZA ── */}
          <ellipse cx="170" cy="112" rx="44" ry="42" fill="hsl(30 30% 80%)" stroke="hsl(24 25% 12%)" strokeWidth="3" />

          {/* ── BOINA de artista ── */}
          {/* Banda de la boina */}
          <ellipse cx="170" cy="85" rx="40" ry="9" fill="hsl(24 25% 16%)" stroke="hsl(24 25% 12%)" strokeWidth="2" />
          {/* Cuerpo de la boina (ladeada, característica del artista) */}
          <ellipse cx="178" cy="70" rx="38" ry="22" fill="hsl(24 25% 20%)" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          {/* Botón central */}
          <circle cx="190" cy="55" r="5" fill="hsl(14 78% 52%)" stroke="hsl(24 25% 12%)" strokeWidth="1.5" />
          {/* Pelo asomando por los lados */}
          <path d="M129 88 Q124 95 127 103" stroke="hsl(24 25% 16%)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M210 88 Q215 95 213 103" stroke="hsl(24 25% 16%)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M133 91 Q128 98 131 106" stroke="hsl(24 25% 16%)" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* ── CARA — sorpresa/shock ── */}
          {/* Rubor intenso de susto */}
          <ellipse cx="141" cy="128" rx="11" ry="7" fill="hsl(14 78% 52% / 0.32)" />
          <ellipse cx="199" cy="128" rx="11" ry="7" fill="hsl(14 78% 52% / 0.32)" />

          {/* Ojos muy abiertos — shock */}
          <ellipse cx="153" cy="116" rx="13" ry="15" fill="white" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          <ellipse cx="187" cy="116" rx="13" ry="15" fill="white" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          {/* Pupilas pequeñas y centradas — el susto contrae la pupila */}
          <circle cx="153" cy="117" r="5" fill="hsl(24 25% 12%)" />
          <circle cx="187" cy="117" r="5" fill="hsl(24 25% 12%)" />
          {/* Brillo */}
          <circle cx="156" cy="113" r="2" fill="white" />
          <circle cx="190" cy="113" r="2" fill="white" />

          {/* Cejas disparadas hacia arriba — expresión de SHOCK */}
          <path d="M140 97 Q153 89 164 95" stroke="hsl(24 25% 12%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M176 95 Q189 87 200 93" stroke="hsl(24 25% 12%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Nariz — puntito suave */}
          <circle cx="170" cy="128" r="3.5" fill="hsl(20 28% 68%)" />

          {/* Boca abierta de par en par — "AAAH!" */}
          <ellipse cx="170" cy="141" rx="12" ry="9" fill="hsl(24 25% 12%)" stroke="hsl(24 25% 12%)" strokeWidth="2" />
          {/* Interior de la boca */}
          <ellipse cx="170" cy="142" rx="9" ry="6.5" fill="hsl(14 78% 52% / 0.6)" />
          {/* Dientecitos */}
          <rect x="163" y="133" width="5" height="4" rx="1.5" fill="white" />
          <rect x="170" y="133" width="5" height="4" rx="1.5" fill="white" />

          {/* Gota de sudor de susto en la frente */}
          <path d="M200 98 Q204 106 200 112" stroke="hsl(14 78% 52% / 0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="200" cy="114" rx="3" ry="4" fill="hsl(38 80% 60% / 0.7)" stroke="hsl(24 25% 12%)" strokeWidth="1.5" />

          {/* ── BRAZO IZQUIERDO (paleta) ── */}
          {/* Piel del brazo */}
          <path d="M130 182 Q104 180 86 196" stroke="hsl(30 30% 80%)" strokeWidth="13" strokeLinecap="round" fill="none" />
          {/* Contorno */}
          <path d="M130 182 Q104 180 86 196" stroke="hsl(24 25% 12%)" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Paleta de pintor */}
          <ellipse cx="76" cy="204" rx="26" ry="21" fill="hsl(38 40% 86%)" stroke="hsl(24 25% 12%)" strokeWidth="2.5" />
          {/* Colores en la paleta */}
          <circle cx="66" cy="197" r="5.5" fill="hsl(14 78% 52%)" />
          <circle cx="80" cy="191" r="5.5" fill="hsl(38 80% 60%)" />
          <circle cx="91" cy="199" r="5.5" fill="hsl(24 25% 18%)" />
          <circle cx="85" cy="211" r="5.5" fill="hsl(14 78% 52% / 0.5)" />
          {/* Agujero del pulgar */}
          <ellipse cx="63" cy="213" rx="6.5" ry="5.5" fill="hsl(38 40% 94%)" stroke="hsl(24 25% 12%)" strokeWidth="1.5" />

          {/* ── BRAZO DERECHO (pincel arriba, gesto de "¿dónde estoy?") ── */}
          <path d="M210 182 Q232 168 248 146" stroke="hsl(30 30% 80%)" strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M210 182 Q232 168 248 146" stroke="hsl(24 25% 12%)" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Pincel */}
          {/* Mango de madera */}
          <rect x="242" y="106" width="11" height="46" rx="5.5" fill="hsl(35 60% 70%)" stroke="hsl(24 25% 12%)" strokeWidth="2" />
          {/* Virola metálica */}
          <rect x="243" y="126" width="9" height="7" rx="1" fill="hsl(30 10% 72%)" />
          {/* Cerda del pincel */}
          <path d="M243 104 Q247.5 92 252 104" fill="hsl(14 78% 52%)" stroke="hsl(24 25% 12%)" strokeWidth="1.5" />
          {/* Gota de pintura cayendo */}
          <path d="M247 152 Q248 161 247 168" stroke="hsl(14 78% 52%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="247" cy="171" r="3.5" fill="hsl(14 78% 52%)" />

          {/* ── Signos de exclamación — ¡pánico! ── */}
          <text x="262" y="118" fontSize="28" fill="hsl(14 78% 52%)" fontWeight="900" fontFamily="Nunito Sans, sans-serif">!!</text>
          <text x="272" y="94"  fontSize="16" fill="hsl(38 80% 60% / 0.7)" fontWeight="900" fontFamily="Nunito Sans, sans-serif">!</text>

          {/* ── Estrellas / destellos ── */}
          <g fill="hsl(38 80% 60%)" opacity="0.9">
            <path d="M36 52 L38 45 L40 52 L47 54 L40 56 L38 63 L36 56 L29 54 Z" />
            <path d="M300 148 L302 142 L304 148 L310 150 L304 152 L302 158 L300 152 L294 150 Z" />
          </g>
          <g fill="hsl(14 78% 52%)" opacity="0.8">
            <path d="M305 55 L307 49 L309 55 L315 57 L309 59 L307 65 L305 59 L299 57 Z" />
            <path d="M20 178 L21.5 173 L23 178 L28 180 L23 182 L21.5 187 L20 182 L15 180 Z" />
          </g>
        </svg>
      </div>

      {/* 404 */}
      <p className="mb-2 text-7xl font-black text-primary leading-none" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
        404
      </p>

      {/* Título */}
      <h1 className="mb-2 text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Esta página se fue a buscar inspiración
      </h1>

      {/* Subtexto informal */}
      <p className="mb-8 max-w-sm text-base text-muted-foreground">
        Y todavía no ha vuelto. Tranqui, que en la home te esperamos con los brazos abiertos (y los pinceles listos).
      </p>

      {/* Botón regreso */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
