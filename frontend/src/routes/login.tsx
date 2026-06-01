import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShieldCheck, Bell, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { FamilyHero } from "@/components/FamilyHero";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { setSessao, token } = useApp();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (token) router.navigate({ to: "/dashboard" });
  }, [token, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = modo === "login" ? await api.login(email, senha) : await api.registrar(nome, email, senha);
      setSessao(res as any);
      toast.success(`Bem-vinda, ${res.usuario.nome.split(" ")[0]}!`);
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sage-soft/50 p-12 lg:flex">
        <Logo />
        <div
          className={`flex flex-col items-center gap-6 transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <FamilyHero />
          <div className="max-w-md text-center">
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground">
              Cuidar juntos é mais fácil
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Organize remédios, rotinas e visitas da família — tudo num lugar tranquilo, feito com carinho.
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          <Bullet icon={<Heart size={16} />} text="Toda a família na mesma página" />
          <Bullet icon={<Bell size={16} />} text="Lembretes que nunca deixam passar" />
          <Bullet icon={<ShieldCheck size={16} />} text="Histórico transparente de cada cuidado" />
        </ul>
      </aside>

      <section className="flex items-center justify-center bg-background p-6 lg:p-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold tracking-tight">
              {modo === "login" ? "Bem-vinda de volta" : "Crie sua conta"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modo === "login"
                ? "Acesse o cuidado compartilhado da sua família."
                : "Comece a organizar o cuidado em minutos."}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {modo === "registro" && (
                <Field label="Nome">
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="vl-input"
                    placeholder="Ana Ribeiro"
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vl-input"
                  placeholder="ana@familia.com"
                />
              </Field>
              <Field label="Senha">
                <input
                  required
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="vl-input"
                  placeholder="********"
                />
              </Field>

              <button
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sage to-[oklch(0.55_0.12_165)] py-3.5 font-semibold text-sage-foreground shadow-sm transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                {modo === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {modo === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button
                onClick={() => setModo(modo === "login" ? "registro" : "login")}
                className="font-semibold text-sage hover:underline"
              >
                {modo === "login" ? "Criar agora" : "Entrar"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Tem um convite?{" "}
            <Link to="/convite/$token" params={{ token: "exemplo" }} className="underline">
              abrir página de convite
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-sage text-sage-foreground">
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </li>
  );
}