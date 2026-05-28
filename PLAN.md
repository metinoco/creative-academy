# Academia Creativa — Guía de avance del proyecto

> **Última revisión:** 28 mayo 2026 (rev. 2)  
> **Rama activa:** `development` → `main`  
> **Deploy:** Vercel (SPA con `vercel.json`)  
> **Backend:** Supabase (PostgreSQL + Auth)

---

## Estado global

| Área | Progreso |
|------|---------|
| UI / frontend | ████████████ 100 % |
| Schema Supabase | ████████████ 100 % |
| Auth + roles | ████████████ 100 % |
| Datos reales en catálogo | ████████████ 100 % |
| Datos reales en landing | ████████████ 100 % |
| Datos reales en reproductor | ████████████ 100 % |
| Datos reales en dashboard alumno | ████████░░░░ 70 % |
| Datos reales en panel admin | ░░░░░░░░░░░░ 0 % |
| Sistema de pagos | ░░░░░░░░░░░░ 0 % |
| Certificados | ░░░░░░░░░░░░ 0 % |

---

## Lo que está completo

### Frontend (UI)
- [x] Landing page (`/`) — hero, cursos destacados, CTA
- [x] Catálogo de cursos (`/cursos`) — búsqueda, filtro por categoría, ordenación
- [x] Detalle de curso (`/curso/:id`) — temario, instructor, precio, CTA de compra
- [x] Directorio de profesores (`/profesores`)
- [x] Login (`/login`) — Supabase Auth real
- [x] Registro (`/registro`) — trigger crea perfil + rol student automáticamente
- [x] Dashboard alumno (`/alumno`) — cabecera, tiles de progreso, cursos en curso
- [x] Reproductor de curso (`/alumno/curso/:slug`) — sidebar de lecciones, player, progreso
- [x] Panel admin (`/admin`) — UI con sidebar, métricas, tabla de ventas (UI completa, datos mock)
- [x] Rutas protegidas por rol (`ProtectedRoute`)
- [x] Favicon SVG de marca
- [x] `vercel.json` para SPA routing en Vercel
- [x] Sistema de toasts tipados: variantes `success`, `info`, `warning`, `destructive` con borde lateral e iconos
- [x] Empty state + error state en `Cursos.tsx` (SearchX + limpiar filtros; reintentar)
- [x] Empty state + error state en `Alumno.tsx` (motivacional con CTA; reintentar)
- [x] Skeleton en CTAs de `Curso.tsx` mientras verifica matrícula
- [x] Spinner `Loader2` en botones de `Login.tsx` y `Registro.tsx` durante envío
- [x] Tipografía dual: DM Serif Display (titulares) + Nunito Sans (body)
- [x] Responsividad móvil: menú hamburguesa (`Sheet`) en `SiteHeader` y `Admin`
- [x] Code splitting: `lazy()` + `Suspense` en `App.tsx`; `manualChunks` en `vite.config.ts`
- [x] `NotFound.tsx` rediseñada: layout split con ilustración 3D
- [x] `design-system.html`: referencia visual interactiva con scroll-spy

### Backend / Supabase
- [x] Schema completo: `profiles`, `user_roles`, `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress`
- [x] Enums: `app_role`, `course_status`, `course_tone`, `enrollment_source`
- [x] Vista `lessons_public` con `security_invoker`
- [x] Funciones: `has_role()`, `has_course_access()`, `get_lesson_content()`
- [x] Triggers: `handle_new_user()`, `touch_updated_at()`
- [x] RLS en todas las tablas (anon, student, admin)
- [x] Seed con 16 cursos, secciones y lecciones
- [x] 4 migraciones en `supabase/migrations/`

### Datos reales conectados
- [x] `Cursos.tsx` — lee de tabla `courses` (status=published)
- [x] `Index.tsx` — cursos destacados desde `courses` (status=published, orden por reviews_count); fallback a `courses.ts` para imágenes
- [x] `AlumnoCurso.tsx` — lecciones, progreso, control de acceso por matrícula
- [x] `Alumno.tsx` — matrículas, progreso por curso, lecciones completadas, cursos completados (tiles reales)

---

## Datos aún en mock o estáticos

