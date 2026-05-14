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
│   ├── Alumno.tsx           # Dashboard del alumno (protegida: rol student)
│   ├── AlumnoCurso.tsx      # Reproductor de curso para alumno (protegida: rol student)
│   ├── Admin.tsx            # Dashboard admin (protegida: rol admin)
│   ├── Login.tsx            # Autenticación
│   ├── Registro.tsx         # Registro de nuevos usuarios
│   └── NotFound.tsx         # 404
├── components/
│   ├── ui/                  # ~60 componentes shadcn/ui
│   ├── SiteHeader.tsx       # Cabecera (variant: "public" | "student")
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
│   └── types.ts             # Tipos autogenerados por Supabase CLI
├── hooks/
│   ├── use-mobile.tsx       # Detección de viewport móvil
│   └── use-toast.ts         # Hook de notificaciones
├── lib/
│   └── utils.ts             # clsx + tailwind-merge (cn helper)
└── assets/                  # Imágenes de cursos (course-*.jpg) y avatar

supabase/
└── migrations/              # 4 archivos SQL (schema completo + seed de secciones/lecciones)

vercel.json                  # Rewrite catch-all → /index.html (necesario para React Router en Vercel)
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `Index` | Público |
| `/cursos` | `Cursos` | Público |
| `/curso/:id` | `Curso` | Público (`:id` = slug del curso) |
| `/login` | `Login` | Público |
| `/registro` | `Registro` | Público |
| `/alumno` | `Alumno` | Protegida (rol: `student`) |
| `/alumno/curso/:slug` | `AlumnoCurso` | Protegida (rol: `student`) |
| `/admin` | `Admin` | Protegida (rol: `admin`) |

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

### Vistas
- `lessons_public` — Lecciones con `security_invoker = on` para consultas públicas seguras

### Funciones / triggers
- `handle_new_user()` — trigger `AFTER INSERT ON auth.users` → crea `profile` + rol `student`
- `touch_updated_at()` — trigger en tablas con `updated_at`
- `has_role(uuid, app_role)` — SECURITY DEFINER para uso en políticas RLS
- `has_course_access(_user_id, _course_id)` — devuelve `boolean`; consulta `enrollments`
- `get_lesson_content(_lesson_id)` — devuelve datos de la lección con control de acceso (preview gratuito, admin, o matriculado)

### Enums
- `app_role` — `admin`, `student`
- `course_status` — `draft`, `published`
- `course_tone` — `warm`, `cream`, `sun`, `ink`
- `enrollment_source` — `purchase`, `manual`, `seed`

### RLS
Todas las tablas tienen RLS habilitado:
- **`courses`/`sections`:** cursos publicados visibles a `anon` y `authenticated`; admins gestionan todo
- **`lessons`:** política separada por rol — `anon` solo ve lecciones con `is_free_preview = true` en cursos publicados; `authenticated` ve además todo el contenido de cursos en los que está matriculado (`has_course_access`) y admins ven todo
- **`enrollments`:** cada usuario ve sus propias matrículas; admins ven todas
- **`lesson_progress`:** cada usuario gestiona su propio progreso (INSERT requiere matrícula activa); admins ven todo
- **`profiles`:** SELECT y UPDATE restringidos al propio usuario o admin
- **`user_roles`:** SELECT restringido al propio usuario o admin; admins gestionan todo

### Tablas PENDIENTES de crear
- `payments` / `orders` — Registro de transacciones (integración con Stripe pendiente)
- `certificates` — Certificados emitidos al completar un curso

---

## Sistema de diseño

### Fuente
- **Display y body:** `Nunito Sans` (Google Fonts). Clase: `font-display` y `font-sans`.

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

El panel de administración (`Admin.tsx`) usa una paleta diferente definida inline con HSL hardcodeados (índigo profundo, magenta eléctrico, violeta, turquesa). Esto es una divergencia intencional del design system del portal.

### Gradientes utilitarios
Clase `bg-gradient-warm` usada en barras de progreso del alumno.

### Border radius
Uso extensivo de bordes muy redondeados: `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-3xl`. El sistema usa `--radius` como variable base.

