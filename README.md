# 🎨 Academia Creativa — Plataforma de cursos online

Plataforma LMS propia para Academia Creativa (cliente: Laura Martínez). Reemplaza una infraestructura provisional basada en Notion + Vimeo + Systeme.io + Google Sheets.

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 + SWC + code splitting (lazy + manualChunks) |
| Estilos | Tailwind CSS 3 + CSS custom properties |
| Componentes UI | shadcn/ui (Radix UI primitives) |
| Iconos | Lucide React |
| Routing | React Router DOM 6 |
| Estado servidor | TanStack React Query 5 |
| Estado cliente | React Context (AuthContext) |
| Formularios | React Hook Form 7 + Zod |
| Backend / Auth / DB | Supabase (PostgreSQL + Supabase Auth) |
| Notificaciones | shadcn Toaster (variantes: success / info / warning / destructive) + Sonner (montado) |
| Gráficos | Recharts |
| Testing | Vitest + Testing Library |
| Package manager | npm (compatible con bun) |
| Hosting | Vercel (SPA, `vercel.json` con rewrite catch-all) |
| Pagos | Stripe (Edge Functions `create-checkout-session` + `stripe-webhook`) |

## ⚙️ Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Variables de entorno configuradas (ver sección siguiente)

## 🔑 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=<tu-url-de-supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key>
VITE_SUPABASE_PROJECT_ID=<tu-project-id>
```

Solo el `PUBLISHABLE_KEY` (anon key) se expone al cliente. Nunca usar la `service_role` key en el frontend.

## 🚀 Instalación y desarrollo

```bash
npm install
npm run dev        # Servidor de desarrollo en http://localhost:8080
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # ESLint
npm test           # Vitest
```

## 🗺️ Rutas de la aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page |
| `/cursos` | Público | Catálogo de cursos |
| `/curso/:id` | Público | Detalle de curso (`:id` = slug) |
| `/profesores` | Público | Directorio de instructores |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro de nuevos usuarios |
| `/alumno` | Rol `student` | Dashboard del alumno |
| `/alumno/curso/:slug` | Rol `student` | Reproductor de lecciones |
| `/admin` | Rol `admin` | Panel de administración |
| `/pago/exito` | Público | Confirmación visual tras compra con Stripe |
| `/certificado/:codigo` | Público | Verificación pública de certificado de finalización |

## 🔐 Autenticación y roles

Al registrarse, el trigger `handle_new_user()` asigna automáticamente el rol `student`. Para acceder al panel de admin, asigna manualmente el rol `admin` en la tabla `user_roles` de Supabase Studio.

Roles disponibles: `admin`, `student`.

`signIn` resuelve el rol inmediatamente tras el login y lo retorna; `Login.tsx` usa ese valor para mostrar un mensaje de bienvenida diferenciado (admin vs. alumno).

## 🗄️ Base de datos

Las migraciones están en `supabase/migrations/`. Tablas principales:

- `profiles` — Datos de perfil del usuario
- `user_roles` — Roles por usuario (`admin` | `student`)
- `courses` — Catálogo de cursos
- `sections` — Secciones dentro de cada curso
- `lessons` — Lecciones individuales con control de acceso
- `enrollments` — Matrículas de alumnos a cursos
- `lesson_progress` — Progreso de lecciones por alumno
- `lesson_notes` — Notas privadas por alumno/lección
- `lesson_questions` — Preguntas del Q&A por lección
- `lesson_answers` — Respuestas a preguntas del Q&A
- `lesson_question_votes` — Votos en preguntas (toggle atómico vía RPC)
- `payments` — Registro de transacciones Stripe (session_id, amount, status)
- `certificates` — Certificados emitidos al completar un curso (verification_code único, pdf_url en Storage)

Todas las tablas tienen RLS habilitado. El acceso a contenido de pago se controla mediante la función `has_course_access()`.

## 📊 Estado actual del proyecto

| Área | Progreso |
|------|---------|
| UI / frontend | 100 % |
| Schema Supabase | 100 % |
| Auth + roles | 100 % |
| Datos reales en catálogo | 100 % |
| Datos reales en landing | 100 % |
| Datos reales en reproductor | 100 % |
| Datos reales en dashboard alumno | 100 % |
| Datos reales en panel admin | 100 % |
| Sistema de pagos | 100 % |
| Certificados | 100 % |

### Detalle por página

| Página | Datos | Notas |
|--------|-------|-------|
| Landing (`/`) | Supabase | Cursos destacados en tiempo real; fallback a `courses.ts` para imágenes |
| Catálogo (`/cursos`) | Supabase | Conectado; empty state + error state implementados |
| Detalle curso (`/curso/:id`) | Híbrido | Metadatos de `courses.ts`; matrículas y previews desde Supabase; skeleton en CTAs; botón Comprar llama a Edge Function con spinner y flujo autoCheckout post-login |
| Profesores (`/profesores`) | Estático | Derivado de `courses.ts`; avatares con pravatar |
| Dashboard alumno (`/alumno`) | **Supabase** | Todos los datos reales: progreso, racha diaria, tiempo semanal/mensual, grid de actividad; empty + error state implementados |
| Reproductor (`/alumno/curso/:slug`) | Supabase | Acceso controlado por matrícula; Q&A y notas en BD; modal para obtener certificado al completar curso |
| Admin (`/admin`) | **Supabase** | Dashboard, Cursos, Alumnos, Ventas y Métricas con datos reales; NotificationPanel con badge y drawer; paleta Warm Ink unificada en todos los sub-componentes |
| Confirmación pago (`/pago/exito`) | — | Página post-Stripe con confirmación visual y enlace al dashboard del alumno |
| Verificación cert. (`/certificado/:codigo`) | **Supabase** | Página pública; muestra datos del certificado verificados via RPC; descarga PDF |
| 404 | — | Diseño split con ilustración 3D |

## 🛣️ Roadmap

### Fase 1 — Crítico (para lanzar)

| # | Tarea | Complejidad |
|---|-------|------------|
| ~~1.1~~ | ~~Racha y actividad reciente del alumno~~ | ✅ Completado |
| ~~1.2~~ | ~~Landing conectada a Supabase~~ | ✅ Completado |
| ~~1.3~~ | ~~Panel admin con datos reales~~ | ✅ Completado |
| ~~1.4~~ | ~~Q&A y Notas persistentes en el reproductor~~ | ✅ Completado |
| ~~1.5~~ | ~~Integración de pagos con Stripe~~ | ✅ Completado |
| ~~1.6~~ | ~~Certificados de finalización~~ | ✅ Completado |
| 1.7 | Migración de ~2.400 alumnos existentes | Alta (1–2 días) |
| 1.8 | Emails automáticos (Resend / SendGrid) | Media (1 día) |

Dependencias clave:
- **1.5 Stripe** → desbloquea 1.3 (métricas reales) y 1.8 (confirmación de compra)
- **1.6 Certificados** → requiere 1.8 (email de certificado)
- **1.7 Migración** → requiere 1.8 (bienvenida a alumnos)

### Fase 2 — Deseable (post-lanzamiento)

- CRUD de cursos desde el panel admin
- Sistema de cupones y descuentos
- Suscripción mensual (Stripe Billing)
- Foro / comunidad interna (sustituye Discord)
- Sistema de afiliados
- Tabla propia de instructores (reemplaza datos derivados de `courses.ts`)
- App móvil (React Native / Expo)

## 🧪 Notas para QA

- Usar `/registro` para crear un usuario de prueba (rol `student` asignado automáticamente).
- Para probar rutas de admin, asignar rol `admin` manualmente en `user_roles` desde Supabase Studio.
- Para probar el reproductor, insertar una fila en `enrollments` con `revoked_at = null` para el curso deseado.
- Las lecciones con `is_free_preview = true` son accesibles sin matrícula.
- `courses.ts` actúa como fallback para imágenes y metadatos; no eliminar hasta que la BD tenga `image_url` en todos los cursos.
- Para probar el flujo de pago Stripe, usar tarjeta de test `4242 4242 4242 4242`. El webhook debe estar configurado en el dashboard de Stripe apuntando a la Edge Function `stripe-webhook`.
- Las variables de Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) van en los secrets de Supabase Edge Functions, no en `.env` del frontend.
- Para generar un certificado: completar el 100% de las lecciones de un curso y usar el botón "Obtener certificado" en el reproductor. El certificado queda accesible en el dashboard del alumno.
- La URL de verificación de certificados tiene el formato `/certificado/XXXXXXXX` (código de 8 caracteres en mayúsculas). No requiere autenticación.

Para el detalle completo del plan de implementación, ver [PLAN.md](./PLAN.md).

## 📋 Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [Panel de Administración — Manual](./docs/admin-manual.md) | Guía completa de todas las secciones del panel admin: Dashboard, Métricas, Cursos, Alumnos, Ventas y sistema de notificaciones |
| [PLAN.md](./PLAN.md) | Plan de implementación detallado con tareas y dependencias |

## 🎨 Design system

El archivo [design-system.html](./design-system.html) en la raíz documenta de forma interactiva los colores, tipografía, componentes, espaciado y patrones de la plataforma. Ábrete directamente en el navegador; no requiere servidor.
