import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast({ title: "No pudimos iniciar sesión", description: error, variant: "destructive" });
      return;
    }
    toast({ title: "¡Bienvenido de vuelta!" });
    // Redirect: respect requested route, else send by role (decided in /alumno fallback)
    navigate(from && from !== "/login" ? from : "/alumno", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — visual */}
      <aside className="hidden lg:flex relative bg-ink text-ink-foreground p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 backdrop-blur px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-secondary" /> Acceso a tu panel
          </span>
          <h1 className="mt-6 font-display text-5xl xl:text-6xl font-black leading-[0.92]">
            Vuelve a<br />
            <span className="text-primary">crear</span>,<br />
            <span className="text-secondary italic">justo donde lo dejaste</span>.
          </h1>
          <p className="mt-6 text-ink-foreground/70 max-w-sm">
            Tus cursos, tu progreso y tu comunidad te esperan dentro.
          </p>
        </div>

        <div className="relative text-xs text-ink-foreground/50">
          © 2026 Academia Creativa
        </div>
      </aside>

      {/* RIGHT — form */}
      <main className="flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="lg:hidden mb-10"><Logo /></div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">Inicia sesión</h2>
          <p className="mt-3 text-muted-foreground">¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="text-primary font-bold hover:underline">Crea una</Link>
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-surface border-2 border-border focus:border-ink rounded-2xl px-5 py-4 text-sm transition outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border-2 border-border focus:border-ink rounded-2xl px-5 py-4 text-sm transition outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-6 py-4 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition disabled:opacity-60"
            >
              {submitting ? "Entrando…" : <>Entrar <ArrowUpRight className="w-4 h-4" /></>}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
};

export default Login;
