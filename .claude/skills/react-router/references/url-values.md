# URL Values in React Router

React Router provides three essential hooks for accessing URL data: `useParams`, `useSearchParams`, and `useLocation`.

## useParams

Extracts dynamic route segments defined with `:paramName` syntax.

```tsx
import { useParams } from "react-router";

// Route definition: <Route path="curso/:cursoId" element={<Curso />} />
function Curso() {
  const { cursoId } = useParams(); // string | undefined
  return <h1>Curso {cursoId}</h1>;
}
```

### Multiple Params

```tsx
// Route: <Route path="curso/:cursoId/leccion/:leccionId" element={<Leccion />} />
function Leccion() {
  const { cursoId, leccionId } = useParams();
  return <div>Curso {cursoId} — Lección {leccionId}</div>;
}
```

### Type Safety

Params are always `string | undefined`. Always validate before use:

```tsx
function Curso() {
  const { cursoId } = useParams();

  // ✅ Check existence first
  if (!cursoId) {
    return <div>ID de curso no encontrado</div>;
  }

  // ✅ Parse numbers safely
  const id = parseInt(cursoId, 10);
  if (isNaN(id)) {
    return <div>ID inválido</div>;
  }

  return <CursoDetalle id={id} />;
}
```

---

## useSearchParams

Manages query strings (`?key=value`) with both reading and updating capabilities.

```tsx
import { useSearchParams } from "react-router";

function CursosCatalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q");       // string | null
  const page = searchParams.get("page");     // string | null
  const categoria = searchParams.get("cat"); // string | null

  return (
    <div>
      <input
        value={query ?? ""}
        onChange={(e) => {
          // ✅ Preserve existing params when updating
          setSearchParams((prev) => {
            prev.set("q", e.target.value);
            prev.set("page", "1"); // Reset page on new search
            return prev;
          });
        }}
        placeholder="Buscar cursos..."
      />
      <p>Resultados para: {query}</p>
    </div>
  );
}
```

### Reading Multiple Values

```tsx
function CursosPage() {
  const [searchParams] = useSearchParams();

  // Read individual values
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const categoria = searchParams.get("cat");

  // Read all values of a key (e.g., ?tag=react&tag=typescript)
  const tags = searchParams.getAll("tag");

  // Check if param exists
  const hasPromo = searchParams.has("promo");
}
```

### Updating Search Params

```tsx
const [searchParams, setSearchParams] = useSearchParams();

// ❌ Overwrites all params — loses pagination, filters, etc.
setSearchParams({ q: "nuevo" });

// ✅ Preserve existing params
setSearchParams((prev) => {
  prev.set("q", "nuevo");
  return prev;
});

// ✅ Remove a param
setSearchParams((prev) => {
  prev.delete("page");
  return prev;
});
```

### Accessibility Note

When navigation changes the URL via `setSearchParams`, the page content updates but focus stays where it is. For screen reader users, ensure meaningful page titles or ARIA live regions announce content changes.

---

## useLocation

Provides access to the complete location object.

```tsx
import { useLocation } from "react-router";

function CurrentPage() {
  const location = useLocation();

  console.log(location.pathname); // "/cursos"
  console.log(location.search);   // "?q=react&page=2"
  console.log(location.hash);     // "#section-1"
  console.log(location.state);    // State passed via navigate()
  console.log(location.key);      // Unique key for this history entry
}
```

### Track Page Views on Route Change

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router";

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track analytics on every route change
    analytics.page(location.pathname);
  }, [location]);
}
```

### Read Navigation State

```tsx
// When navigating with state:
// navigate("/login", { state: { from: "/alumno" } })

function LoginPage() {
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  return <p>Inicia sesión para continuar a {from}</p>;
}
```

---

## Using All Three Together

```tsx
import { useParams, useSearchParams, useLocation } from "react-router";

function CursoLecciones() {
  const { cursoId } = useParams();           // /curso/:cursoId
  const [searchParams] = useSearchParams();  // ?modulo=2
  const location = useLocation();            // Full location object

  const moduloActual = searchParams.get("modulo") ?? "1";

  return (
    <div>
      <h1>Curso {cursoId}</h1>
      <p>Módulo {moduloActual}</p>
      <p>Ruta completa: {location.pathname}{location.search}</p>
    </div>
  );
}
```

## Summary

| Hook | Returns | Use For |
|------|---------|---------|
| `useParams` | `Record<string, string \| undefined>` | Dynamic route segments (`:id`) |
| `useSearchParams` | `[URLSearchParams, setter]` | Query strings (`?key=value`) |
| `useLocation` | Location object | Full URL, hash, navigation state |
