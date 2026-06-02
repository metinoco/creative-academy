import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Users, BookOpen, CheckSquare, TrendingUp, ArrowUp, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";

const HONEY     = "bg-[hsl(326_85%_55%)]";
const HONEY_TXT = "text-[hsl(326_85%_50%)]";
const CLAY      = "bg-[hsl(265_82%_58%)]";
const MOSS      = "bg-[hsl(172_75%_42%)]";
const TEAL      = "bg-[hsl(195_80%_46%)]";
const ADMIN_CARD   = "bg-white";
const ADMIN_BORDER = "border-[hsl(250_20%_90%)]";
const ADMIN_SURFACE = "bg-[hsl(250_30%_96%)]";

interface CourseStatRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  active_enrollments: number;
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

export default function AdminDashboard() {
  const results = useQueries({
    queries: [
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
      {
        queryKey: ["admin", "top-courses"],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("admin_get_course_stats");
          if (error) throw error;
          return (data as CourseStatRow[]).slice(0, 4);
        },
      },
    ],
  });

  const [totalEnrollments, newThisMonth, publishedCourses, completedLessons, topCourses] = results;

  const statsConfig = [
    {
      label: "Alumnos activos",
      value: totalEnrollments.data?.toLocaleString("es") ?? "—",
      icon: Users,
      accent: HONEY,
      accentTxt: HONEY_TXT,
      loading: totalEnrollments.isLoading,
    },
    {
      label: "Nuevos este mes",
      value: newThisMonth.data?.toLocaleString("es") ?? "—",
      icon: ArrowUp,
      accent: CLAY,
      accentTxt: "text-[hsl(265_82%_55%)]",
      loading: newThisMonth.isLoading,
    },
    {
      label: "Cursos activos",
      value: publishedCourses.data?.toLocaleString("es") ?? "—",
      icon: BookOpen,
      accent: MOSS,
      accentTxt: "text-[hsl(172_75%_35%)]",
      loading: publishedCourses.isLoading,
    },
    {
      label: "Lecciones completadas",
      value: completedLessons.data?.toLocaleString("es") ?? "—",
      icon: CheckSquare,
      accent: TEAL,
      accentTxt: "text-[hsl(195_80%_38%)]",
      loading: completedLessons.isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          )
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* REVENUE CHART — Stripe placeholder */}
        <div className={`lg:col-span-2 ${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 relative overflow-hidden`}>
          {/* Blurred overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-3 rounded-3xl">
            <div className={`w-12 h-12 rounded-2xl ${ADMIN_SURFACE} flex items-center justify-center`}>
              <Lock className="w-5 h-5 text-[hsl(250_20%_50%)]" />
            </div>
            <div className="text-center">
              <div className="font-display font-black text-[hsl(250_60%_14%)] text-lg">Próximamente</div>
              <div className="text-xs text-[hsl(250_20%_50%)] mt-1">Disponible con integración Stripe</div>
            </div>
          </div>

          {/* Ghost content */}
          <div className="opacity-30 select-none pointer-events-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl font-black text-[hsl(250_60%_14%)]">
                  Ingresos · últimos 30 días
                </h3>
                <p className="text-xs text-[hsl(250_20%_50%)] mt-1">Comparado con periodo anterior</p>
              </div>
            </div>
            <div className="h-56 bg-[hsl(250_20%_95%)] rounded-2xl" />
            <div className={`grid grid-cols-4 gap-4 pt-6 border-t ${ADMIN_BORDER} mt-4 text-center`}>
              {["Ticket medio", "Mejor día", "Refunds", "LTV alumno"].map((k) => (
                <div key={k}>
                  <div className="text-[10px] uppercase tracking-widest text-[hsl(250_20%_50%)] font-bold">{k}</div>
                  <div className="font-display text-lg mt-1 font-black text-[hsl(250_60%_14%)]">—</div>
                </div>
              ))}
            </div>
          </div>
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

      {/* RECENT SALES — Stripe placeholder */}
      <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-3 rounded-3xl">
          <div className={`w-12 h-12 rounded-2xl ${ADMIN_SURFACE} flex items-center justify-center`}>
            <Lock className="w-5 h-5 text-[hsl(250_20%_50%)]" />
          </div>
          <div className="text-center">
            <div className="font-display font-black text-[hsl(250_60%_14%)] text-lg">Ventas recientes</div>
            <div className="text-xs text-[hsl(250_20%_50%)] mt-1">
              Disponible con integración Stripe · Ver{" "}
              <Link to="#ventas" className={`${HONEY_TXT} hover:underline`}>sección Ventas</Link>
            </div>
          </div>
        </div>

        <div className="opacity-30 select-none pointer-events-none">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-black text-[hsl(250_60%_14%)]">Ventas recientes</h3>
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(250_20%_90%)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[hsl(250_20%_90%)] rounded w-1/3" />
                  <div className="h-2 bg-[hsl(250_20%_90%)] rounded w-1/4" />
                </div>
                <div className="h-4 w-12 bg-[hsl(250_20%_90%)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
