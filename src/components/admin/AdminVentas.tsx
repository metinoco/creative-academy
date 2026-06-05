import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  ShoppingBag,
  Users,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

// ── Paleta Warm Ink ──────────────────────────────────────────
const C = {
  bg:       "bg-[hsl(24_25%_12%)]",
  surface:  "bg-[hsl(24_20%_16%)]",
  card:     "bg-[hsl(24_18%_20%)]",
  border:   "border-[hsl(24_20%_26%)]",
  primary:  "text-[hsl(14_78%_52%)]",
  primaryBg:"bg-[hsl(14_78%_52%)]",
  muted:    "text-[hsl(24_15%_55%)]",
  fg:       "text-[hsl(30_30%_92%)]",
};

// ── Types ────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────
const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

const pct = (current: number, prev: number) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

// ── Component ────────────────────────────────────────────────
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
      <div className={`rounded-3xl border ${C.border} p-12 flex flex-col items-center gap-4 text-center`}>
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className={C.muted}>No se pudieron cargar los datos de ventas.</p>
      </div>
    );
  }

  const monthPct = pct(
    stats?.month_revenue_cents ?? 0,
    stats?.prev_month_revenue_cents ?? 0,
  );
  const isUp = monthPct >= 0;

  const tiles = [
    {
      label: "Ingresos totales",
      value: eur(stats?.total_revenue_cents ?? 0),
      sub: `${stats?.total_payment_count ?? 0} ventas`,
      icon: Euro,
    },
    {
      label: "Este mes",
      value: eur(stats?.month_revenue_cents ?? 0),
      sub: `${stats?.month_payment_count ?? 0} ventas`,
      icon: ShoppingBag,
      badge: monthPct !== 0 ? { value: `${isUp ? "+" : ""}${monthPct}%`, up: isUp } : null,
    },
    {
      label: "Mes anterior",
      value: eur(stats?.prev_month_revenue_cents ?? 0),
      sub: "período cerrado",
      icon: Users,
    },
  ];

  const isEmpty = !payments?.length;

  return (
    <div className="space-y-6">

      {/* ── Stat tiles ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-2xl border ${C.border} ${C.card} p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${C.muted}`}>
                {t.label}
              </span>
              {t.badge ? (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  t.badge.up
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}>
                  {t.badge.up
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />}
                  {t.badge.value}
                </span>
              ) : (
                <t.icon className={`w-4 h-4 ${C.muted}`} />
              )}
            </div>
            <div className={`font-display text-3xl font-black ${C.fg}`}>{t.value}</div>
            <div className={`text-xs ${C.muted}`}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabla de transacciones recientes ───────────────── */}
      <div className={`rounded-3xl border ${C.border} ${C.card} overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${C.border} flex items-center justify-between`}>
          <h3 className={`font-display text-xl font-black ${C.fg}`}>Ventas recientes</h3>
          <span className={`text-xs ${C.muted}`}>Últimas 20 transacciones</span>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center gap-4 py-20 px-8 text-center">
            <div className={`w-16 h-16 rounded-2xl ${C.surface} flex items-center justify-center`}>
              <ShoppingBag className={`w-7 h-7 ${C.muted}`} />
            </div>
            <div>
              <p className={`font-bold ${C.fg}`}>Todavía no hay ventas</p>
              <p className={`text-sm ${C.muted} mt-1`}>
                Aparecerán aquí en cuanto se complete el primer pago con Stripe.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${C.border}`}>
                  {["Alumno", "Curso", "Importe", "Fecha", "Estado", ""].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest ${C.muted}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${C.border}`}>
                {payments!.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3.5">
                      <div className={`font-medium ${C.fg} truncate max-w-[160px]`}>
                        {p.student_name ?? "—"}
                      </div>
                      <div className={`text-xs ${C.muted} truncate max-w-[160px]`}>
                        {p.student_email}
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 ${C.fg} max-w-[180px]`}>
                      <span className="truncate block">{p.course_title}</span>
                    </td>
                    <td className={`px-5 py-3.5 font-bold ${C.fg} tabular-nums whitespace-nowrap`}>
                      {eur(p.amount_cents)}
                    </td>
                    <td className={`px-5 py-3.5 ${C.muted} whitespace-nowrap`}>
                      {fmtDate(p.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === "succeeded"
                          ? "bg-green-500/15 text-green-400"
                          : p.status === "refunded"
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-red-500/15 text-red-400"
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
                        className={`${C.muted} hover:${C.primary} transition`}
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
