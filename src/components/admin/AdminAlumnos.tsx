import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Plus, BookOpen, ChevronRight, RotateCcw, Pencil, Bell, Send, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ── Design-system "Warm Ink" tokens ───────────────────────────────────────────
const ADMIN_CARD    = "bg-white";
const ADMIN_BORDER  = "border-[hsl(30_20%_84%)]";
const ADMIN_SURFACE = "bg-[hsl(38_40%_96%)]";
const PRIMARY       = "bg-[hsl(14_78%_52%)]";
const PRIMARY_TXT   = "text-[hsl(14_78%_52%)]";
const INK_BG        = "bg-[hsl(24_25%_12%)]";

interface StudentRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  created_at: string;
  active_enrollment_count: number;
}

interface EnrollmentRow {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  source: string;
  granted_at: string;
  revoked_at: string | null;
}

interface CourseOption {
  id: string;
  slug: string;
  title: string;
}

function initials(name: string | null, email: string) {
  if (name) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }
  return email[0].toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function notifyAccessGranted(to: string, courseTitle: string, courseSlug: string) {
  supabase.functions
    .invoke("send-email", { body: { type: "course_access", to, courseTitle, courseSlug } })
    .catch(console.error);
}

function notifyAccessRevoked(to: string, courseTitle: string) {
  supabase.functions
    .invoke("send-email", { body: { type: "access_revoked", to, courseTitle } })
    .catch(console.error);
}

