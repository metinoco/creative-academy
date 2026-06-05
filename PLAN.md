# Academia Creativa — Guía de avance del proyecto

> **Última revisión:** 5 junio 2026  
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
| Datos reales en dashboard alumno | ████████████ 100 % |
| Q&A y Notas en reproductor | ████████████ 100 % |
| Datos reales en panel admin | ████████████ 100 % |
| Sistema de pagos | ████████████ 100 % |
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
- [x] Panel admin (`/admin`) — Dashboard, Cursos, Alumnos y Ventas con datos reales; paleta Warm Ink
- [x] `PagoExito.tsx` (`/pago/exito`) — confirmación visual post-Stripe con enlace al dashboard
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
- [x] Seed con 16 cursos, secciones y lecciones — todos los cursos tienen conteos sincronizados con `courses.ts` (22–58 lecciones por curso)
- [x] 8 migraciones en `supabase/migrations/`
- [x] Edge Functions: `create-checkout-session` (crea sesión Stripe) y `stripe-webhook` (procesa `checkout.session.completed` → inserta en `payments` + `enrollments`)
- [x] Tabla `payments` con RLS + funciones `admin_get_payment_stats()` y `admin_get_recent_payments()`

### Datos reales conectados
- [x] `Cursos.tsx` — lee de tabla `courses` (status=published)
- [x] `Index.tsx` — cursos destacados desde `courses` (status=published, orden por reviews_count); fallback a `courses.ts` para imágenes
- [x] `AlumnoCurso.tsx` — lecciones, progreso, control de acceso por matrícula
- [x] `Alumno.tsx` — matrículas, progreso, lecciones y cursos completados (tiles reales)
- [x] `Alumno.tsx` — racha diaria, tiempo semanal/mensual y grid de actividad calculados desde `lesson_progress` (query `student-activity`)
- [x] `AdminVentas.tsx` — métricas y lista de transacciones reales desde `admin_get_payment_stats` y `admin_get_recent_payments`
- [x] `Curso.tsx` — botón Comprar llama a Edge Function; spinner durante redirect; flujo autoCheckout post-login

---

## Datos aún en mock o estáticos

| Componente | Dato mock | Nota |
|-----------|-----------|------|
| `AdminCursos.tsx` | Paleta de colores | Aún usa tokens indigo/magenta antiguos; pendiente unificar a Warm Ink |
| `Curso.tsx` | Metadatos visuales (imagen, bio, "aprenderás") | `courses.ts` como fuente; parcialmente enriquecido con Supabase |
| `Profesores.tsx` | Todo | Derivado de `courses.ts`; Supabase no tiene tabla de instructores |

---

## Fase 1 — Crítico (para lanzar)

### ~~1.1 Racha y actividad reciente del alumno~~ ✅ COMPLETADO
Query `student-activity` en `Alumno.tsx`: lee `lesson_progress` + `lessons` (duration_minutes). Calcula racha diaria (`calcStreak`), tiempo semanal/mensual (`calcWeekMinutes`/`calcMonthMinutes`) y grid de actividad 5 semanas (`calcActivityGrid`).

---

### ~~1.2 Landing conectada a Supabase~~ ✅ COMPLETADO
`cd5343c` — `Index.tsx` lee cursos en tiempo real desde Supabase; `courses.ts` como fallback de imágenes.

---

### ~~1.3 Panel admin con datos reales~~ ✅ COMPLETADO
Migración `20260602000000_admin-panel-functions.sql`: 4 funciones `SECURITY DEFINER` (`admin_get_students`, `admin_get_student_enrollments`, `admin_grant_course_access`, `admin_get_course_stats`). `Admin.tsx` refactorizado como shell con navegación por estado (`activeSection`). Sub-componentes en `src/components/admin/`:
- **`AdminDashboard.tsx`**: 4 tiles reales (alumnos activos, nuevos este mes, cursos publicados, lecciones completadas); top cursos por matrículas; secciones revenue/ventas con overlay "Próximamente" (Stripe).
- **`AdminCursos.tsx`**: tabla completa de todos los cursos desde `admin_get_course_stats`; búsqueda por título/autor/categoría; badge estado; conteo de matrículas activas; "Ver" enlaza al catálogo; "Editar" deshabilitado con tooltip.
- **`AdminAlumnos.tsx`**: tabla de alumnos desde `admin_get_students`; modal centralizado por alumno (`Dialog`, `max-h-[90dvh]`, scroll interno, adaptado a móvil); lista de matrículas con doble confirmación inline para revocar; stub `notifyAccessRevoked` listo para conectar Resend (tarea 1.8); botón Restaurar para reactivar matrículas revocadas; `Select` de shadcn + botón "Dar acceso" para matrícula manual; paleta Warm Ink completa.
- **`AdminVentas.tsx`**: placeholder con lista de funcionalidades pendientes de Stripe.
Secciones "Métricas" y "Ajustes" con `ComingSoonSection` hasta Fase 2.

---

### ~~1.4 Q&A y Notas persistentes en el reproductor~~ ✅ COMPLETADO
Migración `20260530120000_qa-and-notes.sql`: tablas `lesson_notes`, `lesson_questions`, `lesson_answers`, `lesson_question_votes` + RPC `toggle_question_vote`. RLS en todas: notas privadas por usuario; Q&A restringido a alumnos matriculados vía `has_course_access`; admins gestionan todo. `AlumnoCurso.tsx` sustituye el mock `INITIAL_QA` y el estado local de notas por queries y mutations reales con React Query. Notas con debounce upsert + feedback "Guardando…" / "Guardado". Votos con toggle atómico en servidor. Answers soportan flag `is_instructor_answer` con badge "Verificado".

---

### ~~1.5 Integración de pagos con Stripe~~ ✅ COMPLETADO
`0b6d96d` — Edge Functions `create-checkout-session` y `stripe-webhook`; migración `20260605000000_stripe-payments.sql` con tabla `payments` + funciones admin; `Curso.tsx` con flujo de compra completo; `PagoExito.tsx` en `/pago/exito`; `AdminVentas.tsx` con datos reales.

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
| Schema BD | `supabase/migrations/` (8 archivos) |
| Edge Functions | `supabase/functions/create-checkout-session/`, `supabase/functions/stripe-webhook/` |
| Confirmación pago | `src/pages/PagoExito.tsx` |
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
