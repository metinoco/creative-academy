import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, TrendingDown, Euro, ShoppingBag, Users,
  Loader2, AlertCircle, ExternalLink,
} from "lucide-react";

// ── Design-system "Warm Ink" light tokens (matches Dashboard + Alumnos) ──────
const CARD     = "bg-white";
const BORDER   = "border-[hsl(30_20%_84%)]";
const SURFACE  = "bg-[hsl(38_40%_96%)]";
const FG       = "text-[hsl(24_25%_12%)]";
const MUTED    = "text-[hsl(24_12%_50%)]";
const PRIMARY  = "text-[hsl(14_78%_52%)]";

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentStats = {
  total_revenue_cents:      number;
  month_revenue_cents:      number;
  prev_month_revenue_cents: number;
  total_payment_count:      number;
  month_payment_count:      number;
};

type RecentPayment = {
  id:                string;
  student_name:      string | null;
  student_email:     string;
  course_title:      string;
  course_slug:       string;
  amount_cents:      number;
  currency:          string;
  status:            string;
  stripe_session_id: string;
  created_at:        string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

const pct = (current: number, prev: number) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminVentas() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<PaymentStats>({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_payment_stats");
      if (error) throw error;
      return data?.[0] as PaymentStats;
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<RecentPayment[]>({
    queryKey: ["admin-recent-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_recent_payments", { _limit: 20 });
      if (error) throw error;
      return (data ?? []) as RecentPayment[];
    },
  });

  if (statsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(14_78%_52%)]" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={`rounded-3xl border ${BORDER} ${CARD} p-12 flex flex-col items-center gap-4 text-center`}>
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className={MUTED}>No se pudieron cargar los datos de ventas.</p>
      </div>
    );
  }

  const monthPct = pct(
    stats?.month_revenue_cents  ?? 0,
    stats?.prev_month_revenue_cents ?? 0,
  );
  const isUp = monthPct >= 0;

  const tiles = [
    {
      label: "Ingresos totales",
      value: eur(stats?.total_revenue_cents ?? 0),
      sub:   `${stats?.total_payment_count ?? 0} ventas`,
      icon:  Euro,
    },
    {
      label: "Este mes",
      value: eur(stats?.month_revenue_cents ?? 0),
      sub:   `${stats?.month_payment_count ?? 0} ventas`,
      icon:  ShoppingBag,
      badge: monthPct !== 0 ? { value: `${isUp ? "+" : ""}${monthPct}%`, up: isUp } : null,
    },
    {
      label: "Mes anterior",
      value: eur(stats?.prev_month_revenue_cents ?? 0),
      sub:   "período cerrado",
      icon:  Users,
    },
  ];

  const isEmpty = !payments?.length;

  return (
    <div className="space-y-6">

      {/* ── Stat tiles ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-2xl border ${BORDER} ${CARD} p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${MUTED}`}>
                {t.label}
              </span>
              {t.badge ? (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  t.badge.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {t.badge.up
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />}
                  {t.badge.value}
                </span>
              ) : (
                <t.icon className={`w-4 h-4 ${MUTED}`} />
              )}
            </div>
            <div className={`font-display text-3xl font-black ${FG}`}>{t.value}</div>
            <div className={`text-xs ${MUTED}`}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabla de transacciones recientes ─────────────────────── */}
      <div className={`rounded-3xl border ${BORDER} ${CARD} overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${BORDER} flex items-center justify-between`}>
          <h3 className={`font-display text-xl font-black ${FG}`}>Ventas recientes</h3>
          <span className={`text-xs ${MUTED}`}>Últimas 20 transacciones</span>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center gap-4 py-20 px-8 text-center">
            <div className={`w-16 h-16 rounded-2xl ${SURFACE} flex items-center justify-center`}>
              <ShoppingBag className={`w-7 h-7 ${MUTED}`} />
            </div>
            <div>
              <p className={`font-bold ${FG}`}>Todavía no hay ventas</p>
              <p className={`text-sm ${MUTED} mt-1`}>
                Aparecerán aquí en cuanto se complete el primer pago con Stripe.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${SURFACE} text-[10px] uppercase tracking-widest ${MUTED}`}>
                <tr className={`border-b ${BORDER}`}>
                  <th className="px-5 py-3 text-left font-black">Alumno</th>
                  <th className="px-5 py-3 text-left font-black hidden sm:table-cell">Curso</th>
                  <th className="px-5 py-3 text-left font-black">Importe</th>
                  <th className="px-5 py-3 text-left font-black hidden sm:table-cell">Fecha</th>
                  <th className="px-5 py-3 text-left font-black hidden sm:table-cell">Estado</th>
                  <th className="px-5 py-3 text-left font-black"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${BORDER}`}>
                {payments!.map((p) => (
                  <tr key={p.id} className={`hover:${SURFACE} transition`}>
                    <td className="px-5 py-3.5">
                      <div className={`font-medium ${FG} truncate max-w-[160px]`}>
                        {p.student_name ?? "—"}
                      </div>
                      <div className={`text-xs ${MUTED} truncate max-w-[160px] sm:hidden`}>
                        {p.course_title}
                      </div>
                      <div className={`text-xs ${MUTED} truncate max-w-[160px]`}>
                        {p.student_email}
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 ${FG} max-w-[200px] hidden sm:table-cell`}>
                      <span className="truncate block">{p.course_title}</span>
                    </td>
                    <td className={`px-5 py-3.5 font-bold ${FG} tabular-nums whitespace-nowrap`}>
                      {eur(p.amount_cents)}
                    </td>
                    <td className={`px-5 py-3.5 ${MUTED} whitespace-nowrap hidden sm:table-cell`}>
                      {fmtDate(p.created_at)}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === "succeeded"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "refunded"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {p.status === "succeeded"
                          ? "Cobrado"
                          : p.status === "refunded"
                          ? "Reembolsado"
                          : p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`https://dashboard.stripe.com/payments/${p.stripe_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${MUTED} hover:${PRIMARY} transition`}
                        title="Ver en Stripe"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
