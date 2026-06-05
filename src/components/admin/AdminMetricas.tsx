import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, TooltipProps,
} from "recharts";
import { AlertTriangle, Users, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Design tokens (consistent with AdminDashboard light palette) ──
const CARD    = "bg-white";
const BORDER  = "border-[hsl(250_20%_90%)]";
const SURFACE = "bg-[hsl(250_30%_96%)]";

// ── Types ─────────────────────────────────────────────────────────
type MonthlyRevenue    = { month: string; total_cents: number; payment_count: number };
type MonthlyEnrollment = { month: string; enrollment_count: number };
type ProgressDistRow   = {
  course_id: string; course_title: string; total_enrolled: number; total_lessons: number;
  b0: number; b1_25: number; b26_50: number; b51_75: number; b76_99: number; b100: number;
};
type AtRiskStudent = {
  user_id: string; full_name: string | null; email: string;
  course_id: string; course_title: string; course_slug: string;
  granted_at: string; days_inactive: number;
};

// ── Helpers ───────────────────────────────────────────────────────
const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function monthLabel(yyyymm: string) {
  const [year, month] = yyyymm.split("-");
  return `${MONTHS_ES[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Chart data types ──────────────────────────────────────────────
type RevenuePoint    = { month: string; euros: number; payment_count: number };
type EnrollmentPoint = { month: string; value: number };

// ── Custom tooltips ───────────────────────────────────────────────
function RevenueTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RevenuePoint;
  return (
    <div className="bg-white border border-[hsl(250_20%_88%)] rounded-xl px-3 py-2 text-xs shadow-sm">
      <div className="font-bold text-[hsl(250_60%_14%)]">
        {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(d.euros)}
      </div>
      <div className="text-[hsl(250_20%_50%)]">{d.payment_count} ventas</div>
    </div>
  );
}

function EnrollmentTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as EnrollmentPoint;
  return (
    <div className="bg-white border border-[hsl(250_20%_88%)] rounded-xl px-3 py-2 text-xs shadow-sm">
      <div className="font-bold text-[hsl(250_60%_14%)]">{d.value} alumnos</div>
      <div className="text-[hsl(250_20%_50%)]">matrículas nuevas</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────
function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-[hsl(250_20%_90%)] rounded animate-pulse" />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
export default function AdminMetricas() {
  const [riskDays, setRiskDays] = useState(30);

  const results = useQueries({
    queries: [
      // 0 — monthly revenue
      {
        queryKey: ["admin-monthly-revenue"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_monthly_revenue");
          if (error) throw error;
          return (data ?? []) as MonthlyRevenue[];
        },
      },
      // 1 — monthly enrollments
      {
        queryKey: ["admin-monthly-enrollments"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_monthly_enrollments");
          if (error) throw error;
          return (data ?? []) as MonthlyEnrollment[];
        },
      },
      // 2 — progress distribution
      {
        queryKey: ["admin-progress-distribution"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_progress_distribution");
          if (error) throw error;
          return (data ?? []) as ProgressDistRow[];
        },
      },
      // 3 — at-risk students (re-fetches when riskDays changes)
      {
        queryKey: ["admin-at-risk-students", riskDays],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_at_risk_students", { _days: riskDays });
          if (error) throw error;
          return (data ?? []) as AtRiskStudent[];
        },
      },
    ],
  });

  const [monthlyRevenue, monthlyEnrollments, progressDist, atRisk] = results;

  const revenueChart: RevenuePoint[] = (monthlyRevenue.data ?? []).map((d) => ({
    month: monthLabel(d.month),
    euros: Math.round(Number(d.total_cents) / 100),
    payment_count: Number(d.payment_count),
  }));

  const enrollmentChart: EnrollmentPoint[] = (monthlyEnrollments.data ?? []).map((d) => ({
    month: monthLabel(d.month),
    value: Number(d.enrollment_count),
  }));

  return (
    <div className="space-y-8">

      {/* ── BLOQUE 1: Tendencias de crecimiento ─────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Ingresos por mes */}
        <div className={`${CARD} rounded-3xl border ${BORDER} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
              Ingresos por mes
            </h3>
            <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
              últimos 12 meses
            </span>
          </div>
          {monthlyRevenue.isLoading ? (
            <div className="h-52 bg-[hsl(250_20%_90%)] rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueChart} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 20% 93%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "hsl(250 20% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(250 20% 55%)" }}
                  tickFormatter={(v: number) => `€${v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: "hsl(250 20% 96%)" }} />
                <Bar dataKey="euros" fill="hsl(14 78% 52%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alumnos nuevos por mes */}
        <div className={`${CARD} rounded-3xl border ${BORDER} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
              Alumnos nuevos por mes
            </h3>
            <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
              últimos 12 meses
            </span>
          </div>
          {monthlyEnrollments.isLoading ? (
            <div className="h-52 bg-[hsl(250_20%_90%)] rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={enrollmentChart} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 20% 93%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "hsl(250 20% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(250 20% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<EnrollmentTooltip />} cursor={{ fill: "hsl(250 20% 96%)" }} />
                <Bar dataKey="value" fill="hsl(265 82% 58%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BLOQUE 2: Distribución de progreso por curso ─────────── */}
      <div className={`${CARD} rounded-3xl border ${BORDER} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
            Distribución de progreso por curso
          </h3>
          <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
            dónde abandonan los alumnos
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 flex-wrap mb-6 text-[11px] text-[hsl(250_20%_50%)]">
          {[
            { label: "Sin empezar (0%)",  color: "bg-[hsl(250_15%_82%)]" },
            { label: "1–25%",             color: "bg-[hsl(38_90%_68%)]" },
            { label: "26–50%",            color: "bg-[hsl(38_90%_54%)]" },
            { label: "51–75%",            color: "bg-[hsl(14_78%_60%)]" },
            { label: "76–99%",            color: "bg-[hsl(14_78%_46%)]" },
            { label: "Completado (100%)", color: "bg-[hsl(172_75%_42%)]" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm shrink-0 ${b.color}`} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        {progressDist.isLoading ? (
          <RowSkeleton rows={5} />
        ) : (progressDist.data?.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-sm text-[hsl(250_20%_50%)]">
            Sin matrículas activas en cursos publicados.
          </div>
        ) : (
          <div className="space-y-5">
            {(progressDist.data ?? []).map((c) => {
              const total = c.total_enrolled || 1;
              const segments = [
                { key: "b0",     value: Number(c.b0),     color: "bg-[hsl(250_15%_82%)]" },
                { key: "b1_25",  value: Number(c.b1_25),  color: "bg-[hsl(38_90%_68%)]" },
                { key: "b26_50", value: Number(c.b26_50), color: "bg-[hsl(38_90%_54%)]" },
                { key: "b51_75", value: Number(c.b51_75), color: "bg-[hsl(14_78%_60%)]" },
                { key: "b76_99", value: Number(c.b76_99), color: "bg-[hsl(14_78%_46%)]" },
                { key: "b100",   value: Number(c.b100),   color: "bg-[hsl(172_75%_42%)]" },
              ];
              return (
                <div key={c.course_id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[hsl(250_60%_14%)] truncate max-w-[55%]">
                      {c.course_title}
                    </span>
                    <span className="text-xs text-[hsl(250_20%_50%)] shrink-0">
                      {c.total_enrolled} alumnos
                      {c.total_lessons === 0 && (
                        <span className="ml-2 italic text-[hsl(250_15%_62%)]">· sin lecciones</span>
                      )}
                    </span>
                  </div>
                  <div className="flex h-7 rounded-lg overflow-hidden gap-[2px]">
                    {segments.map((s) =>
                      s.value > 0 ? (
                        <div
                          key={s.key}
                          title={`${s.value} alumnos`}
                          className={`${s.color} flex items-center justify-center text-[10px] font-bold text-white/90 transition-all duration-500`}
                          style={{ width: `${(s.value / total) * 100}%` }}
                        >
                          {s.value > 0 && (s.value / total) >= 0.08 ? s.value : ""}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BLOQUE 3: Alumnos en riesgo ──────────────────────────── */}
      <div className={`${CARD} rounded-3xl border ${BORDER} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
              Alumnos en riesgo
            </h3>
            {(atRisk.data?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <AlertTriangle className="w-3 h-3" />
                {atRisk.data!.length} alumnos
              </span>
            )}
          </div>
          <select
            value={riskDays}
            onChange={(e) => setRiskDays(Number(e.target.value))}
            className={`text-xs font-bold border ${BORDER} ${SURFACE} rounded-xl px-3 py-1.5 text-[hsl(250_60%_14%)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(14_78%_52%/0.3)]`}
          >
            <option value={30}>Inactivos &gt; 30 días</option>
            <option value={60}>Inactivos &gt; 60 días</option>
            <option value={90}>Inactivos &gt; 90 días</option>
          </select>
        </div>

        <p className="text-xs text-[hsl(250_20%_55%)] mb-5">
          Alumnos con matrícula activa que no han completado ninguna lección en los últimos {riskDays} días desde su matriculación.
        </p>

        {atRisk.isLoading ? (
          <RowSkeleton rows={5} />
        ) : (atRisk.data?.length ?? 0) === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <div className={`w-14 h-14 rounded-2xl ${SURFACE} flex items-center justify-center`}>
              <Users className="w-6 h-6 text-[hsl(250_20%_55%)]" />
            </div>
            <div>
              <p className="font-bold text-[hsl(250_60%_14%)]">Sin alumnos en riesgo</p>
              <p className="text-sm text-[hsl(250_20%_50%)] mt-1">
                Todos los alumnos matriculados han completado al menos una lección.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${BORDER}`}>
                  {["Alumno", "Curso", "Matriculado", "Inactividad"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-[hsl(250_20%_50%)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${BORDER}`}>
                {(atRisk.data ?? []).map((s) => (
                  <tr
                    key={`${s.user_id}-${s.course_id}`}
                    className="hover:bg-[hsl(250_30%_98%)] transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[hsl(250_60%_14%)]">
                        {s.full_name ?? "—"}
                      </div>
                      <div className="text-xs text-[hsl(250_20%_50%)] truncate max-w-[180px]">
                        {s.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <span className="truncate block text-[hsl(250_60%_14%)]">
                        {s.course_title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[hsl(250_20%_50%)] whitespace-nowrap">
                      {fmtDate(s.granted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          s.days_inactive >= 90
                            ? "bg-red-50 text-red-600"
                            : s.days_inactive >= 60
                            ? "bg-amber-50 text-amber-600"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        {s.days_inactive} días
                      </span>
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
