# Routing in React Router

React Router uses JSX-based configuration with `<Routes>` and `<Route>` components wrapped in `<BrowserRouter>`. The framework supports nested routes, layout patterns, and dynamic URL segments.

## Key Components

The `<Route>` component accepts several props:
- `path` — URL pattern to match
- `element` — Component to render
- `index` — Default child route (renders in parent's `<Outlet />` when no child path matches)
- `children` — Nested `<Route>` elements

Child routes are nested inside parent routes. Use `<Outlet />` in the parent to render the matched child.

## Basic Route Setup

```tsx
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="users/:userId" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Nested Routes with Outlet

Parent components use `<Outlet />` to render their matched child route:

```tsx
import { Outlet, Link } from "react-router";

function Dashboard() {
  return (
    <div>
      <nav>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet /> {/* Child route renders here */}
      </main>
    </div>
  );
}
```

## Layout Routes (Pathless Routes)

Layout routes wrap child routes without adding a URL segment. Use them to share layout code:

```tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* Auth layout */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="alumno" element={<Alumno />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Benefits of layout routes:
- Share layout code via `<Outlet />`
- Reduce code duplication
- Make it clear which routes are related
- Enable layout-level state persistence

## Dynamic Segments

Use colon syntax (`:paramName`) to define dynamic route segments:

```tsx
<Route path="curso/:cursoId" element={<Curso />} />
<Route path="curso/:cursoId/leccion/:leccionId" element={<Leccion />} />
```

Access params via `useParams()`:

```tsx
import { useParams } from "react-router";

function Curso() {
  const { cursoId } = useParams(); // string | undefined
  return <h1>Curso {cursoId}</h1>;
}
```

## Optional Segments and Splats

```tsx
{/* Optional segment with ? */}
<Route path="usuarios/:id?" element={<Usuario />} />

{/* Catch-all splat */}
<Route path="*" element={<NotFound />} />
```

## Best Practices

- **Avoid flat route structures** when routes share layouts — nest them instead
- **Always add a 404 route** (`path="*"`) at the end
- **Use index routes** instead of matching the parent path directly
- **Keep route definitions close to app root** for maintainability
- For navigation between routes, use the `<Link>` component (never `<a>` tags)
