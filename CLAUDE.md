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
| Generado con | Lovable (lovable-tagger en devDependencies) |

---

## Estructura de carpetas

```
src/
├── App.tsx                  # Router raíz + providers
├── pages/                   # Una página por ruta
│   ├── Index.tsx            # Home / landing
│   ├── Cursos.tsx           # Catálogo de cursos
│   ├── Curso.tsx            # Detalle de un curso (hardcoded: "Marca magnética")
│   ├── Alumno.tsx           # Dashboard del alumno (protegida: rol student)
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
│   └── courses.ts           # 16 cursos hardcodeados (TEMPORAL — ver Gap Analysis)
├── integrations/supabase/
│   ├── client.ts            # Singleton del cliente Supabase
│   └── types.ts             # Tipos autogenerados por Supabase CLI
├── hooks/
│   ├── use-mobile.tsx       # Detección de viewport móvil
│   └── use-toast.ts         # Hook de notificaciones
├── lib/
│   └── utils.ts             # clsx + tailwind-merge (cn helper)
└── assets/                  # Imágenes de cursos (course-*.jpg) y avatar
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `Index` | Público |
| `/cursos` | `Cursos` | Público |
| `/curso` | `Curso` | Público (sin parámetro de ID aún) |
| `/login` | `Login` | Público |
| `/registro` | `Registro` | Público |
| `/alumno` | `Alumno` | Protegida (rol: `student`) |
| `/admin` | `Admin` | Protegida (rol: `admin`) |

> **PENDIENTE:** la ruta `/curso` no acepta parámetro dinámico (`:id`). Siempre muestra el curso "Marca magnética" con datos hardcodeados.

---

## Autenticación y roles

El sistema de auth está implementado sobre Supabase Auth + tablas propias.

### Flujo
1. `supabase.auth.signInWithPassword` / `signUp` → sesión en `localStorage`
2. `onAuthStateChange` en `AuthContext` mantiene estado reactivo
3. Al autenticarse se leen `profiles` y `user_roles` en paralelo
4. `ProtectedRoute` lee `role` del contexto; redirige si no coincide

### Roles disponibles (`app_role` enum)
- `admin` — acceso a `/admin`
- `student` — acceso a `/alumno`

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
| `updated_at` | `timestamptz` | |

### Funciones / triggers
- `handle_new_user()` — trigger `AFTER INSERT ON auth.users` → crea `profile` + rol `student`
- `touch_updated_at()` — trigger en tablas con `updated_at`
- `has_role(uuid, app_role)` — SECURITY DEFINER para uso en políticas RLS

### RLS
Todas las tablas tienen RLS habilitado. Las políticas permiten a cada usuario leer y modificar solo sus propios datos. `has_role` es accesible por usuarios `authenticated`.

### Tablas PENDIENTES de crear
Ver sección Gap Analysis.

---

## Sistema de diseño

### Fuente
- **Display y body:** `Nunito Sans` (Google Fonts). Clase: `font-display` y `font-sans`.

### Paleta de colores (CSS custom properties en `index.css`)
Los colores se definen como variables HSL y se consumen vía Tailwind:

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

## Estado actual de la UI (qué está construido como UI/prototipo)

Las páginas siguientes están construidas como UI estática o semi-funcional. Los datos mostrados son hardcodeados o mockeados:

| Página | Estado UI | Datos reales |
|--------|-----------|-------------|
| `Index` (landing) | Completa | Usa `courses.ts` (estáticos) |
| `Cursos` (catálogo) | Completa | Usa `courses.ts` (estáticos) |
| `Curso` (detalle) | Completa | 100% hardcoded (solo "Marca magnética") |
| `Login` | Funcional | Auth real con Supabase |
| `Registro` | Funcional | Auth real con Supabase |
| `Alumno` (dashboard) | UI completa | Datos mockeados (progreso, racha, certificados, actividad) |
| `Admin` (dashboard) | UI completa | Datos mockeados (métricas, ventas, cursos, tabla) |

---

## Gap Analysis — Lo que falta implementar

### Base de datos
Las siguientes tablas no existen aún y son necesarias para funcionalidad real:

- `courses` — Catálogo de cursos (actualmente en `src/data/courses.ts`)
- `modules` — Módulos dentro de un curso
- `lessons` — Lecciones dentro de un módulo (con URL de vídeo, tipo, duración)
- `enrollments` — Relación alumno ↔ curso (con fecha de compra, estado de acceso)
- `lesson_progress` — Progreso de lección por alumno (completada, timestamp)
- `payments` / `orders` — Registro de transacciones (integración con Stripe pendiente)
- `certificates` — Certificados emitidos al completar un curso

### Funcionalidades pendientes (Fase 1 — críticas)

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Rutas dinámicas de curso (`/curso/:id`) | Pendiente | Actualmente `/curso` sin parámetro |
| Catálogo de cursos desde BD | Pendiente | Leer de tabla `courses` de Supabase |
| Reproductor de lecciones real | Pendiente | Embed de Vimeo o reproductor custom |
| Sistema de progreso por lección | Pendiente | Tabla `lesson_progress` + UI ya esbozada |
| Dashboard alumno con datos reales | Pendiente | Conectar a BD en lugar de mock |
| Proceso de compra integrado | Pendiente | Integración con Stripe (checkout, webhooks) |
| Acceso al curso tras compra | Pendiente | Tabla `enrollments`, validación en rutas |
| Revocación de acceso | Pendiente | Cambiar estado en `enrollments` |
| Certificado de finalización | Pendiente | Lógica de detección de curso completado + generación PDF |
| Panel admin con datos reales | Pendiente | Métricas y tablas conectadas a BD |
| CRUD de cursos desde admin | Pendiente | Crear/editar cursos, módulos y lecciones |
| Gestión de alumnos desde admin | Pendiente | Buscar, ver estado, dar acceso manual |
| Emails automáticos | Pendiente | Bienvenida, confirmación compra, recordatorio |
| Migración de 2.400 alumnos existentes | Pendiente | Proceso de importación desde sistema anterior |

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

## Notas para QA

- Las páginas `Alumno` y `Admin` requieren sesión activa. Usar flujo de registro en `/registro` para crear un usuario de prueba (se asigna rol `student` automáticamente).
- Para probar rutas de admin, asignar manualmente el rol `admin` en la tabla `user_roles` de Supabase Studio.
- Los datos mostrados en `Admin.tsx` y `Alumno.tsx` son completamente mockeados. No reflejan datos reales de la BD.
- La página `/curso` siempre muestra el curso "Marca magnética" independientemente de la URL.
- El catálogo en `/cursos` muestra 16 cursos del archivo estático `src/data/courses.ts`, no de Supabase.
