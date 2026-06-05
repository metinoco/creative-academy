import { useQueries } from "@tanstack/react-query";
import {
  Users, BookOpen, CheckSquare, TrendingUp, TrendingDown,
  ArrowUp, Target, MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";

const HONEY      = "bg-[hsl(326_85%_55%)]";
const HONEY_TXT  = "text-[hsl(326_85%_50%)]";
const CLAY       = "bg-[hsl(265_82%_58%)]";
const MOSS       = "bg-[hsl(172_75%_42%)]";
const TEAL       = "bg-[hsl(195_80%_46%)]";
const AMBER      = "bg-[hsl(38_90%_50%)]";
const AMBER_TXT  = "text-[hsl(38_90%_42%)]";
const ADMIN_CARD    = "bg-white";
const ADMIN_BORDER  = "border-[hsl(250_20%_90%)]";
const ADMIN_SURFACE = "bg-[hsl(250_30%_96%)]";

interface CourseStatRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  active_enrollments: number;
}

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

type CourseCompletionRow = {
  course_id:       string;
  course_title:    string;
  course_slug:     string;
  total_enrolled:  number;
  total_lessons:   number;
  completed_all:   number;
  completion_rate: number;
};

type RevenueByCourseRow = {
  course_id:           string;
  course_title:        string;
  course_slug:         string;
  total_revenue_cents: number;
  payment_count:       number;
};

type QaStats = {
  total_questions:  number;
  answered_count:   number;
  unanswered_count: number;
};

const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

const pct = (current: number, prev: number) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

