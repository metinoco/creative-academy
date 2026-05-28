import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Sparkles, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Registro = () => {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Usa al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    if (error) {
      setSubmitting(false);
      toast({ title: "No pudimos crear la cuenta", description: error, variant: "destructive" });
      return;
    }
    // auto-confirm activo => sign in directo
    const res = await signIn(email.trim(), password);
    setSubmitting(false);
    if (res.error) {
      toast({ title: "Cuenta creada. Inicia sesión.", description: res.error, variant: "warning" });
      navigate("/login", { replace: true });
      return;
    }
    toast({ title: `¡Bienvenido, ${fullName.split(" ")[0] || "creador"}!`, description: "Tu cuenta está lista. ¡A aprender!", variant: "success" });
    navigate("/alumno", { replace: true });
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-[hsl(38_62%_93%)] lg:bg-background overflow-hidden">
      {/* Mobile decorative blobs */}
      <div aria-hidden className="lg:hidden absolute -top-24 -right-16 w-96 h-96 rounded-full bg-secondary/25 blur-3xl pointer-events-none" />
      <div aria-hidden className="lg:hidden absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

      <aside className="hidden lg:flex relative bg-secondary text-ink p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-ink/10 blur-3xl" />

        <div className="relative"><Logo /></div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/10 backdrop-blur px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Únete gratis
          </span>
          <h1 className="mt-6 font-display text-5xl xl:text-6xl font-black leading-[0.92]">
            Empieza a<br />
            <span className="text-primary italic">crear hoy</span>.
          </h1>
          <p className="mt-6 text-ink/70 max-w-sm">
            Acceso de por vida a cada curso que compres. Sin suscripciones, sin compromiso.
          </p>
        </div>

        <div className="relative text-xs text-ink/60">© 2026 Academia Creativa</div>
      </aside>

      <main className="flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="lg:hidden mb-10"><Logo /></div>
        <div className="max-w-md w-full mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">Crea tu cuenta</h2>
          <p className="mt-3 text-muted-foreground">¿Ya tienes una?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">Inicia sesión</Link>
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">Nombre completo</label>
              <input
                type="text"
                required
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Carlos Ramírez"
                className="w-full bg-surface border-2 border-border focus:border-ink rounded-2xl px-5 py-4 text-sm transition outline-none"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-surface border-2 border-border focus:border-ink rounded-2xl px-5 py-4 text-sm transition outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-4 text-sm font-bold hover:bg-primary-glow transition disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta…</> : <>Crear cuenta <ArrowUpRight className="w-4 h-4" /></>}
            </button>

            <p className="text-[11px] text-muted-foreground text-center">
              Al continuar aceptas los términos y la política de privacidad.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Registro;
