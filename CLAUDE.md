# Academia Creativa — Contexto técnico del proyecto

## Qué es este proyecto

Plataforma de cursos online para Academia Creativa (cliente: Laura Martínez). Sustituye una infraestructura provisional basada en Notion + Vimeo + Systeme.io + Google Sheets. El objetivo es una plataforma propia con dominio y marca propios, acceso seguro a contenido, sistema de pagos integrado, panel de alumno con progreso y certificados, y panel de administración con métricas reales.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 + SWC |
| Estilos | Tailwind CSS 3 + CSS custom properties |
| Componentes UI | shadcn/ui (Radix UI primitives) |
| Iconos | Lucide React |
| Routing | React Router DOM 6 |
| Estado servidor | TanStack React Query 5 |
| Estado cliente | React Context (AuthContext) |
| Formularios | React Hook Form 7 + Zod |
| Backend / Auth / DB | Supabase (PostgreSQL + Supabase Auth) |
| Notificaciones | Sonner + shadcn Toaster |
| Gráficos | Recharts |
| Testing | Vitest + Testing Library |
| Package manager | npm (también compatible con bun) |
| Hosting | Vercel (SPA con rewrites en `vercel.json`) |
| Generado con | Lovable (lovable-tagger en devDependencies) |

---

## Estructura de carpetas

