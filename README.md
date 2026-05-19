# Academia Creativa — Plataforma de cursos online

Plataforma LMS propia para Academia Creativa (cliente: Laura Martínez). Reemplaza una infraestructura provisional basada en Notion + Vimeo + Systeme.io + Google Sheets.

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
| Package manager | npm (compatible con bun) |
| Hosting | Vercel (SPA, `vercel.json` con rewrite catch-all) |

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Variables de entorno configuradas (ver sección siguiente)

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=<tu-url-de-supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key>
VITE_SUPABASE_PROJECT_ID=<tu-project-id>
```

Solo el `PUBLISHABLE_KEY` (anon key) se expone al cliente. Nunca usar la `service_role` key en el frontend.

## Instalación y desarrollo

```bash
npm install
npm run dev        # Servidor de desarrollo en http://localhost:8080
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # ESLint
npm test           # Vitest
```

## Rutas de la aplicación

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

## Autenticación y roles

Al registrarse, el trigger `handle_new_user()` asigna automáticamente el rol `student`. Para acceder al panel de admin, asigna manualmente el rol `admin` en la tabla `user_roles` de Supabase Studio.

Roles disponibles: `admin`, `student`.

## Base de datos

Las migraciones están en `supabase/migrations/`. Tablas principales:

- `profiles` — Datos de perfil del usuario
- `user_roles` — Roles por usuario (`admin` | `student`)
- `courses` — Catálogo de cursos
- `sections` — Secciones dentro de cada curso
- `lessons` — Lecciones individuales con control de acceso
- `enrollments` — Matrículas de alumnos a cursos
- `lesson_progress` — Progreso de lecciones por alumno

Todas las tablas tienen RLS habilitado. El acceso a contenido de pago se controla mediante la función `has_course_access()`.

## Estado actual del proyecto

| Página | Datos | Notas |
|--------|-------|-------|
| Landing (`/`) | Estático | Pendiente conectar a Supabase |
| Catálogo (`/cursos`) | Supabase | Conectado |
| Detalle curso (`/curso/:id`) | Híbrido | Metadatos de `courses.ts`; matrículas y previews desde Supabase |
| Profesores (`/profesores`) | Estático | Derivado de `courses.ts`; avatares con pravatar |
| Dashboard alumno (`/alumno`) | Híbrido | Progreso y cursos completados reales; racha y actividad son mock |
| Reproductor (`/alumno/curso/:slug`) | Supabase | Acceso controlado por matrícula |
| Admin (`/admin`) | Mock | Pendiente conectar a BD |

## Próximas funcionalidades

- Integración con Stripe (pagos + webhooks → matrículas automáticas)
- Certificados de finalización
- Panel admin con datos reales y CRUD de cursos
- Q&A y notas persistidas en el reproductor
- Emails automáticos (bienvenida, confirmación de compra)
- Migración de ~2.400 alumnos del sistema anterior
