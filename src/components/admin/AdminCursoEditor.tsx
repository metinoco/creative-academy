import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Pencil, Trash2, Plus, Eye, EyeOff,
  Loader2, BookOpen, ChevronDown, ChevronRight, Check, X, ChevronsUpDown, GripVertical,
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Database } from "@/integrations/supabase/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
const INK_BG        = "bg-[hsl(24_25%_12%)]";
const INK_FG        = "text-[hsl(38_50%_98%)]";
const ADMIN_SURFACE = "bg-[hsl(38_40%_96%)]";
const ADMIN_BORDER  = "border-[hsl(30_20%_84%)]";
const ADMIN_CARD    = "bg-white";

// ── Types ─────────────────────────────────────────────────────────────────────
type CourseRow  = Database["public"]["Tables"]["courses"]["Row"];
type SectionRow = Database["public"]["Tables"]["sections"]["Row"];
type LessonRow  = Database["public"]["Tables"]["lessons"]["Row"];
type SectionWithLessons = SectionRow & { lessons: LessonRow[] };

// ── Schema ────────────────────────────────────────────────────────────────────
const courseSchema = z.object({
  title:         z.string().min(1, "El título es requerido"),
  slug:          z.string().min(1, "El slug es requerido").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  subtitle:      z.string().optional(),
  description:   z.string().optional(),
  category:      z.string().min(1, "La categoría es requerida"),
  author:        z.string().min(1, "El instructor es requerido"),
  price:         z.coerce.number().min(0, "El precio debe ser positivo"),
  duration_text: z.string().optional(),
  image_url:     z.string().optional().refine(v => !v || v.startsWith("http"), "Debe ser una URL válida"),
  tone:          z.enum(["warm", "cream", "sun", "ink"]),
  is_featured:   z.boolean(),
  is_new:        z.boolean(),
});
type CourseFormData = z.infer<typeof courseSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const toneConfig: { value: CourseFormData["tone"]; label: string; bg: string }[] = [
  { value: "warm",  label: "Cálido", bg: "bg-[hsl(14_78%_52%)]"  },
  { value: "cream", label: "Crema",  bg: "bg-[hsl(38_55%_88%)]"  },
  { value: "sun",   label: "Solar",  bg: "bg-[hsl(48_90%_60%)]"  },
  { value: "ink",   label: "Tinta",  bg: "bg-[hsl(24_25%_12%)]"  },
];

const STATIC_CATEGORIES = [
  "3D", "Animación", "Audio", "Cerámica", "Editorial", "Escritura",
  "Fotografía", "Identidad de marca", "Ilustración", "Lettering",
  "Pintura", "Print", "Social media", "Tipografía", "UX/UI", "Vídeo",
];