// ── Student modal ──────────────────────────────────────────────────────────────
function StudentModal({
  student,
  open,
  onClose,
}: {
  student: StudentRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [revokeTarget, setRevokeTarget]         = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["admin", "student-enrollments", student?.id],
    enabled: !!student?.id && open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_student_enrollments", {
        _user_id: student!.id,
      });
      if (error) throw error;
      return data as EnrollmentRow[];
    },
  });

  const { data: allCourses } = useQuery({
    queryKey: ["admin", "course-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_course_stats");
      if (error) throw error;
      return data as CourseOption[];
    },
  });

  const activeIds = new Set(
    (enrollments ?? []).filter((e) => !e.revoked_at).map((e) => e.course_id)
  );
  const grantableOptions = (allCourses ?? []).filter((c) => !activeIds.has(c.id));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "student-enrollments", student?.id] });
    qc.invalidateQueries({ queryKey: ["admin", "total-active-enrollments"] });
    qc.invalidateQueries({ queryKey: ["admin", "students"] });
  };

  const grantMutation = useMutation({
    mutationFn: async ({ courseId }: { courseId: string; courseTitle: string; courseSlug: string }) => {
      const { error } = await supabase.rpc("admin_grant_course_access", {
        _user_id: student!.id,
        _course_id: courseId,
      });
      if (error) throw error;
    },
    onSuccess: (_, { courseTitle, courseSlug }) => {
      toast({ title: "Acceso concedido", variant: "success" });
      notifyAccessGranted(student!.email, courseTitle, courseSlug);
      setSelectedCourseId("");
      invalidate();
    },
    onError: () => toast({ title: "Error al conceder acceso", variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ courseId }: { courseId: string; courseTitle: string }) => {
      const { error } = await supabase
        .from("enrollments")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", student!.id)
        .eq("course_id", courseId)
        .is("revoked_at", null);
      if (error) throw error;
    },
    onSuccess: (_, { courseTitle }) => {
      toast({ title: "Acceso revocado", variant: "destructive" });
      notifyAccessRevoked(student!.email, courseTitle);
      setRevokeTarget(null);
      invalidate();
    },
    onError: () => toast({ title: "Error al revocar acceso", variant: "destructive" }),
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      const { error } = await supabase.rpc("admin_grant_course_access", {
        _user_id: student!.id,
        _course_id: courseId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Acceso restaurado", variant: "success" });
      invalidate();
    },
    onError: () => toast({ title: "Error al restaurar acceso", variant: "destructive" }),
  });

  if (!student) return null;

  const displayName = student.full_name ?? student.email;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 flex flex-col overflow-hidden max-h-[90dvh] w-[calc(100%-2rem)] sm:max-w-lg rounded-2xl [&>button]:text-white/70 [&>button:hover]:text-white/100"
      >
        {/* Header */}
        <div className={`${INK_BG} text-[hsl(38_50%_97%)] px-6 pt-6 pb-5 shrink-0`}>
          <DialogTitle className="sr-only">{displayName}</DialogTitle>
          <div className="flex items-center gap-4 pr-6">
            <div className={`w-14 h-14 rounded-2xl ${PRIMARY} grid place-items-center text-white text-lg font-black shrink-0`}>
              {initials(student.full_name, student.email)}
            </div>
            <div className="min-w-0">
              <p className="text-[hsl(38_50%_97%)] font-display text-xl font-black truncate">
                {displayName}
              </p>
              <p className="text-xs text-[hsl(38_30%_72%)] truncate">{student.email}</p>
              <p className="text-xs text-[hsl(38_20%_60%)] mt-0.5">
                Registrado el {formatDate(student.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollments list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-[hsl(24_25%_12%)] uppercase tracking-wider">
              Matrículas
            </h3>
            <span className="text-xs text-[hsl(24_12%_50%)]">
              {student.active_enrollment_count} activas
            </span>
          </div>

          {loadingEnrollments ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-2xl bg-[hsl(38_30%_94%)]">
                  <div className="w-8 h-8 bg-[hsl(30_20%_84%)] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[hsl(30_20%_84%)] rounded w-3/4" />
                    <div className="h-2 bg-[hsl(30_20%_84%)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (enrollments ?? []).length === 0 ? (
            <div className="text-center py-8 text-sm text-[hsl(24_12%_50%)]">
              Sin matrículas aún.
            </div>
          ) : (
            (enrollments ?? []).map((e) => {
              const isActive = !e.revoked_at;
              return (
                <div
                  key={e.enrollment_id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                    isActive
                      ? `bg-white ${ADMIN_BORDER}`
                      : "bg-[hsl(38_30%_97%)] border-[hsl(30_20%_88%)] opacity-60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${
                    isActive ? "bg-[hsl(14_78%_52%)]/10" : "bg-[hsl(30_20%_88%)]"
                  }`}>
                    <BookOpen className={`w-4 h-4 ${
                      isActive ? "text-[hsl(14_78%_46%)]" : "text-[hsl(24_12%_55%)]"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[hsl(24_25%_12%)] truncate">
                      {e.course_title}
                    </div>
                    <div className="text-xs text-[hsl(24_12%_50%)]">
                      {isActive ? (
                        <>Activa · {e.source}</>
                      ) : (
                        <>Revocada · {formatDate(e.revoked_at!)}</>
                      )}
                    </div>
                  </div>

                  {isActive ? (
                    revokeTarget === e.course_id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] font-bold text-red-600 hidden xs:inline">¿Confirmar?</span>
                        <button
                          onClick={() => revokeMutation.mutate({ courseId: e.course_id, courseTitle: e.course_title })}
                          disabled={revokeMutation.isPending}
                          className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition disabled:opacity-50"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setRevokeTarget(null)}
                          className="px-2 py-1 rounded-lg bg-[hsl(38_35%_90%)] hover:bg-[hsl(38_30%_84%)] text-[hsl(24_25%_12%)] text-[11px] font-bold transition"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokeTarget(e.course_id)}
                        disabled={revokeMutation.isPending}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 grid place-items-center transition shrink-0"
                        title="Revocar acceso"
                      >
                        <UserX className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => restoreMutation.mutate({ courseId: e.course_id })}
                      disabled={restoreMutation.isPending}
                      className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 grid place-items-center transition shrink-0"
                      title="Restaurar acceso"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Grant access */}
        <div className={`p-4 border-t ${ADMIN_BORDER} shrink-0 space-y-2`}>
          <p className="text-xs font-black uppercase tracking-wider text-[hsl(24_12%_50%)]">
            Dar acceso a curso
          </p>
          <div className="flex gap-2">
            <Select
              value={selectedCourseId || undefined}
              onValueChange={(v) => setSelectedCourseId(v)}
            >
              <SelectTrigger className="flex-1 h-10 rounded-xl bg-[hsl(38_40%_96%)] border-[hsl(30_20%_84%)] text-sm text-[hsl(24_25%_12%)] hover:bg-[hsl(38_35%_92%)] focus:ring-[hsl(14_78%_52%)]/40 focus:ring-2 focus:ring-offset-0 data-[placeholder]:text-[hsl(24_12%_55%)]">
                <SelectValue placeholder="Seleccionar curso…" />
              </SelectTrigger>
              <SelectContent>
                {grantableOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-center text-[hsl(24_12%_55%)]">
                    El alumno ya tiene acceso a todos los cursos.
                  </div>
                ) : (
                  grantableOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <button
              disabled={!selectedCourseId || grantMutation.isPending}
              onClick={() => {
                const found = allCourses?.find((c) => c.id === selectedCourseId);
                grantMutation.mutate({
                  courseId: selectedCourseId,
                  courseTitle: found?.title ?? "",
                  courseSlug: found?.slug ?? "",
                });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${PRIMARY} text-white text-sm font-bold hover:bg-[hsl(14_78%_44%)] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
            >
              <Plus className="w-4 h-4" />
              Dar acceso
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Reminder panel ────────────────────────────────────────────────────────────

interface InactiveStudentPreview {
  email: string;
  full_name: string | null;
  course_title: string;
  course_slug: string;
  days_since: number;
  lessons_done: number;
  last_activity: string;
}

function ReminderPanel() {
  const [daysInactive, setDaysInactive] = useState(14);
  const [preview, setPreview]     = useState<InactiveStudentPreview[] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [sending, setSending]     = useState(false);
  const [confirm, setConfirm]     = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  const detect = async () => {
    setDetecting(true);
    setPreview(null);
    setConfirm(false);
    try {
      const { data, error } = await supabase.functions.invoke("send-activity-reminder", {
        body: { dry_run: true, days_inactive: daysInactive },
      });
      if (error) throw error;
      setPreview(data.students ?? []);
    } catch {
      toast({ title: "Error al detectar alumnos inactivos", variant: "destructive" });
    } finally {
      setDetecting(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) return;
    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke("send-activity-reminder", {
        body: { send_test: testEmail.trim() },
      });
      if (error) throw error;
      toast({ title: `Email de prueba enviado a ${testEmail.trim()}`, variant: "success" });
      setTestEmail("");
    } catch {
      toast({ title: "Error al enviar el email de prueba", variant: "destructive" });
    } finally {
      setSendingTest(false);
    }
  };

  const send = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-activity-reminder", {
        body: { dry_run: false, days_inactive: daysInactive },
      });
      if (error) throw error;
      toast({
        title: `${data.sent} recordatorio${data.sent !== 1 ? "s" : ""} enviado${data.sent !== 1 ? "s" : ""}`,
        variant: "success",
      });
      setPreview(null);
      setConfirm(false);
    } catch {
      toast({ title: "Error al enviar recordatorios", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER}`}>
      {/* Header */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(14_78%_52%)]/10 grid place-items-center shrink-0">
            <Bell className="w-5 h-5 text-[hsl(14_78%_46%)]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-[hsl(24_25%_12%)]">
              Recordatorios de inactividad
            </h2>
            <p className="text-xs text-[hsl(24_12%_50%)] mt-0.5">
              Detecta alumnos sin actividad reciente en cursos comprados
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[hsl(38_40%_96%)] border border-[hsl(30_20%_84%)] rounded-xl px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-[hsl(24_12%_50%)]" />
            <span className="text-xs text-[hsl(24_12%_50%)]">Sin actividad &gt;</span>
            <select
              value={daysInactive}
              onChange={(e) => { setDaysInactive(Number(e.target.value)); setPreview(null); }}
              className="bg-transparent text-xs font-bold text-[hsl(24_25%_12%)] focus:outline-none cursor-pointer"
            >
              {[7, 14, 21, 30].map((d) => (
                <option key={d} value={d}>{d} días</option>
              ))}
            </select>
          </div>

          <button
            onClick={detect}
            disabled={detecting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(24_25%_12%)] hover:bg-[hsl(24_25%_18%)] text-white text-sm font-bold transition disabled:opacity-50"
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Detectar
          </button>
        </div>
      </div>

      {/* Test send */}
      <div className={`px-6 pb-5 border-t ${ADMIN_BORDER} pt-4`}>
        <p className="text-xs font-black uppercase tracking-wider text-[hsl(24_12%_50%)] mb-2">
          Enviar email de prueba
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendTest()}
            placeholder="correo@ejemplo.com"
            className={`flex-1 ${ADMIN_SURFACE} rounded-xl px-4 py-2 text-sm border border-[hsl(30_20%_84%)] focus:outline-none focus:ring-2 focus:ring-[hsl(14_78%_52%)]/40`}
          />
          <button
            onClick={sendTest}
            disabled={!testEmail.trim() || sendingTest}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${PRIMARY} text-white text-sm font-bold hover:bg-[hsl(14_78%_44%)] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
          >
            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar
          </button>
        </div>
      </div>

      {/* Results */}
      {preview !== null && (
        <div className={`border-t ${ADMIN_BORDER}`}>
          {preview.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-bold text-[hsl(24_25%_12%)]">¡Ningún alumno inactivo!</p>
              <p className="text-xs text-[hsl(24_12%_50%)] mt-1">
                Todos los alumnos han tenido actividad en los últimos {daysInactive} días.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[hsl(24_12%_50%)]">
                  {preview.length} alumno{preview.length !== 1 ? "s" : ""} inactivo{preview.length !== 1 ? "s" : ""}
                </span>
                {confirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[hsl(24_25%_12%)] hidden sm:inline">
                      ¿Enviar {preview.length} email{preview.length !== 1 ? "s" : ""}?
                    </span>
                    <button
                      onClick={send}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(14_78%_52%)] hover:bg-[hsl(14_78%_44%)] text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Sí, enviar
                    </button>
                    <button
                      onClick={() => setConfirm(false)}
                      disabled={sending}
                      className="px-3 py-1.5 rounded-xl bg-[hsl(38_40%_96%)] border border-[hsl(30_20%_84%)] text-xs font-bold text-[hsl(24_25%_12%)] hover:bg-[hsl(38_35%_90%)] transition"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(14_78%_52%)] hover:bg-[hsl(14_78%_44%)] text-white text-xs font-bold transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar recordatorios
                  </button>
                )}
              </div>

              {confirm && (
                <div className="mx-6 mb-4 flex items-start gap-2 bg-[hsl(38_80%_96%)] border border-[hsl(38_60%_80%)] rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-[hsl(38_80%_50%)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[hsl(24_25%_20%)]">
                    Se enviará un email a cada alumno de la lista. Asegúrate de no haberlo enviado ya recientemente.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[hsl(38_40%_96%)]/60 text-[10px] uppercase tracking-widest text-[hsl(24_12%_50%)]">
                    <tr>
                      <th className="text-left font-bold px-6 py-3">Alumno</th>
                      <th className="text-left font-bold px-2 py-3 hidden sm:table-cell">Curso</th>
                      <th className="text-right font-bold px-2 py-3">Días sin actividad</th>
                      <th className="text-right font-bold px-6 py-3 hidden md:table-cell">Lecciones</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${ADMIN_BORDER} text-sm`}>
                    {preview.map((s, i) => (
                      <tr key={i} className="hover:bg-[hsl(38_40%_96%)]/40 transition">
                        <td className="px-6 py-3">
                          <div className="font-bold text-[hsl(24_25%_12%)] truncate max-w-[140px]">
                            {s.full_name ?? s.email.split("@")[0]}
                          </div>
                          <div className="text-xs text-[hsl(24_12%_50%)] truncate max-w-[140px] sm:hidden">
                            {s.course_title}
                          </div>
                          <div className="text-xs text-[hsl(24_12%_50%)] truncate max-w-[160px]">
                            {s.email}
                          </div>
                        </td>
                        <td className="px-2 py-3 hidden sm:table-cell">
                          <div className="text-sm text-[hsl(24_25%_20%)] truncate max-w-[180px]">
                            {s.course_title}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
                            s.days_since >= 30
                              ? "bg-red-50 text-red-600"
                              : "bg-[hsl(38_60%_92%)] text-[hsl(24_25%_20%)]"
                          }`}>
                            <Clock className="w-3 h-3" />
                            {s.days_since}d
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right hidden md:table-cell">
                          <span className="text-xs text-[hsl(24_12%_50%)]">
                            {s.lessons_done} completadas
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminAlumnos() {
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<StudentRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: students, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_students");
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  const filtered = (students ?? []).filter(
    (s) =>
      !search ||
      (s.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (student: StudentRow) => {
    setSelected(student);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className={`${ADMIN_CARD} rounded-3xl border ${ADMIN_BORDER}`}>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black text-[hsl(24_25%_12%)]">Alumnos</h2>
            {!isLoading && (
              <p className="text-xs text-[hsl(24_12%_50%)] mt-0.5">
                {students?.length ?? 0} cuentas registradas
              </p>
            )}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(24_12%_50%)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className={`w-full ${ADMIN_SURFACE} rounded-full pl-11 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[hsl(14_78%_52%)]/40`}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-[hsl(30_20%_88%)] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[hsl(30_20%_88%)] rounded w-1/3" />
                  <div className="h-2 bg-[hsl(30_20%_88%)] rounded w-1/2" />
                </div>
                <div className="h-6 w-8 bg-[hsl(30_20%_88%)] rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[hsl(24_12%_50%)]">Error al cargar los alumnos.</p>
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
                  <th className="text-left font-bold px-6 py-3">Alumno</th>
                  <th className="text-right font-bold px-2 py-3">Cursos activos</th>
                  <th className="text-right font-bold px-2 py-3 hidden sm:table-cell">Registro</th>
                  <th className="text-right font-bold px-6 py-3">Gestionar</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${ADMIN_BORDER} text-sm`}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-[hsl(24_12%_50%)]">
                      No hay alumnos que coincidan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[hsl(38_40%_96%)]/40 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${PRIMARY} grid place-items-center text-white text-xs font-black shrink-0`}>
                            {initials(s.full_name, s.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[hsl(24_25%_12%)] truncate">
                              {s.full_name ?? "Sin nombre"}
                            </div>
                            <div className="text-xs text-[hsl(24_12%_50%)] truncate">{s.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          s.active_enrollment_count > 0 ? PRIMARY_TXT : "text-[hsl(24_12%_55%)]"
                        }`}>
                          <UserCheck className="w-3.5 h-3.5" />
                          {s.active_enrollment_count}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-right hidden sm:table-cell">
                        <span className="text-xs text-[hsl(24_12%_50%)]">
                          {formatDate(s.created_at)}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleOpen(s)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(24_25%_12%)] hover:text-[hsl(14_78%_52%)] transition"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:hidden" />
                          <span className="hidden sm:inline">Gestionar</span>
                          <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentModal
        student={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ReminderPanel />
    </div>
  );
}