| Componente | Dato mock | Nota |
|-----------|-----------|------|
| `Alumno.tsx` | Racha diaria (28 días) | Requiere tabla o lógica de `lesson_progress` por fecha |
| `Alumno.tsx` | Actividad reciente | Requiere query ordenada por `completed_at` |
| `Admin.tsx` | Todas las métricas y tabla de ventas | Pendiente conectar a BD |
| `Curso.tsx` | Metadatos visuales (imagen, bio, "aprenderás") | `courses.ts` como fuente; parcialmente enriquecido con Supabase |
| `Profesores.tsx` | Todo | Derivado de `courses.ts`; Supabase no tiene tabla de instructores |
| `AlumnoCurso.tsx` | Q&A y Notas | UI presente, sin persistencia en BD |

---

## Fase 1 — Crítico (para lanzar)

### 1.1 Racha y actividad reciente del alumno
**Archivo:** `src/pages/Alumno.tsx`  
**Qué hacer:**
- Query a `lesson_progress` ordenada por `completed_at DESC` para actividad reciente
- Calcular racha diaria contando días consecutivos con al menos una lección completada
- Reemplazar constantes `STREAK_DAYS` y `WEEK_TIME` por valores reales

**Complejidad:** Baja (1–2 horas)

---

### ~~1.2 Landing conectada a Supabase~~ ✅ COMPLETADO
`cd5343c` — `Index.tsx` lee cursos en tiempo real desde Supabase; `courses.ts` como fallback de imágenes.

---

### 1.3 Panel admin con datos reales
**Archivo:** `src/pages/Admin.tsx`  
**Qué hacer:**
- Métricas: queries a `enrollments` (total, nuevos este mes), `courses` (activos), `lesson_progress`
- Tabla de ventas: requiere tabla `payments` (ver 1.5)
- Gestión de alumnos: listar `profiles` + `enrollments`; permitir dar/revocar acceso manual

**Complejidad:** Media (4–6 horas, depende de 1.5)

---

### 1.4 Q&A y Notas persistentes en el reproductor
**Archivos:** `src/pages/AlumnoCurso.tsx`  
**Qué hacer (Q&A):**
- Crear tabla `lesson_questions` (`id`, `user_id`, `lesson_id`, `body`, `created_at`)
- Crear tabla `lesson_answers` (`id`, `question_id`, `user_id`, `body`, `created_at`)
- Migración SQL + RLS (alumno ve preguntas del curso en el que está matriculado; admin ve todo)
- Sustituir `INITIAL_QA` mock por query real

**Qué hacer (Notas):**
- Crear tabla `lesson_notes` (`id`, `user_id`, `lesson_id`, `body`, `updated_at`)
- Migración + RLS (usuario solo ve sus propias notas)
- Sustituir estado local por mutación Supabase

**Complejidad:** Media (3–5 horas)

---

### 1.5 Integración de pagos con Stripe
**Qué hacer:**
1. Crear tabla `payments` en Supabase:
   ```sql
   id uuid PK, user_id uuid FK, course_id uuid FK,
   stripe_session_id text unique, amount numeric,
   currency text default 'eur', status text,
   created_at timestamptz
   ```
2. Crear Edge Function `create-checkout-session`:
   - Recibe `course_id` + JWT del alumno
   - Crea Stripe Checkout Session
   - Devuelve `session_url` para redirect
3. Crear Edge Function `stripe-webhook`:
   - Verifica firma (`STRIPE_WEBHOOK_SECRET`)
   - En evento `checkout.session.completed`: inserta en `payments` y en `enrollments`
4. Actualizar UI del botón "Comprar" en `Curso.tsx` → llama a la edge function
5. Página de confirmación de compra (redirect de Stripe)

**Variables de entorno necesarias (en Supabase Edge Functions):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Complejidad:** Alta (1–2 días)

---

### 1.6 Certificados de finalización
**Qué hacer:**
1. Crear tabla `certificates`:
   ```sql
   id uuid PK, user_id uuid FK, course_id uuid FK,
   issued_at timestamptz, certificate_number text unique
   ```
2. Lógica de detección: cuando `lesson_progress` de un curso == 100% → insertar en `certificates`
   - Opción A: trigger en `lesson_progress` (compara total con completadas)
   - Opción B: Edge Function llamada desde el cliente al marcar última lección