---

## Estado actual de la UI y datos

| Página | Estado UI | Datos reales | Notas |
|--------|-----------|-------------|-------|
| `Index` (landing) | Completa | Usa `courses.ts` (estáticos) | Pendiente conectar a Supabase |
| `Cursos` (catálogo) | Completa | **Supabase** (`courses` table, status=published) | Conectado |
| `Curso` (detalle) | Completa | **Híbrido** | Estructura del temario siempre desde `courses.ts`; títulos y flags `is_free_preview` enriquecidos desde Supabase por índice de posición. Estado de matrícula desde Supabase. Metadatos visuales (imagen, bio, learns) siempre desde `courses.ts`. |
| `Login` | Funcional | Auth real con Supabase | |
| `Registro` | Funcional | Auth real con Supabase | |
| `Alumno` (dashboard) | UI completa | **Híbrido** | Matrículas, lecciones completadas, progreso global y cursos completados son datos reales de Supabase. Racha y actividad reciente siguen siendo mock. |
| `AlumnoCurso` (reproductor) | UI completa | **Supabase** | Lecciones, progreso, control de acceso por matrícula; Q&A y notas son locales (no persistidos) |
| `Admin` (dashboard) | UI completa | Mock | Métricas y tabla hardcodeadas; pendiente conectar a BD |

---

## Gap Analysis — Lo que falta implementar

### Funcionalidades pendientes (Fase 1 — críticas)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Proceso de compra integrado | Pendiente | Integración con Stripe (checkout, webhooks) |
| Tabla `payments`/`orders` | Pendiente | Registrar transacciones |
| Acceso automático al curso tras compra | Pendiente | Webhook Stripe → insertar en `enrollments` |
| Revocación de acceso | Parcial | Columna `revoked_at` existe; falta UI admin para usarla |
| Certificado de finalización | Pendiente | Tabla `certificates` + lógica de detección de curso completado + generación PDF |
| Racha y actividad reciente del alumno | Pendiente | `Alumno.tsx` ya muestra progreso y cursos completados reales; la racha diaria y la actividad reciente siguen siendo mock |
| Q&A en reproductor de lecciones | Pendiente | `AlumnoCurso.tsx` tiene UI pero no persiste preguntas/respuestas |
| Notas en reproductor | Pendiente | `AlumnoCurso.tsx` tiene UI pero guarda en estado local, no en BD |
| Panel admin con datos reales | Pendiente | `Admin.tsx` completamente mock |
| CRUD de cursos desde admin | Pendiente | Crear/editar cursos, secciones y lecciones |
| Gestión de alumnos desde admin | Pendiente | Buscar, ver estado, dar/revocar acceso manual |
| Emails automáticos | Pendiente | Bienvenida, confirmación compra, recordatorio |
| Migración de 2.400 alumnos existentes | Pendiente | Proceso de importación desde sistema anterior |
| Landing page conectada a Supabase | Pendiente | `Index.tsx` usa `courses.ts` estático; debería leer de BD |

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

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key de Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ID del proyecto Supabase |

Solo el `PUBLISHABLE_KEY` (anon key) está expuesto al cliente. Nunca usar la `service_role` key en el frontend.

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
- Usar el flujo de registro en `/registro` para crear un usuario de prueba (se asigna rol `student` automáticamente).
- Para probar rutas de admin, asignar manualmente el rol `admin` en la tabla `user_roles` de Supabase Studio.
- Para probar el reproductor (`/alumno/curso/:slug`), el usuario debe tener una fila en `enrollments` con `revoked_at IS NULL` para el curso deseado.
- Las lecciones con `is_free_preview = true` son accesibles sin matrícula.
- Los tiles de progreso global, lecciones completadas y cursos completados en `Alumno.tsx` ya usan datos reales de Supabase. La racha y la actividad reciente siguen siendo mock.
- Los datos en `Admin.tsx` son completamente mock.
- `courses.ts` actúa como fallback cuando faltan datos en Supabase; no eliminar hasta que la BD tenga todos los cursos completos.
