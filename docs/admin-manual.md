# Panel de Administración — Manual de uso

> Acceso: `/admin` · Requiere rol `admin` asignado en la tabla `user_roles`

---

## Índice

1. [Cómo acceder](#1-cómo-acceder)
2. [Navegación lateral](#2-navegación-lateral)
3. [Panel de notificaciones](#3-panel-de-notificaciones)
4. [Dashboard](#4-dashboard)
5. [Métricas](#5-métricas)
6. [Cursos](#6-cursos)
7. [Alumnos](#7-alumnos)
8. [Ventas](#8-ventas)
9. [Funciones SQL de soporte](#9-funciones-sql-de-soporte)
10. [Notas para QA](#10-notas-para-qa)

---

## 1. Cómo acceder

1. Accede a `/login` con un usuario que tenga el rol `admin` en `user_roles`.
2. Una vez autenticado, navega a `/admin` — el guard `ProtectedRoute` redirige si el rol no coincide.
3. Para asignar el rol manualmente: Supabase Studio → tabla `user_roles` → insertar fila con `role = 'admin'` para el `user_id` deseado.

---

## 2. Navegación lateral

El sidebar usa la paleta **Warm Ink** (fondo `hsl(24 25% 12%)`, acento terracota `hsl(14 78% 52%)`). En móvil se convierte en un drawer deslizable (componente `Sheet` de shadcn/ui).

```
┌─────────────────────┐
│  ◆ Academia         │
│    ✦ Admin          │
│                     │
│  VISIÓN GENERAL     │
│  ▸ Dashboard        │
│  ▸ Métricas         │
│                     │
│  CONTENIDO          │
│  ▸ Cursos           │
│                     │
│  COMUNIDAD          │
│  ▸ Alumnos          │
│  ▸ Ventas           │
│  ─────────────────  │
│  ▸ Ajustes 🔒       │
│                     │
│  [Avatar] Laura     │
│  Owner · Admin  ↗   │
└─────────────────────┘
```

| Ítem | Sección | Estado |
|------|---------|--------|
| Dashboard | Visión general | Activo |
| Métricas | Visión general | Activo |
| Cursos | Contenido | Activo |
| Alumnos | Comunidad | Activo |
| Ventas | Comunidad | Activo |
| Ajustes | — | Próximamente |

El pie del sidebar muestra el avatar y nombre del usuario autenticado (tomado de `profiles.full_name`). Hacer clic en él cierra sesión y redirige a `/`.

---

## 3. Panel de notificaciones

El icono de campana (🔔) en la topbar abre un popover con resumen en tiempo real de los eventos que requieren atención. Se actualiza cada **5 minutos** y tiene acceso directo a la sección correspondiente.

```
┌──────────────────────────────┐
│  Notificaciones    [3 pend.] │
├──────────────────────────────┤
│  🛍 Ventas · últimas 24 h    │
│  ─────────────────────────── │
│  [AB] Ana Blanco             │
│       Diseño UX · €97,00     │
│       hace 2 h               │
├──────────────────────────────┤
│  💬 Q&A pendientes           │
│  ─────────────────────────── │
│  [5]  5 preguntas sin resp.  │
│       de 12 totales          │
├──────────────────────────────┤
│  ⚠ Alumnos en riesgo · +30d  │
│  ─────────────────────────── │
│  [MC] María Conde · 45 d     │
│       Ilustración Digital    │
│  Ver 2 más en Métricas →     │
└──────────────────────────────┘
```

**Lógica del badge:**

- El contador solo incluye items que requieren acción: Q&A sin responder + alumnos en riesgo.
- Las ventas recientes aparecen como información positiva pero **no suman al badge**.
- Si todo está al día, el icono muestra un punto terracota y el popover presenta "✓ Todo al día".

**Navegación rápida:** cada sección del panel tiene un encabezado clickable que lleva directamente al tab correspondiente (`Ventas`, `Métricas`, `Alumnos`).

---

## 4. Dashboard

Vista de control principal. Agrega los datos más importantes en una sola pantalla.

### 4.1 Tiles KPI

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Alumnos      │ Nuevos este  │ Cursos       │ Lecciones    │ Conversión   │
│ activos      │ mes          │ activos      │ completadas  │ este mes     │
│              │              │              │              │              │
│   1.240      │     38       │     16       │   4.870      │    42%       │
│              │              │              │              │ 16 de 38 via │
│              │              │              │              │    Stripe    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

| Tile | Fuente de datos | Descripción |
|------|----------------|-------------|
| Alumnos activos | `enrollments` (revoked_at IS NULL) | Total de matrículas activas en toda la plataforma |
| Nuevos este mes | `enrollments.granted_at ≥ 1°del mes` | Matrículas otorgadas desde el inicio del mes actual |
| Cursos activos | `courses` (status = published) | Cursos publicados y visibles en el catálogo |
| Lecciones completadas | `lesson_progress` (completed = true) | Suma global de lecciones marcadas como completadas |
| Conversión este mes | `enrollments` (source = purchase) / total nuevos | % de alumnos nuevos que entraron vía Stripe (pago) |

### 4.2 Bloque de ingresos

```
┌──────────────────────────────────────────┬─────────────────────────┐
│  Ingresos                                │  Top cursos             │
│                                          │  (por matrículas)       │
│  ┌──────────┬──────────┬──────────┐      │                         │
│  │ Total    │ Este mes │ Mes ant. │      │  01 [img] Diseño UX     │
│  │ histórico│          │          │      │          87 alumnos     │
│  │          │ ↑ +12%   │ cerrado  │      │  02 [img] Ilustración   │
│  │ €8.450   │ €1.230   │ €1.100   │      │          65 alumnos     │
│  │ 87 ventas│ 12 vtas  │          │      │  03 [img] Branding      │
│  └──────────┴──────────┴──────────┘      │          54 alumnos     │
└──────────────────────────────────────────┴─────────────────────────┘
```

- El delta mensual (↑/↓ %) se calcula comparando `month_revenue_cents` vs. `prev_month_revenue_cents` de la función `admin_get_payment_stats()`.
- Si no hay datos del mes anterior, se muestra el conteo de ventas en lugar del delta.

### 4.3 Ventas recientes

Lista de las **últimas 5 transacciones** con enlace "Ver todas →" que navega a la sección Ventas. Incluye avatar generado a partir de iniciales, nombre/email, curso, importe y fecha.

### 4.4 Finalización por curso

Barras de progreso que muestran qué porcentaje de alumnos **completaron el 100% de un curso**. La barra usa el gradiente `bg-gradient-warm` del design system.

```
Diseño UX          7 de 87 alumnos   ██████░░░░░░░░░░░░░░   8%
Ilustración Digital 3 de 65 alumnos  ████░░░░░░░░░░░░░░░░░  5%
Lettering          12 de 54 alumnos  ████████████░░░░░░░░░  22%
```

### 4.5 Q&A pendientes

Tile lateral que muestra el número de preguntas sin responder. Se pone en rojo cuando `unanswered_count > 0`, verde cuando todo está respondido.

### 4.6 Ingresos por curso

Ranking de cursos con ventas, con barras horizontales proporcionales al mayor ingreso. Muestra imagen del curso (desde `courses.ts`), importe total y conteo de ventas.

---

## 5. Métricas

Análisis de tendencias y retención. Cuatro bloques independientes.

### 5.1 Gráficos de tendencia (últimos 12 meses)

```
Ingresos por mes                    Alumnos nuevos por mes
€ 1.200 ┤         ╭─╮              45 ┤         ╭─╮
€   800 ┤    ╭─╮  │ │ ╭─╮          30 ┤    ╭─╮  │ │ ╭─╮
€   400 ┤ ╭╮ │ │  │ │ │ │          15 ┤ ╭╮ │ │  │ │ │ │
        └────────────────           0 └────────────────
        jul ago sep oct nov            jul ago sep oct nov
```

- **Ingresos por mes**: barras terracota, tooltip con importe en EUR y número de ventas.
- **Alumnos nuevos por mes**: barras violeta, tooltip con número de matrículas.
- Ambos usan `generate_series` en PostgreSQL para rellenar meses sin datos con cero.

### 5.2 Distribución de progreso por curso

Muestra visualmente **en qué punto abandonan los alumnos** dentro de cada curso.

```
Leyenda:
░ Sin empezar (0%)  ▒ 1–25%  ▓ 26–50%  ▒ 51–75%  ▓ 76–99%  █ Completado

Diseño UX  (87 alumnos)
[░░░░░░░░░░░░░][▒▒▒▒▒▒▒][▓▓▓▓][▒▒▒▒][▓▓▓][█]

Ilustración Digital  (65 alumnos)
[░░░░░░░░░░░░░░░░][▒▒▒▒▒▒▒▒▒][▓▓▓▓▓][▒▒][▓][█]
```

Cada segmento de color es proporcional al total de alumnos en ese rango. Al hacer hover, muestra el conteo exacto.

| Color | Rango | Significado |
|-------|-------|-------------|
| Gris claro | 0% | No ha empezado ninguna lección |
| Amarillo claro | 1–25% | Inicio del curso |
| Amarillo | 26–50% | Mitad inferior |
| Naranja | 51–75% | Mitad superior |
| Terracota | 76–99% | Casi terminado |
| Verde | 100% | Curso completado |

### 5.3 Alumnos en riesgo

Tabla de alumnos con matrícula activa que **no han completado ninguna lección** en el período seleccionado desde su fecha de matrícula.

```
┌──────────────────────────────────────────────────────────────────┐
│  Alumnos en riesgo  [⚠ 8 alumnos]      [Inactivos > 30 días ▾]  │
├────────────────┬──────────────────┬────────────┬─────────────────┤
│ Alumno         │ Curso            │ Matriculado│ Inactividad     │
├────────────────┼──────────────────┼────────────┼─────────────────┤
│ María Conde    │ Diseño UX        │ 12 abr '26 │ 🟡 45 días      │
│ m.conde@...    │                  │            │                 │
│ Pedro Ruiz     │ Branding Digital │ 20 mar '26 │ 🔴 77 días      │
└────────────────┴──────────────────┴────────────┴─────────────────┘
```

**Filtro de días:** selector con opciones 30 / 60 / 90 días. Al cambiar, se re-ejecuta la query.

**Código de colores de inactividad:**
- Amarillo: 30–59 días
- Ámbar: 60–89 días
- Rojo: 90+ días

---

## 6. Cursos

Tabla del catálogo completo con datos en tiempo real desde Supabase. Desde aquí se pueden crear y editar cursos directamente.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Catálogo de cursos                                    [+ Nuevo]    │
│  16 publicados · 2 borradores                                        │
│                                                                     │
│  🔍 Buscar por título, autor o categoría...                         │
├─────────────────┬────────────┬────────┬──────┬────────┬───────┬────┤
│ Curso           │ Categoría  │ Autor  │ €    │ Estado │ Lecc. │ 👥 │
├─────────────────┼────────────┼────────┼──────┼────────┼───────┼────┤
│ Diseño UX       │ Diseño     │ Laura  │ 97   │ ●pub   │  24   │ 87 │
│ Lettering       │ Tipografía │ Laura  │ 79   │ ●pub   │  18   │ 54 │
│ Acuarela básica │ Pintura    │ Laura  │ 49   │ ○borr  │   6   │  0 │
└─────────────────┴────────────┴────────┴──────┴────────┴───────┴────┘
```

**Acciones por fila:**
- **Ojo (👁)**: Abre la página pública del curso en una pestaña nueva.
- **Lápiz (✏)**: Abre el editor del curso (`AdminCursoEditor`).

**Estado:**
- `●` naranja — Publicado y visible en el catálogo.
- `○` gris — Borrador, no visible para los alumnos.

**Búsqueda:** filtra en tiempo real por `title`, `author` o `category` sin llamada adicional a la API.

---

### 6.1 Crear un nuevo curso

1. Pulsar **+ Nuevo** en la esquina superior derecha.
2. Se abre el editor con la pestaña **Información** en blanco.
3. Completar los campos obligatorios (Título, Slug, Categoría, Instructor). El slug se genera automáticamente a partir del título; se puede editar manualmente.
4. Pulsar **Guardar borrador** → el curso se crea con `status = 'draft'` (invisible en el catálogo).
5. Pasar a la pestaña **Contenido** para añadir secciones y lecciones (el borrador se guarda automáticamente si aún no existe).

### 6.2 Editor de curso (`AdminCursoEditor`)

El editor tiene dos pestañas:

#### Pestaña Información

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| Título | Sí | |
| Slug (URL) | Sí | Solo minúsculas, números y guiones; debe ser único |
| Subtítulo | No | Línea de descripción corta |
| Descripción | No | Texto largo visible en la página de detalle |
| Categoría | Sí | Combobox con categorías existentes + opción de crear nueva |
| Instructor | Sí | Combobox con instructores existentes + opción de crear nuevo |
| Precio (€) | Sí | Número positivo |
| Duración | No | Texto libre (ej. "8h 30min") |
| Imagen del curso (URL) | No | URL externa de la imagen de portada |
| Paleta de color | Sí | warm / cream / sun / ink |

**Botones de acción:**
- **Guardar borrador**: guarda los cambios; en creación, registra el curso como `draft`.
- **Publicar curso**: cambia `status` a `'published'` (con confirmación). El curso aparece en el catálogo.
- **Despublicar**: revierte a `draft` (con confirmación). Los alumnos ya matriculados mantienen su acceso.

#### Pestaña Contenido

Gestión de secciones y lecciones del curso:

```
Sección 1 — Fundamentos         [2 lecciones]   [✏] [🗑]
  ▸ 1. Bienvenida               8 min            [✏] [🗑]
  ▸ 2. Qué es una marca         14 min           [✏] [🗑]
  [+ Añadir lección]

Sección 2 — Sistema visual      [1 lección]     [✏] [🗑]
  ▸ 1. Construcción del logo    28 min   [Libre] [✏] [🗑]
  [+ Añadir lección]

[+ Añadir sección]
```

**Secciones:**
- Renombrar inline con el lápiz (Enter guarda, Esc cancela).
- Eliminar con confirmación (se eliminan también todas las lecciones de esa sección en cascada).
- Expandir/contraer pulsando en el nombre o la flecha.

**Lecciones:**
- Crear o editar desde un **dialog modal** con campos: Título, URL de vídeo, Notas/Contenido, Duración (minutos), switch Vista previa gratuita.
- Eliminar con confirmación.
- Al crear/eliminar lecciones, se actualiza automáticamente `courses.lessons_count`.

---

## 7. Alumnos

Gestión completa de matrículas. Cada alumno se gestiona desde un **modal centralizado**.

### 7.1 Lista de alumnos

```
┌─────────────────────────────────────────┐
│  Alumnos                     🔍 Buscar  │
├────────┬──────────────┬────────┬────────┤
│ Avatar │ Nombre       │ Email  │ Cursos │
├────────┼──────────────┼────────┼────────┤
│ [AB]   │ Ana Blanco   │ ana@.. │   3  › │
│ [MC]   │ María Conde  │ mco@.. │   1  › │
│ [PR]   │ Pedro Ruiz   │ per@.. │   0  › │
└────────┴──────────────┴────────┴────────┘
```

Al hacer clic en cualquier fila, se abre el **modal de alumno**.

### 7.2 Modal de alumno

```
┌──────────────────────────────────────────────────────┐
│  [AB]  Ana Blanco                              [✕]   │
│        ana@ejemplo.com                               │
│        Registrada el 12 abr '26 · 3 matrículas       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Matrículas                                          │
│  ──────────────────────────────────────────────────  │
│  ● Diseño UX         manual  12 abr '26              │
│      [Revocar acceso]                                │
│                                                      │
│  ● Lettering         purchase 20 abr '26             │
│      [Revocar acceso]                                │
│                                                      │
│  ✗ Ilustración       manual  1 mar '26  (revocado)   │
│      [Restaurar acceso]                              │
│                                                      │
│  ──────────────────────────────────────────────────  │
│  Dar acceso a un curso:                              │
│  [Seleccionar curso...          ▾]  [Dar acceso]     │
└──────────────────────────────────────────────────────┘
```

**Matrículas activas** (revoked_at IS NULL):
- Fuente: `purchase` (vía Stripe) o `manual` (asignado desde admin).
- Botón **Revocar acceso**: activa doble confirmación inline antes de ejecutar. Una vez revocado, el alumno pierde el acceso inmediatamente.

**Matrículas revocadas** (revoked_at IS NOT NULL):
- Se muestran con estado `revocado` y botón **Restaurar acceso** (pone `revoked_at = null`).

**Dar acceso manual:**
1. Seleccionar un curso del `Select` (lista todos los cursos publicados en los que el alumno no está matriculado).
2. Pulsar **Dar acceso** → inserta en `enrollments` con `source = 'manual'`.

> Al dar acceso o revocar, se envía automáticamente un email al alumno vía la Edge Function `send-email` (plantillas `course_access` / `access_revoked`).

---

## 8. Ventas

Vista completa del historial de pagos procesados por Stripe.

### 8.1 Tiles de resumen

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Ingresos totales │ Este mes         │ Mes anterior     │
│                  │                  │                  │
│   €8.450,00      │  €1.230,00       │  €1.100,00       │
│   87 ventas      │  12 ventas       │  período cerrado │
│                  │  ↑ +12%          │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

El badge **↑/↓ %** compara el mes actual con el anterior. Solo aparece si `prev_month_revenue_cents > 0`.

### 8.2 Tabla de transacciones

Muestra las **últimas 20 transacciones** ordenadas por fecha descendente.

```
┌───────────────┬───────────────────┬────────┬─────────────┬────────────┬──┐
│ Alumno        │ Curso             │ €      │ Fecha       │ Estado     │  │
├───────────────┼───────────────────┼────────┼─────────────┼────────────┼──┤
│ Ana Blanco    │ Diseño UX         │ €97,00 │ 12 may '26  │ ● Cobrado  │↗ │
│ ana@...       │                   │        │             │            │  │
│ Pedro Ruiz    │ Lettering         │ €79,00 │ 10 may '26  │ ● Cobrado  │↗ │
│ María Conde   │ Ilustración       │ €79,00 │  5 may '26  │ ↩ Reemb.  │↗ │
└───────────────┴───────────────────┴────────┴─────────────┴────────────┴──┘
```

**Estados posibles:**
| Badge | Color | Descripción |
|-------|-------|-------------|
| Cobrado | Verde | `status = 'succeeded'` — pago confirmado |
| Reembolsado | Ámbar | `status = 'refunded'` — devuelto al alumno |
| Otros | Rojo | Cualquier otro estado (fallido, etc.) |

**Icono ↗**: abre el pago directamente en el **Dashboard de Stripe** (`https://dashboard.stripe.com/payments/<stripe_session_id>`).

---

## 9. Funciones SQL de soporte

Todas las funciones son `SECURITY DEFINER` y verifican internamente `has_role(admin)` antes de ejecutarse. Solo son accesibles para el rol `authenticated` (nunca `anon`).

| Función RPC | Sección que la usa | Descripción |
|-------------|-------------------|-------------|
| `admin_get_course_stats()` | Cursos, Dashboard | Cursos con matrículas activas |
| `admin_get_payment_stats()` | Dashboard, Ventas | Total histórico, mes actual, mes anterior |
| `admin_get_recent_payments(_limit)` | Dashboard, Ventas, Notificaciones | Últimas N transacciones con nombre del alumno y curso |
| `admin_get_course_completion_stats()` | Dashboard | Tasa de finalización por curso publicado |
| `admin_get_revenue_by_course()` | Dashboard | Ingresos desglosados por curso |
| `admin_get_qa_stats()` | Dashboard, Notificaciones | Total preguntas, respondidas, sin responder |
| `admin_get_monthly_revenue()` | Métricas | Ingresos por mes (12 meses, zero-filled) |
| `admin_get_monthly_enrollments()` | Métricas | Matrículas nuevas por mes (12 meses, zero-filled) |
| `admin_get_progress_distribution()` | Métricas | Distribución por buckets de progreso (0 / 1–25 / ... / 100%) |
| `admin_get_at_risk_students(_days)` | Métricas, Notificaciones | Alumnos sin actividad desde hace N días |

### Caché de React Query

Las queries de panel admin usan `staleTime: 5 * 60 * 1000` (5 minutos). Las queries de Dashboard y Ventas comparten la misma `queryKey` (`["admin-payment-stats"]`, `["admin-recent-payments"]`), por lo que los datos se reutilizan entre secciones sin llamadas duplicadas.

---

## 10. Notas para QA

### Credenciales de acceso
1. Crear usuario en `/registro` (se asigna `student` automáticamente).
2. En Supabase Studio → `user_roles` → insertar `{ user_id, role: 'admin' }`.
3. Hacer login → navegar a `/admin`.

### Verificar que el badge de notificaciones funciona
- Insertar una pregunta en `lesson_questions` sin respuesta en `lesson_answers` → el badge debe mostrar `1`.
- Crear una matrícula con `granted_at` hace más de 30 días sin ningún `lesson_progress` → aparecerá en "Alumnos en riesgo".
- Completar un pago de prueba con Stripe (tarjeta `4242 4242 4242 4242`) → aparecerá en "Ventas · últimas 24 h".

### Revocar y restaurar acceso
1. Ir a Alumnos → abrir modal de un alumno con matrícula activa.
2. Pulsar "Revocar acceso" → confirmar en el segundo botón de confirmación.
3. El alumno ya no puede acceder al reproductor de ese curso.
4. Pulsar "Restaurar acceso" → `revoked_at` vuelve a `null`.

### Gráficos de Métricas sin datos
- Si no hay pagos, los gráficos muestran barras en cero (no error, gracias a `generate_series`).
- Si no hay matrículas, la distribución de progreso muestra el estado vacío "Sin matrículas activas".
- La tabla "Alumnos en riesgo" muestra estado vacío con icono si todos los alumnos tienen actividad.

### Limitaciones conocidas
| Área | Limitación |
|------|-----------|
| Reordenar secciones/lecciones | No hay drag-and-drop; el orden se cambia editando el campo `position` directamente en la BD |
| Ajustes | Sección bloqueada — roadmap |
| Exportación de datos | No implementada |
| Paginación de alumnos | Sin paginación — puede ser lento con >1.000 alumnos |
