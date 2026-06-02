import { CreditCard, Zap } from "lucide-react";

const ADMIN_CARD    = "bg-white";
const ADMIN_BORDER  = "border-[hsl(250_20%_90%)]";
const ADMIN_SURFACE = "bg-[hsl(250_30%_96%)]";

export default function AdminVentas() {
  return (
    <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} flex flex-col items-center justify-center gap-6 py-24 px-8 text-center`}>
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-[hsl(326_85%_55%)]/10 flex items-center justify-center">
          <CreditCard className="w-9 h-9 text-[hsl(326_85%_55%)]" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[hsl(265_82%_58%)] flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <div>
        <h2 className="font-display text-3xl font-black text-[hsl(250_60%_14%)]">
          Ventas e ingresos
        </h2>
        <p className="text-[hsl(250_20%_50%)] mt-2 max-w-sm">
          Esta sección estará disponible cuando se integre Stripe. Incluirá ingresos en tiempo real,
          historial de ventas, reembolsos y métricas de conversión.
        </p>
      </div>

      <div className={`${ADMIN_SURFACE} rounded-2xl p-5 max-w-sm w-full text-left space-y-3`}>
        <p className="text-xs font-black uppercase tracking-widest text-[hsl(250_20%_50%)]">
          Lo que vendrá en esta sección
        </p>
        {[
          "Ingresos del mes vs. mes anterior",
          "Ventas recientes con detalle de alumno y curso",
          "Ticket medio, tasa de conversión y LTV",
          "Historial completo exportable a CSV",
          "Gestión de reembolsos",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-sm text-[hsl(250_20%_40%)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(326_85%_55%)] mt-1.5 shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
