# Plan: Conectar Academia Creativa a un proyecto Supabase propio

## Context

El proyecto está actualmente conectado al Supabase de Lovable (`bmuvvdmrugbseqyzjadw`). El usuario quiere desvincularse de Lovable y usar su propio proyecto Supabase, del que tendrá control total (credenciales, email templates, auth providers, etc.).

Las migraciones completas ya existen en `supabase/migrations/` — no hay que reescribir nada de SQL. Solo hay que crear el proyecto nuevo, aplicar esas migraciones, y actualizar 2 archivos de configuración.

---

## Lo que cambia (solo 2 archivos)

El cliente de Supabase (`src/integrations/supabase/client.ts`) ya lee desde env vars — no hay credenciales hardcodeadas en el código. Solo hay que tocar:

1. `.env` — las 3 variables de entorno con las credenciales nuevas
2. `supabase/config.toml` — el `project_id`

Los tipos en `src/integrations/supabase/types.ts` siguen siendo válidos porque el schema es idéntico.

---

## Plan de ejecución

### Paso 1 — El usuario crea el proyecto en Supabase (~5 min, manual)

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) y crear un nuevo proyecto
   - Nombre sugerido: `academia-creativa`
   - Elegir región: Europe West (Irlanda) o US East
   - Guardar bien la contraseña de la base de datos
2. Esperar ~60s a que termine el aprovisionamiento
3. Ir a **Project Settings > API** y copiar:
   - **Project URL** → `https://XXXXXXXXXX.supabase.co`
   - **Publishable key** → clave pública del proyecto
   - **Reference ID** → el código corto `XXXXXXXXXX`

### Paso 2 — Aplicar el schema (SQL Editor de Supabase, sin CLI)

Ir a **SQL Editor** del nuevo proyecto y ejecutar **todos los archivos de `supabase/migrations/`** en orden cronológico (hay 13 archivos en total). El orden importa: cada migración depende de las anteriores.

Los más relevantes:

**Migración 1** — `20260502082240_…`
→ Crea: enum `app_role`, tablas `profiles` y `user_roles`, funciones `has_role()`, triggers `handle_new_user()` y `touch_updated_at()`

**Migración 2** — `20260502082254_…`
→ Correcciones de seguridad en funciones (search_path, revoke public)

**Migración 3** — `20260508133721_…`
→ Tablas `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress`; vista `lessons_public`; funciones `has_course_access()`, `get_lesson_content()`; políticas RLS (incluye `FOR ALL` para admins en las tres tablas); seed con 16 cursos y lecciones de muestra

**Migración 4** — `20260513163652_…`
→ Seed de secciones/lecciones para los 13 cursos restantes

**Migraciones 5–13** — resto de archivos en `supabase/migrations/`
→ Q&A/notas, funciones admin, pagos Stripe, métricas, tendencias, hardening RLS, certificados, detección de actividad

> El orden importa: cada migración depende de las anteriores.

### Paso 3 — Actualizar `.env`

Completar los valores con los del proyecto nuevo:

```
VITE_SUPABASE_PROJECT_ID=TU_NUEVO_REF_ID
VITE_SUPABASE_PUBLISHABLE_KEY=TU_NUEVA_PUBLISHABLE_KEY
VITE_SUPABASE_URL=https://TU_NUEVO_REF_ID.supabase.co
```

**Archivo:** `.env`

### Paso 4 — Actualizar `supabase/config.toml`

```toml
project_id = "TU_NUEVO_REF_ID"
```

**Archivo:** `supabase/config.toml`

---

## Verificación

1. `npm run dev` — arrancar el servidor local
2. Navegar a `/cursos` — debe cargar los 16 cursos del seed (confirma que las queries van al proyecto nuevo)
3. Registrar un usuario nuevo en `/registro` — verificar en Supabase Dashboard > Table Editor > `profiles` que se creó la fila automáticamente (trigger `handle_new_user`)
4. En `user_roles`, confirmar que tiene rol `student`
5. Abrir DevTools > Network y confirmar que las requests van a la URL del nuevo proyecto

---

## Notas importantes

- **`.env` no debe subirse a git** — ya está protegido en `.gitignore`
- **Email templates**: el nuevo proyecto tiene URLs de redirect por defecto (`localhost`). Para producción actualizar en **Authentication > Email Templates**
- **Tipos TS**: `src/integrations/supabase/types.ts` sigue siendo válido. Si en el futuro se agregan tablas, regenerar con: `supabase gen types typescript --project-id TU_REF > src/integrations/supabase/types.ts`