3. Generación de PDF: Edge Function con una librería como `jsPDF` o plantilla HTML→PNG→PDF
4. UI en `Alumno.tsx`: mostrar certificado descargable en cursos completados
5. UI en `AlumnoCurso.tsx`: mostrar banner de felicitación + botón descargar al completar

**Complejidad:** Alta (2–3 días)

---

### 1.7 Migración de 2.400 alumnos existentes
**Qué hacer:**
1. Exportar CSV desde sistema anterior (Systeme.io / Google Sheets): email, nombre, cursos asignados
2. Script de migración (Node.js):
   - Usar Supabase Admin API (`service_role` key) para crear usuarios via `auth.admin.createUser()`
   - Insertar en `enrollments` con `source = 'manual'` para cada curso asignado
   - Enviar email de bienvenida/reseteo de contraseña a cada alumno
3. Ejecutar en un entorno controlado, no desde el frontend

**Complejidad:** Alta (1–2 días de preparación + ejecución supervisada)

---

### 1.8 Emails automáticos
**Qué hacer (via Supabase Edge Functions + Resend o SendGrid):**
- Bienvenida tras registro (se puede hacer en `handle_new_user` trigger o en el registro de la app)
- Confirmación de compra (trigger en `payments`)
- Acceso al curso (trigger en `enrollments`)
- Certificado emitido (trigger en `certificates`)

**Complejidad:** Media (1 día)

---

## Fase 2 — Deseable (post-lanzamiento)

| Funcionalidad | Notas |
|---------------|-------|
| CRUD de cursos desde admin | Crear/editar/archivar cursos, secciones y lecciones |
| Sistema de cupones y descuentos | Tabla `coupons`; lógica en edge function de checkout |
| Suscripción mensual | Stripe Billing; lógica de acceso por suscripción activa |
| Foro / comunidad interna | Sustituir Discord; tablas `topics`, `posts`, `replies` |
| Sistema de afiliados | Tabla `affiliates`; tracking de conversiones |
| Página de profesores con Supabase | Tabla `instructors` propia en vez de derivar de `courses.ts` |
| App móvil (React Native / Expo) | Reutiliza el mismo backend Supabase |

---

## Dependencias entre tareas

```
1.5 Stripe  ──→  1.3 Admin (métricas de ventas reales)
1.5 Stripe  ──→  1.8 Emails (confirmación de compra)
1.6 Certif. ──→  1.8 Emails (certificado emitido)
1.7 Migrac. ──→  1.8 Emails (bienvenida a alumnos)
```

---

## Archivos clave por funcionalidad

| Funcionalidad | Archivos principales |
|---------------|---------------------|
| Auth | `src/context/AuthContext.tsx`, `src/components/ProtectedRoute.tsx` |
| Catálogo | `src/pages/Cursos.tsx`, `src/components/CourseCard.tsx` |
| Detalle curso | `src/pages/Curso.tsx`, `src/data/courses.ts` |
| Dashboard alumno | `src/pages/Alumno.tsx` |
| Reproductor | `src/pages/AlumnoCurso.tsx` |
| Panel admin | `src/pages/Admin.tsx` |
| Schema BD | `supabase/migrations/` (4 archivos) |
| Edge Functions | `supabase/functions/` (aún no creadas) |
| Tipos Supabase | `src/integrations/supabase/types.ts` |
| Datos estáticos | `src/data/courses.ts` |

---

## Convenciones para nuevas migraciones

Todas las migraciones nuevas van en `supabase/migrations/` con el formato de nombre que genera Supabase CLI:
```
supabase migration new nombre-descriptivo
```
Nunca modificar migraciones ya aplicadas — siempre crear una nueva.

---

## Notas de entorno

- `npm run dev` arranca en `http://localhost:8080`
- Variables de entorno en `.env` (no subir a git)
- Para probar admin: asignar rol en `user_roles` desde Supabase Studio
- Para probar reproductor: insertar fila en `enrollments` con `revoked_at = null`
- `courses.ts` es fallback; no eliminar hasta que BD tenga `image_url` en todos los cursos