```
src/
├── App.tsx                  # Router raíz + providers
├── pages/                   # Una página por ruta
│   ├── Index.tsx            # Home / landing
│   ├── Cursos.tsx           # Catálogo de cursos (conectado a Supabase)
│   ├── Curso.tsx            # Detalle de curso con ruta dinámica (:id = slug)
│   ├── Profesores.tsx       # Directorio de instructores (datos derivados de courses.ts)
│   ├── Alumno.tsx           # Dashboard del alumno (protegida: rol student)
│   ├── AlumnoCurso.tsx      # Reproductor de curso para alumno (protegida: rol student)
│   ├── Admin.tsx            # Dashboard admin (protegida: rol admin)
│   ├── PagoExito.tsx        # Confirmación visual tras compra con Stripe (/pago/exito)
│   ├── Certificado.tsx      # Verificación pública de certificado (/certificado/:codigo)
│   ├── Login.tsx            # Autenticación
│   ├── Registro.tsx         # Registro de nuevos usuarios
│   └── NotFound.tsx         # 404
├── components/
│   ├── ui/                  # ~60 componentes shadcn/ui
│   ├── admin/               # Sub-componentes del panel de administración
│   │   ├── AdminDashboard.tsx       # Tiles reales + top cursos
│   │   ├── AdminCursos.tsx          # Tabla de cursos con stats
│   │   ├── AdminAlumnos.tsx         # Modal centralizado por alumno; envía emails de acceso concedido/revocado vía send-email Edge Function
│   │   ├── AdminVentas.tsx          # Transacciones Stripe reales
│   │   ├── AdminMetricas.tsx        # Métricas de contenido: completitud, revenue por curso, Q&A
│   │   ├── AdminNotificationPanel.tsx  # Panel de notificaciones con badge y drawer
│   │   └── AdminCursoEditor.tsx     # Editor CRUD de cursos: formulario de info (React Hook Form + Zod), gestión de secciones (inline rename/delete) y lecciones (dialog modal); publica/despublica; auto-save al pasar a la pestaña Contenido
│   ├── SiteHeader.tsx       # Cabecera unificada: dropdown de usuario en desktop (hover+click, cierre al hacer clic fuera), avatar/nombre en header del Sheet móvil
│   ├── SiteFooter.tsx       # Pie de página
│   ├── CourseCard.tsx       # Tarjeta de curso para el catálogo
│   ├── Logo.tsx             # Logo (variant: "default" | "ink")
│   ├── NavLink.tsx          # Enlace de navegación
│   ├── ScrollToTop.tsx      # Reset scroll en cambio de ruta
│   └── ProtectedRoute.tsx   # Guard de ruta por rol
├── context/
│   └── AuthContext.tsx      # Sesión, usuario, perfil, rol, signIn/Up/Out
├── data/
│   └── courses.ts           # 16 cursos estáticos (usado como fallback en Curso.tsx y Alumno.tsx)
├── integrations/supabase/
│   ├── client.ts            # Singleton del cliente Supabase
│   └── types.ts             # Tipos autogenerados por Supabase CLI + tipos manuales de RPCs admin y certificados
├── hooks/
│   ├── use-mobile.tsx       # Detección de viewport móvil
│   └── use-toast.ts         # Hook de notificaciones
├── lib/
│   └── utils.ts             # clsx + tailwind-merge (cn helper)
└── assets/                  # Imágenes de cursos (course-*.jpg) y avatar

public/
├── favicon.svg              # Favicon SVG derivado del logo de marca
└── apple-touch-icon.png     # Icono 180×180 para pantalla de inicio iOS

docs/
└── admin-manual.md          # Guía completa del panel de administración (todas las secciones)

supabase/
├── functions/
│   ├── create-checkout-session/index.ts  # Edge Function: crea sesión Stripe y devuelve URL de pago
│   ├── stripe-webhook/index.ts           # Edge Function: procesa checkout.session.completed → payments + enrollments + email de confirmación
│   ├── generate-certificate/index.ts     # Edge Function: genera PDF con pdf-lib (A4 landscape), sube a Storage y envía email con enlace
│   ├── send-email/index.ts               # Edge Function: envíos transaccionales (welcome, course_access, access_revoked); tipos admin requieren rol admin
│   ├── send-activity-reminder/index.ts   # Edge Function: detecta alumnos inactivos vía RPC y envía recordatorios; soporta dry_run y send_test
│   └── _shared/
│       ├── cors.ts                       # Headers CORS compartidos
│       └── resend.ts                     # Wrapper de API Resend + 6 plantillas HTML responsivas (welcome, purchase, course_access, certificate, access_revoked, activity_reminder)
└── migrations/              # 13 archivos SQL (schema completo + seed + Q&A/notas + admin functions + payments + métricas + certificados + hardening RLS + detección actividad)

vercel.json                  # Rewrite catch-all → /index.html (necesario para React Router en Vercel)
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `Index` | Público |
| `/cursos` | `Cursos` | Público |
| `/curso/:id` | `Curso` | Público (`:id` = slug del curso) |
| `/profesores` | `Profesores` | Público |
| `/login` | `Login` | Público |
| `/registro` | `Registro` | Público |
| `/alumno` | `Alumno` | Protegida (rol: `student`) |
| `/alumno/curso/:slug` | `AlumnoCurso` | Protegida (rol: `student`) |
| `/admin/*` | `Admin` | Protegida (rol: `admin`); la sección activa se deriva del segundo segmento de la URL (`/admin/cursos`, `/admin/alumnos`, etc.) |
| `/pago/exito` | `PagoExito` | Público |
| `/certificado/:codigo` | `Certificado` | Público (verificación de certificado emitido) |

---

## Autenticación y roles

### Flujo
1. `supabase.auth.signInWithPassword` / `signUp` → sesión en `localStorage`
2. `onAuthStateChange` en `AuthContext` mantiene estado reactivo
3. Al autenticarse se leen `profiles` y `user_roles` en paralelo
4. `ProtectedRoute` lee `role` del contexto; redirige si no coincide

### Roles disponibles (`app_role` enum)
- `admin` — acceso a `/admin`
- `student` — acceso a `/alumno` y `/alumno/curso/:slug`

Un usuario puede tener múltiples roles en `user_roles`. La lógica actual prioriza `admin` sobre `student`.

### Trigger automático en registro
Al crear un usuario en `auth.users`, el trigger `handle_new_user()` crea automáticamente:
- Un registro en `profiles` (con `full_name` tomado de `raw_user_meta_data`)
- Un registro en `user_roles` con rol `student`

---

## Base de datos (Supabase / PostgreSQL)

### Tablas implementadas

**`profiles`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | Referencia a `auth.users.id` |
| `full_name` | `text` | Nullable |
| `avatar_url` | `text` | Nullable |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-actualizado por trigger |

**`user_roles`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `role` | `app_role` | Enum: `admin` \| `student` |
| `created_at` | `timestamptz` | |

**`courses`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `slug` | `text` (unique) | Identificador de URL |
| `title` | `text` | |
| `subtitle` | `text` | Nullable |
| `description` | `text` | Nullable |
| `category` | `text` | |
| `author` | `text` | |
| `price` | `numeric` | |
| `rating` | `numeric` | |
| `reviews_count` | `integer` | |
| `lessons_count` | `integer` | |
| `duration_text` | `text` | Nullable (ej. "8h 30min"); mostrado en catálogo |
| `status` | `course_status` | Enum: `draft` \| `published` |
| `tone` | `course_tone` | Enum: `warm` \| `cream` \| `sun` \| `ink` |
| `image_url` | `text` | Nullable |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**`sections`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `course_id` | `uuid` | FK → `courses.id` |
| `title` | `text` | |
| `position` | `integer` | Orden dentro del curso |

**`lessons`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `section_id` | `uuid` | FK → `sections.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `title` | `text` | |
| `description` | `text` | Nullable |
| `video_url` | `text` | Nullable (Vimeo o URL directa) |
| `content` | `text` | Nullable (HTML/texto) |
| `duration_minutes` | `integer` | Nullable |
| `position` | `integer` | Orden dentro de la sección |
| `is_free_preview` | `boolean` | Si es visible sin matrícula |

**`enrollments`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `source` | `enrollment_source` | Enum: `purchase` \| `manual` \| `seed` |
| `granted_at` | `timestamptz` | |
| `revoked_at` | `timestamptz` | Nullable; `NULL` = acceso activo |

**`lesson_progress`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `lesson_id` | `uuid` | FK → `lessons.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `completed` | `boolean` | |
| `completed_at` | `timestamptz` | Nullable |

**`lesson_notes`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `profiles.id` |
| `lesson_id` | `uuid` | FK → `lessons.id` |
| `body` | `text` | Contenido de la nota |
| `updated_at` | `timestamptz` | Auto-actualizado por trigger |

Índice único `(user_id, lesson_id)` — una nota por alumno/lección.

**`lesson_questions`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `profiles.id` |
| `lesson_id` | `uuid` | FK → `lessons.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `body` | `text` | |
| `votes_count` | `integer` | Mantenido por la función `toggle_question_vote()` |
| `created_at` | `timestamptz` | |

**`lesson_answers`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `question_id` | `uuid` | FK → `lesson_questions.id` |
| `user_id` | `uuid` | FK → `profiles.id` |
| `body` | `text` | |
| `is_instructor_answer` | `boolean` | Si la respuesta es del instructor |
| `created_at` | `timestamptz` | |

**`lesson_question_votes`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `question_id` | `uuid` | FK → `lesson_questions.id` |
| `user_id` | `uuid` | FK → `profiles.id` |
| `created_at` | `timestamptz` | |

Constraint único `(question_id, user_id)` — un voto por alumno/pregunta.

### Vistas
- `lessons_public` — Lecciones con `security_invoker = on` para consultas públicas seguras

### Funciones / triggers
- `handle_new_user()` — trigger `AFTER INSERT ON auth.users` → crea `profile` + rol `student`
- `touch_updated_at()` — trigger en tablas con `updated_at`
- `has_role(uuid, app_role)` — SECURITY DEFINER para uso en políticas RLS
- `has_course_access(_user_id, _course_id)` — devuelve `boolean`; consulta `enrollments`
- `get_lesson_content(_lesson_id)` — devuelve datos de la lección con control de acceso (preview gratuito, admin, o matriculado)
- `toggle_question_vote(_question_id)` — RPC SECURITY DEFINER; alterna voto y actualiza `votes_count` atómicamente
- `admin_get_payment_stats()` — SECURITY DEFINER; devuelve métricas de ventas para el panel admin
- `admin_get_recent_payments()` — SECURITY DEFINER; devuelve últimas transacciones para `AdminVentas.tsx`
- `admin_get_course_completion()` — SECURITY DEFINER; tasa de completitud por curso para `AdminMetricas.tsx`
- `admin_get_revenue_by_course()` — SECURITY DEFINER; ingresos desglosados por curso para `AdminMetricas.tsx`
- `admin_get_qa_stats()` — SECURITY DEFINER; actividad Q&A (preguntas/respuestas por curso) para `AdminMetricas.tsx`
- `admin_get_monthly_trends()` — SECURITY DEFINER; tendencia mensual de alumnos e ingresos para `AdminMetricas.tsx`
- `get_certificate_by_code(_code)` — SECURITY DEFINER; verificación pública de certificado sin auth (usada en `Certificado.tsx`)
- `get_inactive_enrolled_students(days_inactive)` — SECURITY DEFINER; devuelve alumnos matriculados (purchase/manual) sin actividad en los últimos N días (def. 14), excluyendo revocados, seeds y ya certificados; usada por `send-activity-reminder`

### Enums
- `app_role` — `admin`, `student`
- `course_status` — `draft`, `published`
- `course_tone` — `warm`, `cream`, `sun`, `ink`
- `enrollment_source` — `purchase`, `manual`, `seed`

### RLS
Todas las tablas tienen RLS habilitado:
- **`courses`/`sections`/`lessons`:** SELECT público limitado (cursos publicados / lecciones con `is_free_preview`); `authenticated` ve además el contenido de cursos en los que está matriculado (`has_course_access`); admins tienen `FOR ALL` (SELECT + INSERT + UPDATE + DELETE) en las tres tablas — políticas `"Admins manage courses/sections/lessons"` definidas en la migración inicial
- **`enrollments`:** cada usuario ve sus propias matrículas; admins ven todas
- **`lesson_progress`:** cada usuario gestiona su propio progreso (INSERT requiere matrícula activa); admins ven todo
- **`profiles`:** SELECT y UPDATE restringidos al propio usuario o admin
- **`user_roles`:** SELECT restringido al propio usuario o admin; admins gestionan todo

**`payments`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `stripe_session_id` | `text` (unique) | ID de sesión de Stripe Checkout |
| `amount` | `numeric` | Importe cobrado |
| `currency` | `text` | Default `'eur'` |
| `status` | `text` | Estado del pago (`completed`, etc.) |
| `created_at` | `timestamptz` | |

**`certificates`**
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `course_id` | `uuid` | FK → `courses.id` |
| `recipient_name` | `text` | Nombre confirmado por el alumno al generar |
| `verification_code` | `text` (unique) | 8 chars hex en mayúsculas, auto-generado |
| `issued_at` | `timestamptz` | |
| `pdf_url` | `text` | URL pública en Storage bucket `certificates` |

Constraint único `(user_id, course_id)` — un certificado por alumno/curso.

Función SECURITY DEFINER `get_certificate_by_code(_code)` — verificación pública sin auth.

---

## Sistema de diseño

### Fuentes
- **H1, H2 y titulares (`font-display`):** `DM Serif Display` (Google Fonts, serif elegante)
- **Body y resto de UI (`font-sans`):** `Nunito Sans` (Google Fonts, sans-serif redondeada)
- Ambas se importan en `index.css` desde Google Fonts.

### Paleta de colores (CSS custom properties en `index.css`)

| Token | Uso |
|-------|-----|
| `--background` | Fondo general de páginas públicas |
| `--foreground` | Texto principal |
| `--surface` | Superficies elevadas (cards secundarias) |
| `--ink` | Color oscuro profundo (fondos hero, sidebar alumno) |
| `--ink-foreground` | Texto sobre fondos `ink` |
| `--primary` | Color de acción principal (naranja/cálido) |
| `--primary-foreground` | Texto sobre primario |
| `--primary-glow` | Variante hover del primario |
| `--secondary` | Acento complementario (amarillo/crema) |
| `--card` | Fondo de tarjetas |
| `--muted` | Fondos sutiles, texto secundario |
| `--border` | Bordes |

El panel de administración usa la paleta **Warm Ink** del design system: `hsl(24 25% 12%)` para el sidebar y header de modales, `hsl(14 78% 52%)` para el primario (terracota). Todos los sub-componentes admin (`AdminDashboard`, `AdminMetricas`, `AdminVentas`, `AdminNotificationPanel`, `AdminAlumnos` y `AdminCursos`) usan esta paleta de forma consistente.

### Referencia visual
El archivo `design-system.html` en la raíz es un documento HTML estático con scroll-spy que documenta colores, tipografía, espaciado, componentes y stat cards. Ábrete directamente en el navegador; no requiere servidor.

### Gradientes utilitarios
Clase `bg-gradient-warm` usada en barras de progreso del alumno.

### Border radius
Uso extensivo de bordes muy redondeados: `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-3xl`. El sistema usa `--radius` como variable base.

### Sistema de notificaciones (toasts)
Se usan dos proveedores montados en `App.tsx`: **shadcn Toaster** (activo) y **Sonner** (montado pero sin uso activo en páginas). Todas las notificaciones de usuario pasan por `useToast()` del hook `src/hooks/use-toast.ts`.

Variantes disponibles en `toast.tsx`:
| Variante | Borde lateral | Uso |
|----------|--------------|-----|
| `default` | ninguno | Mensajes neutros |
| `success` | verde `hsl(150 60% 42%)` | Registro exitoso, acción completada |
| `info` | azul `hsl(210 80% 52%)` | Bienvenida al hacer login |
| `warning` | amarillo `hsl(38 80% 60%)` | Cuenta creada pero con advertencia |
| `destructive` | rojo `hsl(0 70% 50%)` | Errores de auth, validación fallida |

El viewport está fijado en `bottom-right`; los toasts tienen `rounded-[14px]` y altura compacta.

---

## Estado actual de la UI y datos

| Página | Estado UI | Datos reales | Notas |
|--------|-----------|-------------|-------|
| `Index` (landing) | Completa | **Supabase** | Cursos destacados desde `courses` (status=published, orden por `reviews_count`); fallback a `courses.ts` para imágenes |
| `Cursos` (catálogo) | Completa | **Supabase** (`courses` table, status=published) | Conectado; empty state (SearchX + limpiar filtros) y error state implementados |
| `Curso` (detalle) | Completa | **Híbrido** | Temario siempre desde `courses.ts` enriquecido desde Supabase. Skeleton en CTAs mientras carga matrícula. Botón Comprar llama a Edge Function `create-checkout-session`; spinner Loader2 durante redirect; flujo autoCheckout post-login. |
| `Profesores` (directorio) | Completa | Estático (`courses.ts`) | Deriva instructores y métricas de `courses.ts`; avatares con pravatar |
| `Login` | Funcional | Auth real con Supabase | Spinner Loader2 en botón durante envío |
| `Registro` | Funcional | Auth real con Supabase | Spinner Loader2 en botón durante envío |
| `Alumno` (dashboard) | UI completa | **Supabase** | Todos los datos reales: matrículas, progreso, lecciones completadas, cursos completados, racha diaria, tiempo semanal/mensual y grid de actividad (query `student-activity`). Empty state motivacional + error state con reintentar. |
| `AlumnoCurso` (reproductor) | UI completa | **Supabase** | Lecciones, progreso, control de acceso por matrícula; Q&A y notas persistidos en BD; modal para generar certificado al completar curso (llama a Edge Function `generate-certificate`) |
| `Admin` (dashboard) | UI completa | **Supabase** | Dashboard: 4 tiles reales + top cursos real; revenue con overlay "Próximamente". Cursos: tabla real + editor CRUD completo (`AdminCursoEditor`): crear/editar metadatos de curso, gestionar secciones y lecciones, publicar/despublicar; navegación por URL (`/admin/*`). Alumnos: modal centralizado por alumno con botón móvil adaptado. Ventas: UI real. Métricas: tasas de completitud, revenue por curso, Q&A stats, tendencias mensuales (4 RPCs). NotificationPanel: campana con badge + drawer de atajos. Topbar fijo en móvil (`position: fixed` + spacer). Paleta Warm Ink unificada en todos los sub-componentes. |
| `PagoExito` (`/pago/exito`) | Completa | — | Confirmación visual post-Stripe con enlace al dashboard del alumno |
| `Certificado` (`/certificado/:codigo`) | Completa | **Supabase** | Verificación pública via `get_certificate_by_code`; muestra datos del cert + botón descarga PDF |
| `NotFound` (404) | Completa | — | Layout split con ilustración 3D de artista en pánico |

---

## Gap Analysis — Lo que falta implementar

### Funcionalidades pendientes (Fase 1 — críticas)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Proceso de compra integrado | **Completado** | Edge Functions `create-checkout-session` + `stripe-webhook`; botón Comprar en `Curso.tsx` con flujo autoCheckout |
| Tabla `payments` | **Completado** | Migración `20260605`; RLS con funciones admin para métricas y lista de transacciones |
| Acceso automático al curso tras compra | **Completado** | `stripe-webhook` inserta en `payments` y `enrollments` al recibir `checkout.session.completed` |
| Revocación de acceso | **Completado** | UI de revocación/restauración en sección Alumnos del panel admin |
| Certificado de finalización | **Completado** | Tabla `certificates` + Edge Function `generate-certificate` (pdf-lib, A4 landscape) + bucket Storage `certificates` + modal de nombre en `AlumnoCurso.tsx` + página pública `/certificado/:codigo` |
| Racha y actividad reciente del alumno | **Completado** | `Alumno.tsx` calcula racha, tiempo y grid de actividad desde `lesson_progress` |
| Q&A en reproductor de lecciones | **Completado** | `AlumnoCurso.tsx` lee/escribe `lesson_questions` y `lesson_answers`; votos vía `toggle_question_vote()` |
| Notas en reproductor | **Completado** | `AlumnoCurso.tsx` upserta en `lesson_notes` con índice único `(user_id, lesson_id)` |
| Panel admin con datos reales | **Completado** | Dashboard, Cursos, Alumnos, Ventas y Métricas con datos reales; NotificationPanel activo; paleta Warm Ink |
| CRUD de cursos desde admin | **Completado** | `AdminCursoEditor.tsx`: crear/editar metadatos, secciones inline, lecciones vía dialog, publicar/despublicar; auto-sync de `lessons_count`; navegación URL-based en Admin |
| Gestión de alumnos desde admin | **Completado** | Buscar, ver matrículas, dar/revocar acceso manual desde modal centralizado por alumno; doble confirmación al revocar |
| Emails automáticos | **Completado** | `_shared/resend.ts` con 6 plantillas; `send-email` (welcome al registrarse, course_access y access_revoked desde AdminAlumnos); confirmación de compra desde `stripe-webhook`; certificado desde `generate-certificate`; `send-activity-reminder` para alumnos inactivos (RPC `get_inactive_enrolled_students`) |
| Migración de 2.400 alumnos existentes | Pendiente | Proceso de importación desde sistema anterior |
| Landing page conectada a Supabase | **Completado** | `Index.tsx` lee cursos desde Supabase; `courses.ts` como fallback de imágenes |

### Funcionalidades pendientes (Fase 2 — deseables)

- Sistema de cupones y descuentos
- Suscripción mensual (modelo de acceso completo)
- Foro/comunidad interna (actualmente usan Discord)
- Sistema de afiliados
- App móvil nativa (actualmente responsive web)

---

## Convenciones de código

- TypeScript estricto. Sin `any` sin justificación.
- Importaciones con alias `@/` (configurado en `vite.config.ts` y `tsconfig`).
- Componentes: PascalCase. Hooks: `use-kebab-case.ts`. Utilidades: camelCase.
- Estilos: Tailwind clases utilitarias. Para variantes complejas, constantes de string en la parte superior del componente (patrón usado en `Admin.tsx`).
- No hay barrel files (`index.ts`) por convención de Lovable.
- Queries de Supabase: directamente en componentes o en custom hooks. Aún no hay capa de servicios/repositorios centralizada.
- No hay servidor Express ni API routes propias; toda la lógica de backend va a través del cliente Supabase con RLS.
- `courses.ts` se mantiene como fallback estático para imágenes y metadatos hasta que todos los cursos tengan datos completos en la BD.
- **Code splitting:** todas las páginas se importan con `lazy()` + `Suspense` en `App.tsx`. El build usa `manualChunks` en `vite.config.ts` para separar vendors (react, query, supabase, recharts, radix-ui).
- **Menú móvil:** `SiteHeader` y el panel `Admin` usan el componente `Sheet` de shadcn/ui como drawer de navegación en viewports pequeños.
- **Navegación del admin por URL:** `Admin.tsx` usa `useLocation()` para derivar la sección activa del segundo segmento de la URL (`/admin` → dashboard, `/admin/cursos` → cursos, etc.). La ruta está registrada como `/admin/*` en `App.tsx`. El estado del editor de cursos (`editingCourseId`) vive en `Admin.tsx` — se resetea al navegar a otra sección.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key de Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ID del proyecto Supabase |

Solo el `PUBLISHABLE_KEY` (anon key) está expuesto al cliente. Nunca usar la `service_role` key en el frontend.

Las variables de Stripe y email van en los **secrets de Supabase Edge Functions** (no en `.env`):

| Secret | Descripción |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (sk_live_… / sk_test_…) |
| `STRIPE_WEBHOOK_SECRET` | Secret del endpoint webhook de Stripe (whsec_…) |
| `RESEND_API_KEY` | API key de Resend para envío de emails transaccionales |
| `RESEND_FROM_EMAIL` | Dirección remitente (default: `onboarding@resend.dev`; usar dominio propio en producción) |
| `SITE_URL` | URL base del sitio usada en los enlaces de los emails (default: `https://academia-creativa.vercel.app`) |

---

## Scripts de desarrollo

```bash
npm run dev          # Servidor de desarrollo en puerto 8080
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # ESLint
npm test             # Vitest
```

---

## Despliegue

La aplicación se despliega en **Vercel**. El archivo `vercel.json` en la raíz configura un rewrite catch-all (`/(.*) → /index.html`) imprescindible para que React Router gestione las rutas en el cliente sin que Vercel devuelva 404 en acceso directo a subrutas.

---

## Notas para QA

- Las páginas `Alumno`, `AlumnoCurso` y `Admin` requieren sesión activa.
- Usar el flujo de registro en `/registro` para crear un usuario de prueba (se asigna rol `student` automáticamente). No hay credenciales de demo precargadas; usar cuenta real.
- Para probar rutas de admin, asignar manualmente el rol `admin` en la tabla `user_roles` de Supabase Studio.
- Para probar el reproductor (`/alumno/curso/:slug`), el usuario debe tener una fila en `enrollments` con `revoked_at IS NULL` para el curso deseado.
- Las lecciones con `is_free_preview = true` son accesibles sin matrícula.
- Todos los datos de `Alumno.tsx` son reales: progreso, racha, tiempo semanal/mensual y grid de actividad se calculan desde `lesson_progress`.
- `Admin.tsx`: Dashboard, Cursos, Alumnos, Ventas y Métricas usan datos reales de Supabase. `AdminVentas.tsx` consume las RPCs `admin_get_payment_stats` y `admin_get_recent_payments` con datos de Stripe reales.
- `courses.ts` actúa como fallback cuando faltan datos en Supabase; no eliminar hasta que la BD tenga todos los cursos completos.
- Los estados vacíos y de error están implementados en `Cursos.tsx` y `Alumno.tsx`; la carga del formulario (Loader2) en `Login.tsx` y `Registro.tsx`. Las 4 queries de `Alumno.tsx` (enrollments, courses, lessons, progress) lanzan el error en lugar de ignorarlo, lo que permite que React Query active el error state correctamente.
- `Login.tsx` y `Registro.tsx` usan las variantes de toast tipadas (`success`, `info`, `warning`, `destructive`) del sistema de notificaciones rediseñado.
- `design-system.html` sirve como referencia de diseño; no está servido por la app React.
