import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Play,
  Lock,
  ChevronLeft,
  Award,
  FileText,
  MessageCircle,
  Send,
  ThumbsUp,
  Download,
  BookOpen,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";

/* ─── types ─────────────────────────────────────────────── */
interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  position: number;
  is_free_preview: boolean;
  section_id: string;
}

interface Section {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
}

interface LessonContent {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  is_free_preview: boolean;
}

interface QAAnswer {
  id: string;
  body: string;
  is_instructor_answer: boolean;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface QAQuestion {
  id: string;
  body: string;
  votes_count: number;
  created_at: string;
  my_voted: boolean;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  lesson_answers: QAAnswer[];
}

/* ─── helpers ────────────────────────────────────────────── */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d !== 1 ? "s" : ""}`;
}

/* ─── component ─────────────────────────────────────────── */
const AlumnoCurso = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── queries ── */
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, subtitle")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!slug,
  });

  const { data: sections } = useQuery({
    queryKey: ["course-sections", course?.id],
    queryFn: async () => {
      const [{ data: secs }, { data: lsns }] = await Promise.all([
        supabase
          .from("sections")
          .select("id, title, position")
          .eq("course_id", course!.id)
          .order("position"),
        supabase
          .from("lessons")
          .select("id, title, duration_minutes, position, is_free_preview, section_id")
          .eq("course_id", course!.id)
          .order("position"),
      ]);
      return (secs ?? []).map((s) => ({
        ...s,
        lessons: (lsns ?? []).filter((l) => l.section_id === s.id),
      })) as Section[];
    },
    enabled: !!course?.id,
  });

  const { data: enrollment, isLoading: loadingEnrollment } = useQuery({
    queryKey: ["enrollment", user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user!.id)
        .eq("course_id", course!.id)
        .is("revoked_at", null)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!course?.id,
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user!.id)
        .eq("course_id", course!.id);
      return new Set((data ?? []).map((p) => p.lesson_id));
    },
    enabled: !!user?.id && !!course?.id,
  });

  const { data: lessonContent, isLoading: loadingContent } = useQuery({
    queryKey: ["lesson-content", activeLessonId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_lesson_content", {
        _lesson_id: activeLessonId!,
      });
      if (error) throw error;
      return (data?.[0] ?? null) as LessonContent | null;
    },
    enabled: !!activeLessonId,
  });

  /* ── notes query ── */
  const { data: noteData } = useQuery({
    queryKey: ["lesson-note", user?.id, activeLessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_notes")
        .select("id, body")
        .eq("user_id", user!.id)
        .eq("lesson_id", activeLessonId!)
        .maybeSingle();
      return data as { id: string; body: string } | null;
    },
    enabled: !!user?.id && !!activeLessonId,
  });

  /* ── Q&A query ── */
  const { data: qaList = [] } = useQuery({
    queryKey: ["lesson-qa", activeLessonId, user?.id],
    queryFn: async () => {
      const { data: questions, error } = await supabase
        .from("lesson_questions")
        .select(`
          id, body, votes_count, created_at,
          profiles(full_name, avatar_url),
          lesson_answers(id, body, is_instructor_answer, created_at, profiles(full_name, avatar_url))
        `)
        .eq("lesson_id", activeLessonId!)
        .order("created_at");
      if (error) throw error;

      const ids = (questions ?? []).map((q) => q.id);
      let voted = new Set<string>();
      if (ids.length > 0) {
        const { data: votes } = await supabase
          .from("lesson_question_votes")
          .select("question_id")
          .in("question_id", ids)
          .eq("user_id", user!.id);
        voted = new Set((votes ?? []).map((v) => v.question_id));
      }

      return (questions ?? []).map((q) => ({
        ...q,
        my_voted: voted.has(q.id),
        profiles: q.profiles as QAQuestion["profiles"],
        lesson_answers: (q.lesson_answers ?? []).map((a) => ({
          ...a,
          profiles: a.profiles as QAAnswer["profiles"],
        })) as QAAnswer[],
      })) as QAQuestion[];
    },
    enabled: !!activeLessonId && !!enrollment && !!user?.id,
  });

  /* ── mutations ── */
  const markComplete = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase.from("lesson_progress").insert({
        user_id: user!.id,
        lesson_id: lessonId,
        course_id: course!.id,
      });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-progress", user?.id, course?.id],
      });
    },
  });

  const saveNote = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase
        .from("lesson_notes")
        .upsert(
          { user_id: user!.id, lesson_id: activeLessonId!, body },
          { onConflict: "user_id,lesson_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      setNotesSaving(false);
      setNotesSaved(true);
      queryClient.invalidateQueries({ queryKey: ["lesson-note", user?.id, activeLessonId] });
    },
    onError: () => {
      setNotesSaving(false);
    },
  });

  const postQuestion = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from("lesson_questions").insert({
        user_id: user!.id,
        lesson_id: activeLessonId!,
        course_id: course!.id,
        body,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewQuestion("");
      queryClient.invalidateQueries({ queryKey: ["lesson-qa", activeLessonId, user?.id] });
    },
  });

  const toggleVote = useMutation({
    mutationFn: async (questionId: string) => {
      const { data, error } = await supabase.rpc("toggle_question_vote", {
        p_question_id: questionId,
      });
      if (error) throw error;
      return data as { voted: boolean; votes_count: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-qa", activeLessonId, user?.id] });
    },
  });

  /* ── derived ── */
  const allLessons = sections?.flatMap((s) => s.lessons) ?? [];
  const activeIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const activeLesson = activeIndex >= 0 ? allLessons[activeIndex] : null;
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const completedCount = progress?.size ?? 0;
  const totalLessons = allLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCourseComplete = totalLessons > 0 && completedCount >= totalLessons;

  /* ── effects ── */
  useEffect(() => {
    if (sections && sections.length > 0 && !activeLessonId) {
      const first = sections[0];
      const firstLesson = first?.lessons?.[0];
      if (firstLesson) {
        setActiveLessonId(firstLesson.id);
        setOpenSections(new Set([first.id]));
      }
    }
  }, [sections, activeLessonId]);

  useEffect(() => {
    if (!activeLesson || !sections) return;
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.add(activeLesson.section_id);
      return next;
    });
  }, [activeLesson, sections]);

  // Sync local notes state when navigating to a different lesson
  useEffect(() => {
    setNotes(noteData?.body ?? "");
    setNotesSaved(false);
    setNotesSaving(false);
  }, [noteData]);

  /* ── handlers ── */
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setNotesSaved(false);
    setNotesSaving(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      setNotesSaving(true);
      saveNote.mutate(val);
    }, 1500);
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim() || postQuestion.isPending) return;
    postQuestion.mutate(newQuestion.trim());
  };

  /* ── video renderer ── */
  const renderPlayer = () => {
    if (loadingContent) {
      return (
        <div className="aspect-video bg-black/40 rounded-2xl grid place-items-center">
          <div className="font-display text-lg font-black text-ink-foreground/30 animate-pulse">
            Cargando vídeo…
          </div>
        </div>
      );
    }

    if (activeLesson && !canWatch(activeLesson)) {
      return (
        <div className="aspect-video bg-ink rounded-2xl grid place-items-center">
          <div className="text-center space-y-5 px-6">
            <div className="w-20 h-20 rounded-full bg-ink-foreground/10 grid place-items-center mx-auto">
              <Lock className="w-9 h-9 text-ink-foreground/40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-black text-ink-foreground">Lección de pago</h3>
              <p className="text-ink-foreground/50 text-sm max-w-xs mx-auto">
                Esta lección solo está disponible para alumnos inscritos.
              </p>
            </div>
            <Link
              to={`/curso/${slug}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-glow transition"
            >
              Ver opciones de acceso →
            </Link>
          </div>
        </div>
      );
    }

    if (!lessonContent?.video_url) {
      return (
        <div className="aspect-video bg-black/40 rounded-2xl grid place-items-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 grid place-items-center mx-auto">
              <Play className="w-10 h-10 text-primary/60" />
            </div>
            <p className="text-ink-foreground/40 text-sm">
              {activeLessonId
                ? "Esta lección no tiene vídeo disponible aún."
                : "Selecciona una lección para empezar"}
            </p>
          </div>
        </div>
      );
    }

    const url = lessonContent.video_url;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

    if (vimeoMatch) {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&color=ff6b35`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={lessonContent.title}
          />
        </div>
      );
    }

    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-black">
        <video key={url} src={url} controls autoPlay className="w-full h-full" />
      </div>
    );
  };

  /* ── guards ── */
  if (loadingCourse || loadingEnrollment) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 grid place-items-center mx-auto animate-pulse">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <div className="font-display text-2xl font-black text-foreground animate-pulse">
            Cargando curso…
          </div>
        </div>
      </div>
    );
  }

  if (!course) return <Navigate to="/cursos" replace />;

  const canWatch = (lesson: Lesson | null): boolean =>
    !!enrollment || (lesson?.is_free_preview ?? false);

  /* ── render ── */
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── TOP HEADER ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background shrink-0 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/alumno"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mis cursos</span>
          </Link>
          <div className="w-px h-5 bg-border hidden sm:block" />
          <span className="hidden md:block">
            <Logo variant="default" size="sm" />
          </span>
        </div>

        <h1 className="font-display text-sm md:text-base font-black truncate text-center flex-1 px-4 text-foreground">
          {course.title}
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalLessons} lecciones
            </span>
            <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-warm rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <span className="font-display text-xl font-black text-primary">{progressPct}%</span>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <aside className="w-72 shrink-0 border-r border-ink-foreground/10 overflow-y-auto hidden md:flex flex-col bg-ink text-ink-foreground">
          <div className="p-4 border-b border-ink-foreground/10 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Contenido</span>
              </div>
              <span className="text-xs text-ink-foreground/40">{sections?.length ?? 0} módulos</span>
            </div>
            <div className="flex justify-between text-xs text-ink-foreground/40 mb-1.5">
              <span>{completedCount} completadas</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-ink-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-warm rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {isCourseComplete && (
            <div className="mx-4 mt-4 p-3 rounded-2xl bg-secondary/10 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-xs font-black text-secondary uppercase tracking-widest">¡Completado!</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-ink text-xs font-bold hover:bg-secondary/80 transition">
                <Download className="w-3.5 h-3.5" />
                Descargar certificado
              </button>
            </div>
          )}

          <div className="p-3 space-y-1 flex-1">
            {(sections ?? []).map((section, sIdx) => {
              const isOpen = openSections.has(section.id);
              const sectionDone = section.lessons.filter((l) => progress?.has(l.id)).length;
              const sectionComplete = sectionDone === section.lessons.length && section.lessons.length > 0;

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ink-foreground/5 transition text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-lg grid place-items-center shrink-0 text-[10px] font-black ${
                        sectionComplete ? "bg-green-500/20 text-green-400" : "bg-ink-foreground/10 text-ink-foreground/40"
                      }`}>
                        {sectionComplete ? <CheckCircle className="w-3.5 h-3.5" /> : String(sIdx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate leading-tight">{section.title}</div>
                        <div className="text-[10px] text-ink-foreground/40 mt-0.5">
                          {sectionDone}/{section.lessons.length} · {section.lessons.reduce((a, l) => a + l.duration_minutes, 0)}m
                        </div>
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-ink-foreground/30 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-ink-foreground/30 shrink-0" />
                    }
                  </button>

                  {isOpen && (
                    <div className="ml-3 pl-3 border-l border-ink-foreground/10 space-y-0.5 mb-1">
                      {section.lessons.map((lesson) => {
                        const isActive = activeLessonId === lesson.id;
                        const isDone = progress?.has(lesson.id) ?? false;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition text-sm ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-ink-foreground/5 text-ink-foreground/70"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
                            ) : !enrollment && !lesson.is_free_preview ? (
                              <Lock className={`w-4 h-4 shrink-0 ${isActive ? "opacity-60" : "opacity-20"}`} />
                            ) : (
                              <Circle className={`w-4 h-4 shrink-0 ${isActive ? "opacity-60" : "opacity-25"}`} />
                            )}
                            <span className="flex-1 leading-snug line-clamp-2 text-[13px]">
                              {lesson.title}
                            </span>
                            {lesson.duration_minutes > 0 && (
                              <span className={`text-[10px] tabular-nums shrink-0 ${isActive ? "opacity-70" : "opacity-40"}`}>
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">

            {renderPlayer()}

            {activeLesson && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {sections?.find((s) => s.id === activeLesson.section_id)?.title}
                    </span>
                    {activeLesson.duration_minutes > 0 && (
                      <>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeLesson.duration_minutes} min
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-black text-foreground">
                    {activeLesson.title}
                  </h2>
                  {lessonContent?.description && (
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      {lessonContent.description}
                    </p>
                  )}
                </div>

                {enrollment && (
                  progress?.has(activeLesson.id) ? (
                    <span className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 text-green-600 text-sm font-bold border border-green-500/20">
                      <CheckCircle className="w-4 h-4" />
                      Completada
                    </span>
                  ) : (
                    <button
                      onClick={() => markComplete.mutate(activeLesson.id)}
                      disabled={markComplete.isPending}
                      className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-glow transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {markComplete.isPending ? "Guardando…" : "Marcar completada"}
                    </button>
                  )
                )}
              </div>
            )}

            {/* PREV / NEXT */}
            <div className="flex items-center justify-between gap-3 py-2 border-t border-b border-border">
              <button
                onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-foreground transition
                  disabled:opacity-20 disabled:cursor-not-allowed
                  enabled:hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
                {prevLesson && (
                  <span className="hidden md:inline text-muted-foreground font-normal truncate max-w-[140px]">
                    {prevLesson.title}
                  </span>
                )}
              </button>

              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {activeIndex + 1} / {totalLessons}
              </span>

              <button
                onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                disabled={!nextLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-foreground transition
                  disabled:opacity-20 disabled:cursor-not-allowed
                  enabled:hover:bg-muted"
              >
                {nextLesson && (
                  <span className="hidden md:inline text-muted-foreground font-normal truncate max-w-[140px]">
                    {nextLesson.title}
                  </span>
                )}
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* CERTIFICATE BANNER */}
            {isCourseComplete && (
              <div className="rounded-[1.5rem] bg-secondary/20 border-2 border-secondary/40 p-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-secondary grid place-items-center shrink-0">
                  <Award className="w-8 h-8 text-ink" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs font-black uppercase tracking-widest text-ink/70 mb-1">¡Enhorabuena!</div>
                  <h3 className="font-display text-xl font-black text-foreground">Has completado el curso</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tu certificado ya está listo para descargarlo y compartirlo.
                  </p>
                </div>
                <button className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-ink text-sm font-bold hover:bg-secondary/80 transition">
                  <Download className="w-4 h-4" />
                  Descargar certificado
                </button>
              </div>
            )}

            {/* TABS: Descripción / Notas / Q&A */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-muted border border-border p-1 rounded-2xl w-full sm:w-auto">
                <TabsTrigger
                  value="description"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Descripción
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Mis notas
                </TabsTrigger>
                <TabsTrigger
                  value="qa"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Preguntas
                  {qaList.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted-foreground/20 text-[10px] tabular-nums">
                      {qaList.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* TAB: Descripción */}
              <TabsContent value="description" className="mt-4">
                <div className="bg-muted/50 rounded-2xl p-5 space-y-3 border border-border">
                  {lessonContent?.content ? (
                    <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">
                      {lessonContent.content}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      No hay descripción adicional para esta lección.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* TAB: Notas */}
              <TabsContent value="notes" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Tus notas de esta lección. Solo tú las puedes ver.
                    </p>
                    {notesSaving && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse inline-block" />
                        Guardando…
                      </span>
                    )}
                    {notesSaved && !notesSaving && notes.length > 0 && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Guardado
                      </span>
                    )}
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Escribe aquí tus apuntes, ideas o lo que quieras recordar de esta lección…"
                    className="min-h-[200px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none rounded-2xl text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-muted-foreground/60">
                    Las notas se guardan automáticamente en la nube.
                  </p>
                </div>
              </TabsContent>

              {/* TAB: Q&A */}
              <TabsContent value="qa" className="mt-4 space-y-5">
                {!enrollment ? (
                  <div className="text-center py-10 bg-muted/50 rounded-2xl border border-border">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-foreground" />
                    <p className="text-sm text-muted-foreground">Inscríbete al curso para acceder al foro de preguntas.</p>
                  </div>
                ) : (
                  <>
                    {/* Ask a question */}
                    <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">
                        Hacer una pregunta
                      </p>
                      <Textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="¿Tienes alguna duda sobre esta lección? La comunidad te responderá…"
                        className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none rounded-xl text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAskQuestion();
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/60">Ctrl+Enter para enviar</span>
                        <button
                          onClick={handleAskQuestion}
                          disabled={!newQuestion.trim() || postQuestion.isPending}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-glow transition disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {postQuestion.isPending ? "Publicando…" : "Publicar pregunta"}
                        </button>
                      </div>
                    </div>

                    {/* Q&A list */}
                    <div className="space-y-4">
                      {qaList.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Todavía no hay preguntas. ¡Sé el primero!</p>
                        </div>
                      )}

                      {qaList.map((qa) => (
                        <div key={qa.id} className="space-y-3">
                          {/* Question */}
                          <div className="flex gap-3">
                            {qa.profiles?.avatar_url ? (
                              <img
                                src={qa.profiles.avatar_url}
                                alt={qa.profiles.full_name ?? "Usuario"}
                                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-border"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/20 grid place-items-center shrink-0 ring-2 ring-border">
                                <span className="text-primary text-xs font-black">
                                  {(qa.profiles?.full_name ?? "U")[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 bg-muted/60 border border-border rounded-2xl rounded-tl-none p-4">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-bold text-foreground">
                                  {qa.profiles?.full_name ?? "Alumno"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {relativeTime(qa.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">{qa.body}</p>
                              <button
                                onClick={() => toggleVote.mutate(qa.id)}
                                disabled={toggleVote.isPending}
                                className={`mt-3 flex items-center gap-1.5 text-xs transition disabled:opacity-50 ${
                                  qa.my_voted ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {qa.votes_count} útil{qa.votes_count !== 1 ? "es" : ""}
                              </button>
                            </div>
                          </div>

                          {/* Answers */}
                          {qa.lesson_answers.map((ans) => (
                            <div key={ans.id} className="flex gap-3 ml-6">
                              <div className="w-9 h-9 rounded-full bg-primary/20 grid place-items-center shrink-0">
                                <span className="text-primary text-[10px] font-black">
                                  {ans.is_instructor_answer ? "PRO" : (ans.profiles?.full_name ?? "A")[0].toUpperCase()}
                                </span>
                              </div>
                              <div className={`flex-1 rounded-2xl rounded-tl-none p-4 ${
                                ans.is_instructor_answer
                                  ? "bg-primary/5 border border-primary/20"
                                  : "bg-muted/60 border border-border"
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-sm font-bold ${ans.is_instructor_answer ? "text-primary" : "text-foreground"}`}>
                                    {ans.is_instructor_answer ? "Instructor" : (ans.profiles?.full_name ?? "Alumno")}
                                  </span>
                                  {ans.is_instructor_answer && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">Verificado</span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground ml-auto">
                                    {relativeTime(ans.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">{ans.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* MOBILE: lesson list */}
            <div className="md:hidden mt-2 space-y-1.5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Lecciones del curso</span>
              </div>
              {(sections ?? []).map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition text-left"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {section.title}
                    </span>
                    {openSections.has(section.id)
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </button>
                  {openSections.has(section.id) && (
                    <div className="space-y-0.5 mb-1">
                      {section.lessons.map((lesson) => {
                        const isActive = activeLessonId === lesson.id;
                        const isDone = progress?.has(lesson.id) ?? false;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-sm ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                          >
                            {isDone
                              ? <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                              : !enrollment && !lesson.is_free_preview
                              ? <Lock className="w-4 h-4 shrink-0 opacity-30" />
                              : <Circle className="w-4 h-4 shrink-0 opacity-30" />
                            }
                            <span className="flex-1 leading-snug text-[13px]">{lesson.title}</span>
                            {lesson.duration_minutes > 0 && (
                              <span className="text-[10px] tabular-nums opacity-50 shrink-0">
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumnoCurso;
