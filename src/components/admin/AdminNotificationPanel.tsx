import { useQueries } from "@tanstack/react-query";
import {
  Bell, ShoppingBag, MessageCircle, AlertTriangle,
  CheckCircle2, ChevronRight, Loader2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

// ── Warm Ink tokens (matches sidebar + AdminVentas) ──────────────────────────
const INK_BG      = "bg-[hsl(24_25%_12%)]";
const INK_SURFACE = "bg-[hsl(24_18%_18%)]";
const INK_BORDER  = "border-[hsl(24_18%_22%)]";
const INK_FG      = "text-[hsl(38_50%_97%)]";
const INK_MUTED   = "text-[hsl(38_30%_88%/0.5)]";
const PRIMARY_TXT = "text-[hsl(14_78%_62%)]";
const PRIMARY_BG  = "bg-[hsl(14_78%_52%)]";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RecentPayment {
  student_name: string | null;
  student_email: string | null;
  course_title: string;
  amount_cents: number;
  created_at: string;
  status: string;
}

interface QaStats {
  unanswered_count: number;
  total_count: number;
}

interface AtRiskStudent {
  student_name: string | null;
  student_email: string | null;
  course_title: string;
  days_inactive: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function msAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "hace menos de 1 h";
  if (h === 1) return "hace 1 h";
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function eur(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function initials(name: string | null, email: string | null) {
  if (name) return name.slice(0, 2).toUpperCase();
  return (email ?? "?").slice(0, 2).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  onNavigate: (section: "ventas" | "metricas" | "alumnos") => void;
}

export default function AdminNotificationPanel({ onNavigate }: Props) {
  const now = Date.now();
  const H24 = 24 * 3_600_000;

  const [paymentsQ, qaQ, riskQ] = useQueries({
    queries: [
      {
        queryKey: ["admin", "notifications", "payments"],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_recent_payments", { _limit: 50 });
          if (error) throw error;
          return (data as RecentPayment[]).filter(
            (p) => now - new Date(p.created_at).getTime() < H24
          );
        },
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["admin", "notifications", "qa"],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_qa_stats");
          if (error) throw error;
          return (data as QaStats[])[0] ?? { unanswered_count: 0, total_count: 0 };
        },
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["admin", "notifications", "at-risk"],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_at_risk_students", { _days: 30 });
          if (error) throw error;
          return data as AtRiskStudent[];
        },
        staleTime: 5 * 60_000,
      },
    ],
  });

  const recentPayments = paymentsQ.data ?? [];
  const qa             = qaQ.data ?? { unanswered_count: 0, total_count: 0 };
  const atRisk         = riskQ.data ?? [];

  const isLoading = paymentsQ.isLoading || qaQ.isLoading || riskQ.isLoading;

  // Badge = items que requieren acción (Q&A + riesgo), no las ventas que son buenas noticias
  const badgeCount = qa.unanswered_count + atRisk.length;
  const allClear   = badgeCount === 0 && recentPayments.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificaciones"
          className="relative w-10 h-10 rounded-full bg-[hsl(38_40%_96%)] hover:bg-[hsl(38_35%_92%)] grid place-items-center transition"
        >
          <Bell className="w-4 h-4" />
          {badgeCount > 0 && (
            <span
              className={`absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 rounded-full ${PRIMARY_BG} text-white text-[9px] font-black flex items-center justify-center leading-none`}
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
          {badgeCount === 0 && !isLoading && (
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${PRIMARY_BG}`} />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className={`w-80 p-0 rounded-2xl shadow-2xl border ${INK_BORDER} ${INK_BG} ${INK_FG} overflow-hidden`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${INK_BORDER} flex items-center justify-between`}>
          <span className="text-sm font-bold">Notificaciones</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin opacity-40" />}
          {!isLoading && badgeCount > 0 && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PRIMARY_BG} text-white`}>
              {badgeCount} pendiente{badgeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y divide-[hsl(24_18%_22%)]">
          {/* ── Todo al día ──────────────────────────────────────────────── */}
          {!isLoading && allClear && (
            <div className="flex flex-col items-center gap-2 py-10 px-5 text-center">
              <CheckCircle2 className="w-9 h-9 text-[hsl(172_75%_42%)]" />
              <p className="text-sm font-bold text-[hsl(38_50%_97%)]">Todo al día</p>
              <p className={`text-xs ${INK_MUTED}`}>Sin ventas, preguntas ni alumnos en riesgo.</p>
            </div>
          )}

          {/* ── Ventas últimas 24 h ──────────────────────────────────────── */}
          {recentPayments.length > 0 && (
            <section>
              <button
                onClick={() => onNavigate("ventas")}
                className={`w-full flex items-center justify-between px-5 py-2.5 ${INK_SURFACE} hover:bg-[hsl(24_20%_22%)] transition group`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className={`w-3.5 h-3.5 ${PRIMARY_TXT}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${PRIMARY_TXT}`}>
                    Ventas · últimas 24 h
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition" />
              </button>

              {recentPayments.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(24_20%_16%)] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[hsl(14_78%_52%/0.2)] text-[hsl(14_78%_62%)] text-[10px] font-black flex items-center justify-center shrink-0">
                    {initials(p.student_name, p.student_email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">
                      {p.student_name ?? p.student_email ?? "Alumno"}
                    </p>
                    <p className={`text-[11px] ${INK_MUTED} truncate`}>{p.course_title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-[hsl(172_75%_55%)]">
                      {eur(p.amount_cents)}
                    </p>
                    <p className={`text-[10px] ${INK_MUTED}`}>{msAgo(p.created_at)}</p>
                  </div>
                </div>
              ))}

              {recentPayments.length > 5 && (
                <button
                  onClick={() => onNavigate("ventas")}
                  className={`w-full text-center text-[11px] ${PRIMARY_TXT} font-bold py-2 hover:underline`}
                >
                  Ver {recentPayments.length - 5} más en Ventas
                </button>
              )}
            </section>
          )}

          {/* ── Q&A sin responder ────────────────────────────────────────── */}
          {qa.unanswered_count > 0 && (
            <section>
              <button
                onClick={() => onNavigate("alumnos")}
                className={`w-full flex items-center justify-between px-5 py-2.5 ${INK_SURFACE} hover:bg-[hsl(24_20%_22%)] transition group`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[hsl(38_90%_60%)]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[hsl(38_90%_60%)]">
                    Q&A pendientes
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition" />
              </button>

              <div className="px-5 py-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(38_90%_50%/0.15)] text-[hsl(38_90%_60%)] text-sm font-black flex items-center justify-center shrink-0">
                  {qa.unanswered_count}
                </div>
                <div>
                  <p className="text-xs font-bold">
                    {qa.unanswered_count === 1
                      ? "1 pregunta sin responder"
                      : `${qa.unanswered_count} preguntas sin responder`}
                  </p>
                  <p className={`text-[11px] ${INK_MUTED} mt-0.5`}>
                    de {qa.total_count} preguntas totales en todos los cursos
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── Alumnos en riesgo ────────────────────────────────────────── */}
          {atRisk.length > 0 && (
            <section>
              <button
                onClick={() => onNavigate("metricas")}
                className={`w-full flex items-center justify-between px-5 py-2.5 ${INK_SURFACE} hover:bg-[hsl(24_20%_22%)] transition group`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[hsl(0_70%_60%)]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[hsl(0_70%_60%)]">
                    Alumnos en riesgo · +30 d
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition" />
              </button>

              {atRisk.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(24_20%_16%)] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[hsl(0_70%_50%/0.15)] text-[hsl(0_70%_60%)] text-[10px] font-black flex items-center justify-center shrink-0">
                    {initials(s.student_name, s.student_email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">
                      {s.student_name ?? s.student_email ?? "Alumno"}
                    </p>
                    <p className={`text-[11px] ${INK_MUTED} truncate`}>{s.course_title}</p>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      s.days_inactive >= 90
                        ? "bg-[hsl(0_70%_50%/0.2)] text-[hsl(0_70%_65%)]"
                        : s.days_inactive >= 60
                        ? "bg-[hsl(25_90%_50%/0.2)] text-[hsl(25_90%_65%)]"
                        : "bg-[hsl(38_90%_50%/0.15)] text-[hsl(38_90%_65%)]"
                    }`}
                  >
                    {s.days_inactive} d
                  </span>
                </div>
              ))}

              {atRisk.length > 3 && (
                <button
                  onClick={() => onNavigate("metricas")}
                  className={`w-full text-center text-[11px] text-[hsl(0_70%_60%)] font-bold py-2 hover:underline`}
                >
                  Ver {atRisk.length - 3} más en Métricas
                </button>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        {!allClear && (
          <div className={`px-5 py-3 border-t ${INK_BORDER} ${INK_MUTED} text-[10px] text-center`}>
            Datos actualizados · se refrescan cada 5 min
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
