import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, Pencil, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Design-system "Warm Ink" tokens ───────────────────────────────────────────
const ADMIN_CARD    = "bg-white";
const ADMIN_BORDER  = "border-[hsl(30_20%_84%)]";
const ADMIN_SURFACE = "bg-[hsl(38_40%_96%)]";
const PRIMARY       = "bg-[hsl(14_78%_52%)]";
const PRIMARY_TXT   = "text-[hsl(14_78%_52%)]";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number;
  category: string;
  author: string;
  lessons_count: number;
  active_enrollments: number;
}

interface AdminCursosProps {
  onNewCourse: () => void;
  onEditCourse: (id: string) => void;
}

export default function AdminCursos({ onNewCourse, onEditCourse }: AdminCursosProps) {
  const [search, setSearch] = useState("");

  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "course-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_course_stats");
      if (error) throw error;
      return data as CourseRow[];
    },
  });

  const filtered = (courses ?? []).filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const published = (courses ?? []).filter((c) => c.status === "published").length;
  const drafts    = (courses ?? []).filter((c) => c.status === "draft").length;

  return (
    <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER}`}>
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black text-[hsl(24_25%_12%)]">
            Catálogo de cursos
          </h2>
          {!isLoading && (
            <p className="text-xs text-[hsl(24_12%_50%)] mt-0.5">
              {courses?.length ?? 0} cursos · {published} publicados · {drafts} borradores
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(24_12%_50%)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso, instructor…"
              className={`w-full ${ADMIN_SURFACE} rounded-full pl-11 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[hsl(14_78%_52%)]/40`}
            />
          </div>
          <button
            onClick={onNewCourse}
            className={`inline-flex items-center gap-2 rounded-full ${PRIMARY} text-white px-4 py-2 text-sm font-bold hover:bg-[hsl(14_78%_46%)] transition shrink-0`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo curso</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-[hsl(30_20%_84%)] rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[hsl(30_20%_84%)] rounded w-1/3" />
                <div className="h-2 bg-[hsl(30_20%_84%)] rounded w-1/5" />
              </div>
              <div className="h-6 w-20 bg-[hsl(30_20%_84%)] rounded-full" />
              <div className="h-3 w-10 bg-[hsl(30_20%_84%)] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <p className="text-sm text-[hsl(24_12%_50%)]">Error al cargar los cursos.</p>
          <button
            onClick={() => refetch()}
            className={`mt-3 text-xs font-bold ${PRIMARY_TXT} hover:underline`}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${ADMIN_SURFACE}/60 text-[10px] uppercase tracking-widest text-[hsl(24_12%_50%)]`}>
              <tr>
                <th className="text-left font-bold px-6 py-3">Curso</th>
                <th className="text-left font-bold px-2 py-3">Estado</th>
                <th className="text-left font-bold px-2 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-right font-bold px-2 py-3">Matrículas</th>
                <th className="text-right font-bold px-2 py-3 hidden sm:table-cell">Precio</th>
                <th className="text-right font-bold px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${ADMIN_BORDER} text-sm`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[hsl(24_12%_50%)]">
                    No hay cursos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const staticC = staticCourses.find((s) => s.id === c.slug);
                  const isPublished = c.status === "published";
                  return (
                    <tr key={c.id} className="hover:bg-[hsl(38_40%_96%)]/40 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {staticC?.image ? (
                            <img
                              src={staticC.image}
                              alt={c.title}
                              loading="lazy"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[hsl(30_20%_84%)] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-[hsl(24_25%_12%)] truncate">
                              {c.title}
                            </div>
                            <div className="text-xs text-[hsl(24_12%_50%)] truncate">{c.author}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isPublished
                              ? "bg-[hsl(14_78%_52%)]/15 text-[hsl(14_78%_42%)]"
                              : "bg-[hsl(38_30%_88%)] text-[hsl(24_12%_45%)]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-[hsl(14_78%_52%)]" : "bg-[hsl(24_12%_55%)]"}`}
                          />
                          {isPublished ? "Publicado" : "Borrador"}
                        </span>
                      </td>

                      <td className="px-2 py-3 hidden md:table-cell">
                        <span className="text-xs text-[hsl(24_12%_50%)]">{c.category}</span>
                      </td>

                      <td className="px-2 py-3 text-right tabular-nums font-bold text-[hsl(24_25%_12%)]">
                        {c.active_enrollments.toLocaleString("es")}
                      </td>

                      <td className="px-2 py-3 text-right hidden sm:table-cell">
                        <span className="text-sm font-bold text-[hsl(24_25%_12%)]">{c.price}€</span>
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  to={`/curso/${c.slug}`}
                                  target="_blank"
                                  className="w-8 h-8 rounded-full hover:bg-[hsl(38_40%_96%)] grid place-items-center transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Ver en catálogo</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => onEditCourse(c.id)}
                                  className="w-8 h-8 rounded-full grid place-items-center hover:bg-[hsl(38_40%_96%)] transition"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Editar curso</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