function initials(name: string | null, email: string) {
  if (name) return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function StatSkeleton() {
  return (
    <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 animate-pulse`}>
      <div className="h-3 w-24 bg-[hsl(250_20%_90%)] rounded mb-4" />
      <div className="h-8 w-16 bg-[hsl(250_20%_90%)] rounded mb-3" />
      <div className="h-3 w-20 bg-[hsl(250_20%_90%)] rounded" />
    </div>
  );
}

interface AdminDashboardProps {
  onNavigate?: (section: "ventas") => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const results = useQueries({
    queries: [
      // 0
      {
        queryKey: ["admin", "total-active-enrollments"],
        queryFn: async () => {
          const { count, error } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .is("revoked_at", null);
          if (error) throw error;
          return count ?? 0;
        },
      },
      // 1
      {
        queryKey: ["admin", "new-enrollments-month"],
        queryFn: async () => {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          const { count, error } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .gte("granted_at", startOfMonth.toISOString());
          if (error) throw error;
          return count ?? 0;
        },
      },
      // 2
      {
        queryKey: ["admin", "published-courses"],
        queryFn: async () => {
          const { count, error } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true })
            .eq("status", "published");
          if (error) throw error;
          return count ?? 0;
        },
      },
      // 3
      {
        queryKey: ["admin", "completed-lessons"],
        queryFn: async () => {
          const { count, error } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("completed", true);
          if (error) throw error;
          return count ?? 0;
        },
      },
      // 4
      {
        queryKey: ["admin", "top-courses"],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_course_stats");
          if (error) throw error;
          return (data as CourseStatRow[]).slice(0, 4);
        },
      },
      // 5 — shared cache key with AdminVentas
      {
        queryKey: ["admin-payment-stats"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_payment_stats");
          if (error) throw error;
          return data?.[0] as PaymentStats;
        },
      },
      // 6 — shared cache key with AdminVentas (_limit: 20, sliced to 5 in render)
      {
        queryKey: ["admin-recent-payments"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_recent_payments", { _limit: 20 });
          if (error) throw error;
          return (data ?? []) as RecentPayment[];
        },
      },
      // 7 — purchase enrollments this month (conversion denominator = newThisMonth)
      {
        queryKey: ["admin", "conversion-purchase-month"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          const { count, error } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .gte("granted_at", startOfMonth.toISOString())
            .eq("source", "purchase");
          if (error) throw error;
          return count ?? 0;
        },
      },
      // 8 — completion rate per course
      {
        queryKey: ["admin-course-completion"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_course_completion_stats");
          if (error) throw error;
          return (data ?? []) as CourseCompletionRow[];
        },
      },
      // 9 — revenue breakdown per course
      {
        queryKey: ["admin-revenue-by-course"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_revenue_by_course");
          if (error) throw error;
          return (data ?? []) as RevenueByCourseRow[];
        },
      },
      // 10 — Q&A stats
      {
        queryKey: ["admin-qa-stats"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_qa_stats");
          if (error) throw error;
          return data?.[0] as QaStats | undefined;
        },
      },
    ],
  });

  const [
    totalEnrollments, newThisMonth, publishedCourses, completedLessons, topCourses,
    paymentStats, recentPayments, conversionPurchase,
    courseCompletion, revenueByCourse, qaStats,
  ] = results;

  const conversionTotal = newThisMonth.data ?? 0;
  const conversionPaid  = conversionPurchase.data ?? 0;
  const conversionPct   = conversionTotal > 0
    ? Math.round((conversionPaid / conversionTotal) * 100)
    : null;

  const statsConfig = [
    {
      label: "Alumnos activos",
      value: totalEnrollments.data?.toLocaleString("es") ?? "—",
      icon: Users,
      accent: HONEY,
      accentTxt: HONEY_TXT,
      loading: totalEnrollments.isLoading,
      subLabel: undefined as string | undefined,
    },
    {
      label: "Nuevos este mes",
      value: newThisMonth.data?.toLocaleString("es") ?? "—",
      icon: ArrowUp,
      accent: CLAY,
      accentTxt: "text-[hsl(265_82%_55%)]",
      loading: newThisMonth.isLoading,
      subLabel: undefined as string | undefined,
    },
    {
      label: "Cursos activos",
      value: publishedCourses.data?.toLocaleString("es") ?? "—",
      icon: BookOpen,
      accent: MOSS,
      accentTxt: "text-[hsl(172_75%_35%)]",
      loading: publishedCourses.isLoading,
      subLabel: undefined as string | undefined,
    },
    {
      label: "Lecciones completadas",
      value: completedLessons.data?.toLocaleString("es") ?? "—",
      icon: CheckSquare,
      accent: TEAL,
      accentTxt: "text-[hsl(195_80%_38%)]",
      loading: completedLessons.isLoading,
      subLabel: undefined as string | undefined,
    },
    {
      label: "Conversión este mes",
      value: conversionPct !== null ? `${conversionPct}%` : "—",
      subLabel: `${conversionPaid} de ${conversionTotal} via Stripe`,
      icon: Target,
      accent: AMBER,
      accentTxt: AMBER_TXT,
      loading: newThisMonth.isLoading || conversionPurchase.isLoading,
    },
  ];

  const stats = paymentStats.data;
  const monthDelta    = stats ? pct(stats.month_revenue_cents, stats.prev_month_revenue_cents) : 0;
  const deltaPositive = monthDelta >= 0;

  return (
    <div className="space-y-8">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsConfig.map((s) =>
          s.loading ? (
            <StatSkeleton key={s.label} />
          ) : (
            <div
              key={s.label}
              className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 hover:shadow-lg transition relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${s.accent}`} />
              <div className="flex items-start justify-between">
                <div className="text-xs uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold">
                  {s.label}
                </div>
                <s.icon className={`w-4 h-4 ${s.accentTxt} opacity-60`} />
              </div>
              <div className="font-display text-3xl mt-2 font-black text-[hsl(250_60%_14%)]">
                {s.value}
              </div>
              {s.subLabel && (
                <div className="text-[11px] text-[hsl(250_20%_50%)] mt-1">{s.subLabel}</div>
              )}
            </div>
          )
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* REVENUE SECTION */}
        <div className={`lg:col-span-2 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">Ingresos</h3>
            <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
              histórico y mensual
            </span>
          </div>

          {paymentStats.isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <StatSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {/* Total histórico */}
              <div className={`${ADMIN_SURFACE} rounded-2xl p-4`}>
                <div className="text-[10px] uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold mb-2">
                  Total histórico
                </div>
                <div className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
                  {stats ? eur(stats.total_revenue_cents) : "€0,00"}
                </div>
                <div className="text-xs text-[hsl(250_20%_50%)] mt-1">
                  {stats?.total_payment_count ?? 0} ventas
                </div>
              </div>

              {/* Este mes */}
              <div className={`${ADMIN_SURFACE} rounded-2xl p-4`}>
                <div className="text-[10px] uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold mb-2">
                  Este mes
                </div>
                <div className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
                  {stats ? eur(stats.month_revenue_cents) : "€0,00"}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {stats && stats.prev_month_revenue_cents > 0 ? (
                    <>
                      {deltaPositive
                        ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                        : <TrendingDown className="w-3 h-3 text-red-400" />
                      }
                      <span className={`text-xs font-bold ${deltaPositive ? "text-emerald-500" : "text-red-400"}`}>
                        {deltaPositive ? "+" : ""}{monthDelta}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-[hsl(250_20%_50%)]">
                      {stats?.month_payment_count ?? 0} ventas
                    </span>
                  )}
                </div>
              </div>

              {/* Mes anterior */}
              <div className={`${ADMIN_SURFACE} rounded-2xl p-4`}>
                <div className="text-[10px] uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold mb-2">
                  Mes anterior
                </div>
                <div className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
                  {stats ? eur(stats.prev_month_revenue_cents) : "€0,00"}
                </div>
                <div className="mt-1">
                  <span className="text-[10px] text-[hsl(250_20%_50%)] bg-[hsl(250_20%_88%)] rounded-full px-2 py-0.5 font-bold">
                    período cerrado
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TOP COURSES */}
        <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">Top cursos</h3>
            <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
              por matrículas
            </span>
          </div>

          {topCourses.isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 bg-[hsl(250_20%_90%)] rounded" />
                  <div className="w-12 h-12 bg-[hsl(250_20%_90%)] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-3/4" />
                    <div className="h-2 bg-[hsl(250_20%_90%)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(topCourses.data ?? []).map((c, i) => {
                const staticCourse = staticCourses.find((s) => s.id === c.slug);
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="font-display text-2xl text-[hsl(250_20%_60%)]/60 tabular-nums w-6 font-black">
                      0{i + 1}
                    </span>
                    {staticCourse?.image ? (
                      <img
                        src={staticCourse.image}
                        alt={c.title}
                        loading="lazy"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[hsl(250_20%_90%)]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-[hsl(250_60%_14%)]">{c.title}</div>
                      <div className="text-xs text-[hsl(250_20%_50%)]">
                        {c.active_enrollments} alumnos
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-[10px] ${HONEY_TXT} inline-flex items-center gap-0.5 font-bold`}>
                        <TrendingUp className="w-2.5 h-2.5" />
                        {c.active_enrollments}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RECENT SALES */}
      <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">Ventas recientes</h3>
          {onNavigate && (
            <button
              onClick={() => onNavigate("ventas")}
              className={`text-xs font-bold ${HONEY_TXT} hover:underline`}
            >
              Ver todas →
            </button>
          )}
        </div>

        {recentPayments.isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[hsl(250_20%_90%)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-1/3" />
                  <div className="h-2 bg-[hsl(250_20%_90%)] rounded w-1/4" />
                </div>
                <div className="h-4 w-14 bg-[hsl(250_20%_90%)] rounded" />
                <div className="h-3 w-16 bg-[hsl(250_20%_90%)] rounded hidden sm:block" />
              </div>
            ))}
          </div>
        ) : (recentPayments.data?.length ?? 0) === 0 ? (
          <div className="py-8 text-center text-sm text-[hsl(250_20%_50%)]">
            Sin ventas aún · aparecerán aquí en cuanto se complete el primer pago.
          </div>
        ) : (
          <div className="space-y-3">
            {(recentPayments.data ?? []).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${ADMIN_SURFACE} flex items-center justify-center text-xs font-black text-[hsl(250_60%_14%)] shrink-0`}
                >
                  {initials(p.student_name, p.student_email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate text-[hsl(250_60%_14%)]">
                    {p.student_name ?? p.student_email}
                  </div>
                  <div className="text-xs text-[hsl(250_20%_50%)] truncate">{p.course_title}</div>
                </div>
                <div className="text-sm font-bold text-[hsl(250_60%_14%)] shrink-0">
                  {eur(p.amount_cents)}
                </div>
                <div className="text-xs text-[hsl(250_20%_50%)] shrink-0 hidden sm:block">
                  {fmtDate(p.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION A: Finalización por curso + Q&A */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Finalización por curso (2/3) */}
        <div className={`lg:col-span-2 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
              Finalización por curso
            </h3>
            <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
              cursos publicados
            </span>
          </div>

          {courseCompletion.isLoading ? (
            <div className="space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-1/3" />
                    <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-16" />
                  </div>
                  <div className="h-2 bg-[hsl(250_20%_90%)] rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : (courseCompletion.data?.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-sm text-[hsl(250_20%_50%)]">
              Sin matrículas activas en cursos publicados.
            </div>
          ) : (
            <div className="space-y-5">
              {(courseCompletion.data ?? []).map((c) => (
                <div key={c.course_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold truncate text-[hsl(250_60%_14%)] max-w-[60%]">
                      {c.course_title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[hsl(250_20%_50%)]">
                        {c.completed_all} de {c.total_enrolled} alumnos
                      </span>
                      <span className="text-sm font-black text-[hsl(250_60%_14%)] tabular-nums w-12 text-right">
                        {c.total_lessons === 0 ? "—" : `${c.completion_rate}%`}
                      </span>
                    </div>
                  </div>
                  {c.total_lessons === 0 ? (
                    <div className="text-[11px] text-[hsl(250_20%_55%)] italic">Sin lecciones</div>
                  ) : (
                    <div className="h-2 rounded-full bg-[hsl(250_20%_92%)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-warm transition-all duration-500"
                        style={{ width: `${c.completion_rate}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Q&A Pendientes (1/3) */}
        {(() => {
          const qa = qaStats.data;
          const unanswered = qa?.unanswered_count ?? 0;
          const hasAlert = unanswered > 0;
          const accentBar = hasAlert ? "bg-red-400" : MOSS;
          return (
            <div
              className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 relative overflow-hidden hover:shadow-lg transition`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${accentBar}`} />
              <div className="flex items-start justify-between mb-4">
                <div className="text-xs uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold">
                  Q&A · Pendientes
                </div>
                <MessageSquare
                  className={`w-4 h-4 opacity-60 ${hasAlert ? "text-red-400" : "text-[hsl(172_75%_35%)]"}`}
                />
              </div>

              {qaStats.isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 w-16 bg-[hsl(250_20%_90%)] rounded" />
                  <div className="h-3 w-28 bg-[hsl(250_20%_90%)] rounded" />
                </div>
              ) : (
                <>
                  <div className={`font-display text-5xl font-black mb-1 ${hasAlert ? "text-red-500" : "text-[hsl(250_60%_14%)]"}`}>
                    {unanswered}
                  </div>
                  <div className="text-xs text-[hsl(250_20%_50%)]">
                    de {qa?.total_questions ?? 0} preguntas totales
                  </div>
                  <div className="mt-4">
                    {hasAlert ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 rounded-full px-3 py-1">
                        ⚠ Sin responder
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(172_75%_35%)] bg-[hsl(172_75%_95%)] rounded-full px-3 py-1">
                        ✓ Todo respondido
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* SECTION B: Ingresos por curso */}
      {(() => {
        const withRevenue = (revenueByCourse.data ?? []).filter((r) => r.payment_count > 0).slice(0, 6);
        const maxRevenue = withRevenue[0]?.total_revenue_cents ?? 0;
        return (
          <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">
                Ingresos por curso
              </h3>
              <span className="text-[10px] text-[hsl(250_20%_55%)] uppercase tracking-widest font-bold">
                cursos con ventas
              </span>
            </div>

            {revenueByCourse.isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-6 h-6 bg-[hsl(250_20%_90%)] rounded" />
                    <div className="w-12 h-12 bg-[hsl(250_20%_90%)] rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-1/2" />
                      <div className="h-2 bg-[hsl(250_20%_90%)] rounded-full w-3/4" />
                    </div>
                    <div className="h-4 w-16 bg-[hsl(250_20%_90%)] rounded" />
                  </div>
                ))}
              </div>
            ) : withRevenue.length === 0 ? (
              <div className="py-8 text-center text-sm text-[hsl(250_20%_50%)]">
                Sin ventas por curso todavía.
              </div>
            ) : (
              <div className="space-y-4">
                {withRevenue.map((r, i) => {
                  const staticCourse = staticCourses.find((s) => s.id === r.course_slug);
                  const barWidth = maxRevenue > 0 ? (r.total_revenue_cents / maxRevenue) * 100 : 0;
                  return (
                    <div key={r.course_id} className="flex items-center gap-3">
                      <span className="font-display text-2xl text-[hsl(250_20%_60%)]/60 tabular-nums w-6 font-black shrink-0">
                        0{i + 1}
                      </span>
                      {staticCourse?.image ? (
                        <img
                          src={staticCourse.image}
                          alt={r.course_title}
                          loading="lazy"
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[hsl(250_20%_90%)] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold truncate text-[hsl(250_60%_14%)]">
                            {r.course_title}
                          </span>
                          <span className="text-sm font-black text-[hsl(250_60%_14%)] shrink-0 ml-3">
                            {eur(r.total_revenue_cents)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[hsl(250_20%_92%)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-warm transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[hsl(250_20%_50%)] shrink-0">
                            {r.payment_count} {r.payment_count === 1 ? "venta" : "ventas"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
