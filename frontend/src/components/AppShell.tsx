import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { useApp } from "@/lib/store";
import { useEffect } from "react";

export function AppShell() {
  const { usuario, grupoNome, idosoNome, logout, token } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.navigate({ to: "/login" });
  }, [token, router]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard">
              <Logo />
            </Link>
            <div className="hidden items-center gap-2 rounded-full bg-sage-soft/60 px-3 py-1 md:flex">
              <span className="size-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-foreground">
                {grupoNome} · cuidando de <strong>{idosoNome}</strong>
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />}>
              Hoje
            </NavLink>
            <NavLink to="/membros" icon={<Users size={16} />}>
              Família
            </NavLink>
            <div className="mx-2 h-6 w-px bg-border" />
            <button
              onClick={() => {
                logout();
                router.navigate({ to: "/login" });
              }}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut size={16} />
            </button>
            <Avatar nome={usuario.nome} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-sage-soft text-sage-foreground hover:bg-sage-soft" }}
    >
      {icon}
      {children}
    </Link>
  );
}