// ── Category Combobox ─────────────────────────────────────────────────────────
function CategoryCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: dbCategories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("category").order("category");
      return [...new Set((data ?? []).map((r) => r.category).filter(Boolean))] as string[];
    },
  });

  const allCategories = [...new Set([...STATIC_CATEGORIES, ...(dbCategories ?? [])])].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  const filtered = search
    ? allCategories.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : allCategories;

  const showCreate =
    search.trim() !== "" &&
    !allCategories.some((c) => c.toLowerCase() === search.trim().toLowerCase());

  const select = (cat: string) => {
    onChange(cat);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border ${ADMIN_BORDER} bg-white hover:bg-[hsl(38_40%_96%)] transition text-left`}
        >
          <span className={value ? "text-[hsl(24_25%_12%)]" : "text-[hsl(24_12%_55%)]"}>
            {value || "Selecciona o escribe una categoría…"}
          </span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-[hsl(24_12%_50%)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o crear categoría…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !showCreate && (
              <CommandEmpty>Sin resultados.</CommandEmpty>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((cat) => (
                  <CommandItem key={cat} value={cat} onSelect={() => select(cat)}>
                    <Check className={`w-4 h-4 mr-2 shrink-0 ${value === cat ? "opacity-100" : "opacity-0"}`} />
                    {cat}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup heading="Nueva categoría">
                <CommandItem value={`__new__${search}`} onSelect={() => select(search.trim())}>
                  <Plus className="w-4 h-4 mr-2 shrink-0 text-[hsl(14_78%_52%)]" />
                  Crear &ldquo;{search.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Author Combobox ───────────────────────────────────────────────────────────
function AuthorCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: dbAuthors } = useQuery({
    queryKey: ["admin", "authors"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("author").order("author");
      return [...new Set((data ?? []).map((r) => r.author).filter(Boolean))] as string[];
    },
  });

  const allAuthors = [...new Set(dbAuthors ?? [])].sort((a, b) => a.localeCompare(b, "es"));

  const filtered = search
    ? allAuthors.filter((a) => a.toLowerCase().includes(search.toLowerCase()))
    : allAuthors;

  const showCreate =
    search.trim() !== "" &&
    !allAuthors.some((a) => a.toLowerCase() === search.trim().toLowerCase());

  const select = (author: string) => {
    onChange(author);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border ${ADMIN_BORDER} bg-white hover:bg-[hsl(38_40%_96%)] transition text-left`}
        >
          <span className={value ? "text-[hsl(24_25%_12%)]" : "text-[hsl(24_12%_55%)]"}>
            {value || "Selecciona o escribe un instructor…"}
          </span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-[hsl(24_12%_50%)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o crear instructor…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !showCreate && (
              <CommandEmpty>Sin resultados.</CommandEmpty>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((author) => (
                  <CommandItem key={author} value={author} onSelect={() => select(author)}>
                    <Check className={`w-4 h-4 mr-2 shrink-0 ${value === author ? "opacity-100" : "opacity-0"}`} />
                    {author}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup heading="Nuevo instructor">
                <CommandItem value={`__new__${search}`} onSelect={() => select(search.trim())}>
                  <Plus className="w-4 h-4 mr-2 shrink-0 text-[hsl(14_78%_52%)]" />
                  Crear &ldquo;{search.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Lesson Dialog ─────────────────────────────────────────────────────────────
interface LessonDialogProps {
  open: boolean;
  onClose: () => void;
  lesson: Partial<LessonRow> | null;
  sectionId: string;
  courseId: string;
  nextPosition: number;
  onSaved: () => void;
}

function LessonDialog({ open, onClose, lesson, sectionId, courseId, nextPosition, onSaved }: LessonDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    title: "",
    video_url: "",
    content: "",
    duration_minutes: 0,
    is_free_preview: false,
  });

  useEffect(() => {
    if (open) {
      setFields({
        title:            lesson?.title ?? "",
        video_url:        lesson?.video_url ?? "",
        content:          lesson?.content ?? "",
        duration_minutes: lesson?.duration_minutes ?? 0,
        is_free_preview:  lesson?.is_free_preview ?? false,
      });
    }
  }, [open, lesson]);

  const handleSave = async () => {
    if (!fields.title.trim()) {
      toast({ title: "El título de la lección es requerido", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (lesson?.id) {
        const { error } = await supabase
          .from("lessons")
          .update({
            title:            fields.title.trim(),
            video_url:        fields.video_url || null,
            content:          fields.content || null,
            duration_minutes: fields.duration_minutes,
            is_free_preview:  fields.is_free_preview,
          })
          .eq("id", lesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lessons")
          .insert({
            section_id:       sectionId,
            course_id:        courseId,
            title:            fields.title.trim(),
            video_url:        fields.video_url || null,
            content:          fields.content || null,
            duration_minutes: fields.duration_minutes,
            is_free_preview:  fields.is_free_preview,
            position:         nextPosition,
          });
        if (error) throw error;
        // Sync lessons_count on the course
        const { count } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId);
        await supabase.from("courses").update({ lessons_count: count ?? 0 }).eq("id", courseId);
        queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
      }
      toast({ title: lesson?.id ? "Lección actualizada" : "Lección creada", variant: "success" });
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {lesson?.id ? "Editar lección" : "Nueva lección"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-bold text-[hsl(24_25%_12%)] mb-1.5 block">Título *</label>
            <Input
              value={fields.title}
              onChange={e => setFields(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Introducción al curso"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[hsl(24_25%_12%)] mb-1.5 block">URL del video</label>
            <Input
              value={fields.video_url}
              onChange={e => setFields(f => ({ ...f, video_url: e.target.value }))}
              placeholder="https://vimeo.com/…"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[hsl(24_25%_12%)] mb-1.5 block">Notas / Contenido</label>
            <Textarea
              value={fields.content}
              onChange={e => setFields(f => ({ ...f, content: e.target.value }))}
              placeholder="Apuntes o contenido adicional para el alumno…"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-[hsl(24_25%_12%)] mb-1.5 block">Duración (min)</label>
              <Input
                type="number"
                min={0}
                value={fields.duration_minutes}
                onChange={e => setFields(f => ({ ...f, duration_minutes: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="text-sm font-bold text-[hsl(24_25%_12%)] mb-2">Vista previa gratuita</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={fields.is_free_preview}
                  onCheckedChange={v => setFields(f => ({ ...f, is_free_preview: v }))}
                />
                <span className="text-xs text-[hsl(24_12%_50%)]">
                  {fields.is_free_preview ? "Visible sin matrícula" : "Solo matriculados"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-bold rounded-full border ${ADMIN_BORDER} hover:${ADMIN_SURFACE} transition`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-bold rounded-full bg-[hsl(14_78%_52%)] text-white hover:bg-[hsl(14_78%_46%)] transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {lesson?.id ? "Guardar cambios" : "Crear lección"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sortable Lesson Row ───────────────────────────────────────────────────────
function SortableLessonRow({
  lesson, idx, onEdit, onDelete,
}: {
  lesson: LessonRow;
  idx: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      className="flex items-center gap-3 px-6 py-3 hover:bg-[hsl(38_40%_96%)]/40 transition"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-[hsl(24_12%_65%)] hover:text-[hsl(24_12%_35%)] transition touch-none"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs font-bold text-[hsl(24_12%_60%)] w-5 shrink-0 tabular-nums">
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[hsl(24_25%_12%)] truncate">{lesson.title}</p>
        {lesson.duration_minutes != null && lesson.duration_minutes > 0 && (
          <p className="text-xs text-[hsl(24_12%_50%)]">{lesson.duration_minutes} min</p>
        )}
      </div>
      {lesson.is_free_preview && (
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(210_80%_92%)] text-[hsl(210_80%_40%)] text-[9px] font-black uppercase tracking-wide">
          <Eye className="w-2.5 h-2.5" /> Libre
        </span>
      )}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[hsl(24_12%_50%)] hover:bg-[hsl(38_40%_96%)] transition"
          title="Editar lección"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition"
          title="Eliminar lección"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Sortable Section Item ─────────────────────────────────────────────────────
function SortableSectionItem({
  section, isExpanded, isEditing, editingTitle, savingSection,
  onToggle, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete,
  children,
}: {
  section: SectionWithLessons;
  isExpanded: boolean;
  isEditing: boolean;
  editingTitle: string;
  savingSection: boolean;
  onToggle: () => void;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      className={`${ADMIN_CARD} border ${ADMIN_BORDER} rounded-2xl overflow-hidden`}
    >
      <div className={`flex items-center gap-2 px-4 py-3 ${ADMIN_SURFACE}`}>
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing text-[hsl(24_12%_55%)] hover:text-[hsl(24_12%_30%)] transition touch-none"
          aria-label="Arrastrar sección"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-[hsl(24_12%_50%)]"
          aria-label={isExpanded ? "Contraer" : "Expandir"}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onEditSave();
              if (e.key === "Escape") onEditCancel();
            }}
            className="h-7 text-sm font-bold flex-1"
            autoFocus
          />
        ) : (
          <button onClick={onToggle} className="flex-1 text-left font-bold text-sm text-[hsl(24_25%_12%)]">
            {section.title}
          </button>
        )}

        <span className="text-xs text-[hsl(24_12%_50%)] shrink-0 mr-1">
          {section.lessons?.length ?? 0} lecciones
        </span>

        {isEditing ? (
          <>
            <button
              onClick={onEditSave}
              disabled={savingSection}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[hsl(150_60%_42%)] hover:bg-[hsl(150_60%_95%)] transition"
            >
              {savingSection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onEditCancel}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[hsl(24_12%_50%)] hover:bg-[hsl(38_40%_96%)] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEditStart}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[hsl(24_12%_50%)] hover:bg-white transition"
              title="Renombrar sección"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition"
              title="Eliminar sección"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {isExpanded && children}
    </div>
  );
}

// ── Content Tab ───────────────────────────────────────────────────────────────
function ContentTab({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections, isLoading, refetch } = useQuery({
    queryKey: ["admin", "sections", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*, lessons(*)")
        .eq("course_id", courseId)
        .order("position");
      if (error) throw error;
      return (data as SectionWithLessons[]).map(s => ({
        ...s,
        lessons: [...(s.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      }));
    },
  });

  // Local optimistic copy for drag-and-drop reordering
  const [items, setItems] = useState<SectionWithLessons[]>([]);
  useEffect(() => {
    if (sections) setItems(sections);
  }, [sections]);

  // Sensors: require 5px movement to avoid misfires on button clicks
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(s => s.id === active.id);
    const newIndex  = items.findIndex(s => s.id === over.id);
    setItems(prev => arrayMove(prev, oldIndex, newIndex));
    setHasPendingOrder(true);
  };

  const handleLessonDragEnd = (event: DragEndEvent, sectionId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const section = items.find(s => s.id === sectionId);
    if (!section) return;
    const oldIndex = section.lessons.findIndex(l => l.id === active.id);
    const newIndex  = section.lessons.findIndex(l => l.id === over.id);
    setItems(prev => prev.map(s =>
      s.id === sectionId ? { ...s, lessons: arrayMove(s.lessons, oldIndex, newIndex) } : s
    ));
    setHasPendingOrder(true);
  };

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [deletingSection, setDeletingSection] = useState(false);

  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);

  const [lessonDialog, setLessonDialog] = useState<{
    lesson: Partial<LessonRow> | null;
    sectionId: string;
    nextPosition: number;
  } | null>(null);

  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const results = await Promise.all([
        ...items.map((s, idx) =>
          supabase.from("sections").update({ position: idx + 1 }).eq("id", s.id)
        ),
        ...items.flatMap(s =>
          s.lessons.map((l, idx) =>
            supabase.from("lessons").update({ position: idx + 1 }).eq("id", l.id)
          )
        ),
      ]);
      if (results.some(r => r.error)) {
        toast({ title: "Error al guardar el orden", variant: "destructive" });
        refetch();
      } else {
        setHasPendingOrder(false);
        queryClient.invalidateQueries({ queryKey: ["course-sections-public", courseId] });
        toast({ title: "Orden guardado", variant: "success" });
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSaveSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    setSavingSection(true);
    const { error } = await supabase
      .from("sections")
      .update({ title: editingSectionTitle.trim() })
      .eq("id", sectionId);
    setSavingSection(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setEditingSectionId(null);
    refetch();
  };

  const handleDeleteSection = async () => {
    if (!deletingSectionId) return;
    setDeletingSection(true);
    const { error } = await supabase.from("sections").delete().eq("id", deletingSectionId);
    setDeletingSection(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const { count } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId);
    await supabase.from("courses").update({ lessons_count: count ?? 0 }).eq("id", courseId);
    queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
    setDeletingSectionId(null);
    toast({ title: "Sección eliminada", variant: "success" });
    refetch();
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    setAddingSectionLoading(true);
    const maxPos = Math.max(0, ...items.map(s => s.position ?? 0));
    const { error } = await supabase
      .from("sections")
      .insert({ course_id: courseId, title: newSectionTitle.trim(), position: maxPos + 1 });
    setAddingSectionLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewSectionTitle("");
    setAddingSection(false);
    toast({ title: "Sección añadida", variant: "success" });
    refetch();
  };

  const handleDeleteLesson = async () => {
    if (!deletingLessonId) return;
    setDeletingLesson(true);
    const { error } = await supabase.from("lessons").delete().eq("id", deletingLessonId);
    setDeletingLesson(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const { count } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId);
    await supabase.from("courses").update({ lessons_count: count ?? 0 }).eq("id", courseId);
    queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
    setDeletingLessonId(null);
    toast({ title: "Lección eliminada", variant: "success" });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(14_78%_52%)]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.length === 0 && !addingSection && (
          <div className={`${ADMIN_SURFACE} rounded-2xl p-10 text-center`}>
            <BookOpen className="w-8 h-8 mx-auto text-[hsl(24_12%_60%)] mb-3" />
            <p className="text-sm font-bold text-[hsl(24_25%_12%)]">Sin secciones todavía</p>
            <p className="text-xs text-[hsl(24_12%_50%)] mt-1">
              Añade la primera sección para organizar las lecciones del curso.
            </p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map(section => {
                const isExpanded = expanded.has(section.id);
                const isEditing  = editingSectionId === section.id;
                return (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isExpanded={isExpanded}
                    isEditing={isEditing}
                    editingTitle={editingSectionTitle}
                    savingSection={savingSection}
                    onToggle={() => toggle(section.id)}
                    onEditStart={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }}
                    onEditChange={setEditingSectionTitle}
                    onEditSave={() => handleSaveSection(section.id)}
                    onEditCancel={() => setEditingSectionId(null)}
                    onDelete={() => setDeletingSectionId(section.id)}
                  >
                    <div className={`divide-y ${ADMIN_BORDER}`}>
                      {(section.lessons ?? []).length === 0 && (
                        <p className="px-6 py-4 text-xs text-[hsl(24_12%_50%)] italic">
                          Sin lecciones en esta sección.
                        </p>
                      )}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={e => handleLessonDragEnd(e, section.id)}
                      >
                        <SortableContext
                          items={section.lessons.map(l => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {section.lessons.map((lesson, idx) => (
                            <SortableLessonRow
                              key={lesson.id}
                              lesson={lesson}
                              idx={idx}
                              onEdit={() => setLessonDialog({
                                lesson,
                                sectionId: section.id,
                                nextPosition: (section.lessons?.length ?? 0) + 1,
                              })}
                              onDelete={() => setDeletingLessonId(lesson.id)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      <button
                        onClick={() => setLessonDialog({
                          lesson: null,
                          sectionId: section.id,
                          nextPosition: (section.lessons?.length ?? 0) + 1,
                        })}
                        className="w-full flex items-center gap-2 px-6 py-3 text-xs font-bold text-[hsl(14_78%_52%)] hover:bg-[hsl(14_78%_52%)]/5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir lección
                      </button>
                    </div>
                  </SortableSectionItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Pending order banner */}
        {hasPendingOrder && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[hsl(14_78%_52%)/0.06] border-2 border-[hsl(14_78%_52%)/0.25]">
            <p className="text-sm font-bold text-[hsl(14_78%_42%)]">Orden sin guardar</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setItems(sections ?? []); setHasPendingOrder(false); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border ${ADMIN_BORDER} hover:bg-[hsl(38_40%_96%)] transition`}
              >
                Descartar
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={savingOrder}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-[hsl(14_78%_52%)] text-white hover:bg-[hsl(14_78%_46%)] transition disabled:opacity-60"
              >
                {savingOrder && <Loader2 className="w-3 h-3 animate-spin" />}
                Guardar orden
              </button>
            </div>
          </div>
        )}

        {/* Add section */}
        {addingSection ? (
          <div className={`${ADMIN_CARD} border ${ADMIN_BORDER} rounded-2xl p-4 flex items-center gap-2`}>
            <Input
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              placeholder="Nombre de la sección"
              onKeyDown={e => {
                if (e.key === "Enter") handleAddSection();
                if (e.key === "Escape") setAddingSection(false);
              }}
              autoFocus
              className="flex-1"
            />
            <button
              onClick={handleAddSection}
              disabled={addingSectionLoading || !newSectionTitle.trim()}
              className="px-3 py-2 text-xs font-bold rounded-full bg-[hsl(14_78%_52%)] text-white hover:bg-[hsl(14_78%_46%)] transition disabled:opacity-60 flex items-center gap-1.5"
            >
              {addingSectionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Añadir
            </button>
            <button
              onClick={() => { setAddingSection(false); setNewSectionTitle(""); }}
              className={`px-3 py-2 text-xs font-bold rounded-full border ${ADMIN_BORDER} hover:bg-[hsl(38_40%_96%)] transition`}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSection(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed ${ADMIN_BORDER} text-sm font-bold text-[hsl(24_12%_55%)] hover:border-[hsl(14_78%_52%)] hover:text-[hsl(14_78%_52%)] transition`}
          >
            <Plus className="w-4 h-4" />
            Añadir sección
          </button>
        )}
      </div>

      {lessonDialog && (
        <LessonDialog
          open={!!lessonDialog}
          onClose={() => setLessonDialog(null)}
          lesson={lessonDialog.lesson}
          sectionId={lessonDialog.sectionId}
          courseId={courseId}
          nextPosition={lessonDialog.nextPosition}
          onSaved={() => refetch()}
        />
      )}

      <AlertDialog open={!!deletingSectionId} onOpenChange={() => setDeletingSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta sección?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán también todas las lecciones que contiene. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              disabled={deletingSection}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingSection ? "Eliminando…" : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingLessonId} onOpenChange={() => setDeletingLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta lección?</AlertDialogTitle>
            <AlertDialogDescription>
              El progreso de los alumnos en esta lección también se eliminará. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={deletingLesson}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingLesson ? "Eliminando…" : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminCursoEditor({
  courseId,
  onBack,
}: {
  courseId: string | null;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Internal course ID: null until first save in create mode
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courseId);
  const [courseStatus, setCourseStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  // Track whether slug has been manually edited (auto-gen only for new courses)
  const [slugAutoMode, setSlugAutoMode] = useState(!courseId);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "", slug: "", subtitle: "", description: "",
      category: "", author: "", price: 0,
      duration_text: "", image_url: "", tone: "warm",
      is_featured: false, is_new: false,
    },
  });

  // Load existing course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["admin", "course", activeCourseId],
    queryFn: async () => {
      if (!activeCourseId) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", activeCourseId)
        .single();
      if (error) throw error;
      return data as CourseRow;
    },
    enabled: !!activeCourseId,
  });

  // Populate form when course data loads
  useEffect(() => {
    if (courseData) {
      form.reset({
        title:         courseData.title ?? "",
        slug:          courseData.slug ?? "",
        subtitle:      courseData.subtitle ?? "",
        description:   courseData.description ?? "",
        category:      courseData.category ?? "",
        author:        courseData.author ?? "",
        price:         Number(courseData.price ?? 0),
        duration_text: courseData.duration_text ?? "",
        image_url:     courseData.image_url ?? "",
        tone:          (courseData.tone as CourseFormData["tone"]) ?? "warm",
        is_featured:   courseData.is_featured ?? false,
        is_new:        courseData.is_new ?? false,
      });
      setCourseStatus((courseData.status as "draft" | "published") ?? "draft");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData]);

  // Auto-generate slug from title (only in create mode, while slugAutoMode is true)
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (slugAutoMode && watchTitle) {
      form.setValue("slug", toSlug(watchTitle));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchTitle, slugAutoMode]);

  const executeSave = async (data: CourseFormData): Promise<boolean> => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", activeCourseId ?? "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      if (existing) {
        form.setError("slug", { message: "Este slug ya está en uso por otro curso" });
        return false;
      }

      const payload = {
        title:         data.title,
        slug:          data.slug,
        subtitle:      data.subtitle || null,
        description:   data.description || null,
        category:      data.category,
        author:        data.author,
        price:         data.price,
        duration_text: data.duration_text || null,
        image_url:     data.image_url || null,
        tone:          data.tone,
        is_featured:   data.is_featured,
        is_new:        data.is_new,
      };

      if (activeCourseId) {
        const { error } = await supabase.from("courses").update(payload).eq("id", activeCourseId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["admin", "course", activeCourseId] });
        toast({ title: courseStatus === "published" ? "Cambios guardados" : "Borrador guardado", variant: "success" });
      } else {
        const { data: created, error } = await supabase
          .from("courses")
          .insert({ ...payload, status: "draft" })
          .select()
          .single();
        if (error) throw error;
        setActiveCourseId(created.id);
        setCourseStatus("draft");
        setSlugAutoMode(false);
        toast({ title: "Curso creado como borrador", variant: "success" });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
      return true;
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "";
      if (msg.includes("courses_slug_key")) {
        form.setError("slug", { message: "Esta URL ya está en uso por otro curso" });
        toast({
          title: "URL duplicada",
          description: "Ya existe un curso con ese slug. Edita el campo URL en la pestaña Información.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error al guardar", description: msg, variant: "destructive" });
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSave = (data: CourseFormData) => executeSave(data);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePublish = async () => {
    if (!activeCourseId) return;
    setStatusChanging(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "published" })
        .eq("id", activeCourseId);
      if (error) throw error;
      setCourseStatus("published");
      queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course", activeCourseId] });
      toast({ title: "Curso publicado", description: "Ya es visible en el catálogo.", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setStatusChanging(false);
      setPublishOpen(false);
    }
  };

  const handleUnpublish = async () => {
    if (!activeCourseId) return;
    setStatusChanging(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "draft" })
        .eq("id", activeCourseId);
      if (error) throw error;
      setCourseStatus("draft");
      queryClient.invalidateQueries({ queryKey: ["admin", "course-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course", activeCourseId] });
      toast({ title: "Curso despublicado", description: "Ya no es visible en el catálogo.", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setStatusChanging(false);
      setUnpublishOpen(false);
    }
  };

  const isPublished = courseStatus === "published";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${INK_BG} ${INK_FG} rounded-3xl p-6`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[hsl(38_30%_88%/0.65)] hover:text-[hsl(38_50%_98%)] transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a cursos</span>
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-black truncate">
              {activeCourseId ? (courseData?.title || "Editando curso") : "Nuevo curso"}
            </h2>
          </div>

          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isPublished
                ? "bg-[hsl(14_78%_52%/0.2)] text-[hsl(14_78%_70%)]"
                : "bg-[hsl(24_18%_20%)] text-[hsl(38_30%_70%)]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPublished ? "bg-[hsl(14_78%_60%)]" : "bg-[hsl(24_12%_55%)]"
              }`}
            />
            {isPublished ? "Publicado" : "Borrador"}
          </span>
        </div>
      </div>

      {/* Loading skeleton in edit mode */}
      {courseLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(14_78%_52%)]" />
        </div>
      )}

      {!courseLoading && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2">
            <TabsList className={`${ADMIN_SURFACE} rounded-full p-1 h-auto`}>
              <TabsTrigger
                value="info"
                className="rounded-full text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-5 py-2"
              >
                Información
              </TabsTrigger>
              <TabsTrigger
                value="content"
                disabled={!activeCourseId}
                className="rounded-full text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Contenido
              </TabsTrigger>
            </TabsList>
            {!activeCourseId && (
              <p className="text-xs text-[hsl(24_12%_52%)]">
                Guarda el borrador para añadir secciones y lecciones.
              </p>
            )}
          </div>

          {/* ── Tab: Información ───────────────────────────────────────────── */}
          <TabsContent value="info">
            <div className={`${ADMIN_CARD} border ${ADMIN_BORDER} rounded-3xl p-6`}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">

                  {/* Title + Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Título *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre del curso" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Slug (URL) *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                setSlugAutoMode(false);
                              }}
                              placeholder="nombre-del-curso"
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subtitle */}
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Breve descripción en una línea" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="¿De qué trata este curso? ¿Qué aprenderán los alumnos?"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category + Author */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Categoría *</FormLabel>
                          <FormControl>
                            <CategoryCombobox value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Instructor *</FormLabel>
                          <FormControl>
                            <AuthorCombobox value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price + Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Precio (€)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Duración</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej. 8h 30min" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image URL */}
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Imagen del curso (URL)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://…" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tone selector */}
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Paleta de color</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {toneConfig.map(t => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => field.onChange(t.value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border-2 transition ${
                                  field.value === t.value
                                    ? "border-[hsl(14_78%_52%)] ring-2 ring-offset-1 ring-[hsl(14_78%_52%)/0.3]"
                                    : "border-[hsl(30_20%_84%)] hover:border-[hsl(30_20%_65%)]"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full ${t.bg} border border-black/10 shrink-0`} />
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Featured / New flags */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className={`flex items-center justify-between gap-3 rounded-xl border-2 ${ADMIN_BORDER} px-4 py-3`}>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Curso destacado</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_new"
                      render={({ field }) => (
                        <FormItem className={`flex items-center justify-between gap-3 rounded-xl border-2 ${ADMIN_BORDER} px-4 py-3`}>
                          <FormLabel className="text-sm font-bold text-[hsl(24_25%_12%)]">Curso nuevo</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t ${ADMIN_BORDER}`}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[hsl(14_78%_52%)] text-white text-sm font-bold hover:bg-[hsl(14_78%_46%)] transition disabled:opacity-60"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isPublished ? "Guardar cambios" : "Guardar borrador"}
                    </button>

                    {activeCourseId && (
                      isPublished ? (
                        <button
                          type="button"
                          onClick={() => setUnpublishOpen(true)}
                          disabled={statusChanging}
                          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border ${ADMIN_BORDER} text-sm font-bold text-[hsl(24_12%_45%)] hover:bg-[hsl(38_40%_96%)] transition disabled:opacity-60`}
                        >
                          <EyeOff className="w-4 h-4" />
                          Despublicar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPublishOpen(true)}
                          disabled={statusChanging}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[hsl(150_60%_42%)] text-white text-sm font-bold hover:bg-[hsl(150_60%_36%)] transition disabled:opacity-60"
                        >
                          <Eye className="w-4 h-4" />
                          Publicar curso
                        </button>
                      )
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* ── Tab: Contenido ─────────────────────────────────────────────── */}
          <TabsContent value="content">
            {!activeCourseId ? (
              <div className={`${ADMIN_SURFACE} rounded-3xl p-10 text-center`}>
                <BookOpen className="w-10 h-10 mx-auto text-[hsl(24_12%_60%)] mb-3" />
                <p className="font-bold text-[hsl(24_25%_12%)]">Guarda el curso primero</p>
                <p className="text-sm text-[hsl(24_12%_50%)] mt-1">
                  Completa la información básica y guarda el borrador para poder añadir secciones y lecciones.
                </p>
              </div>
            ) : (
              <ContentTab courseId={activeCourseId} />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Publish confirm */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              El curso será visible públicamente en el catálogo y los alumnos podrán comprarlo o matricularse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={statusChanging}
              className="bg-[hsl(150_60%_42%)] hover:bg-[hsl(150_60%_36%)] text-white"
            >
              {statusChanging ? "Publicando…" : "Sí, publicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish confirm */}
      <AlertDialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Despublicar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              El curso dejará de ser visible en el catálogo. Los alumnos ya matriculados conservarán su acceso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnpublish}
              disabled={statusChanging}
              className="bg-[hsl(38_80%_50%)] hover:bg-[hsl(38_80%_44%)] text-white"
            >
              {statusChanging ? "Despublicando…" : "Sí, despublicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
