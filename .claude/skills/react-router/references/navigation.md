# Navigation in React Router

React Router offers three primary mechanisms for client-side navigation.

## Link Component

The standard way to navigate between routes. Handles client-side transitions without page reloads.

```tsx
import { Link } from "react-router";

function Nav() {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/cursos">Cursos</Link>
      <Link to="/alumno">Mi Panel</Link>
    </nav>
  );
}
```

### Link Props

```tsx
{/* Replace current history entry instead of pushing */}
<Link to="/login" replace>Login</Link>

{/* Pass state to the next route */}
<Link to="/curso/123" state={{ from: "catalog" }}>Ver Curso</Link>

{/* Relative navigation */}
<Link to="../settings" relative="path">Settings</Link>
```

## NavLink Component

An enhanced version of `<Link>` that automatically applies an `active` class when its route matches. Essential for navigation menus.

```tsx
import { NavLink } from "react-router";

function Nav() {
  return (
    <nav>
      <NavLink
        to="/"
        end
        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      >
        Inicio
      </NavLink>

      <NavLink
        to="/cursos"
        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      >
        Cursos
      </NavLink>

      <NavLink
        to="/alumno"
        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      >
        Mi Panel
      </NavLink>
    </nav>
  );
}
```

### The `end` Prop

Without `end`, `/` would match as active for all routes since every path starts with `/`:

```tsx
{/* Without end: active on /, /cursos, /alumno, etc. */}
<NavLink to="/">Inicio</NavLink>

{/* With end: only active on exact / match */}
<NavLink to="/" end>Inicio</NavLink>
```

### Inline style with NavLink

```tsx
<NavLink
  to="/cursos"
  style={({ isActive }) => ({
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "var(--primary)" : "inherit",
  })}
>
  Cursos
</NavLink>
```

### Children as function

```tsx
<NavLink to="/alumno">
  {({ isActive }) => (
    <span className={isActive ? "text-primary" : ""}>
      Mi Panel
    </span>
  )}
</NavLink>
```

## useNavigate Hook

For programmatic navigation triggered by logic rather than direct user clicks.

```tsx
import { useNavigate } from "react-router";

function LoginForm() {
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await login(credentials);
    if (success) {
      navigate("/alumno"); // Navigate after successful login
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Navigate Options

```tsx
const navigate = useNavigate();

// Basic navigation
navigate("/cursos");

// Replace current history entry (no back button)
navigate("/login", { replace: true });

// Pass state
navigate("/curso/123", { state: { from: "search" } });

// Go back/forward in history
navigate(-1); // Go back
navigate(1);  // Go forward
```

## Key Distinctions

| Mechanism | Best For |
|-----------|---------|
| `<Link>` | Standard page-to-page navigation |
| `<NavLink>` | Navigation menus requiring active state styling |
| `useNavigate` | Conditional redirects, post-form-submit, auth flows |

## Anti-Patterns to Avoid

```tsx
// ❌ Native anchor tag — causes full page reload
<a href="/cursos">Cursos</a>

// ❌ window.location — bypasses React Router
window.location.href = "/alumno";

// ✅ Use Link for user-initiated navigation
<Link to="/cursos">Cursos</Link>

// ✅ Use useNavigate for programmatic navigation
navigate("/alumno");
```

> **Why it matters:** Real anchor elements work with screen readers, keyboard navigation, right-click "open in new tab", and middle-click. Always prefer `<Link>` / `<NavLink>` over `useNavigate` for navigation that users trigger directly.

## Reading Navigation State

Access state passed during navigation with `useLocation`:

```tsx
import { useLocation } from "react-router";

function LoginPage() {
  const location = useLocation();
  const from = location.state?.from ?? "/alumno";

  async function handleLogin() {
    await login();
    navigate(from, { replace: true }); // Return to original destination
  }
}
```
