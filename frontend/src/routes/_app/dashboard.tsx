import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ListChecks, AlertCircle, Flame } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { TaskCard } from "@/components/TaskCard";
import { TaskDrawer } from "@/components/TaskDrawer";
import { TaskDetail } from "@/components/TaskDetail";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeleton";
import { periodoDe, type Tarefa } from "@/lib/mock";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const PERIODOS = [
  { id: "MANHA", label: "Manhã", hint: "até o meio-dia" },
  { id: "TARDE", label: "Tarde", hint: "12h às 18h" },
  { id: "NOITE", label: "Noite", hint: "após 18h" },
] as const;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const { usuario, grupoId } = useApp();
  const { data: tarefas, isLoading } = useQuery({
    queryKey: ["tarefas", grupoId],
    queryFn: () => api.listarTarefas(grupoId!),
    enabled: !!grupoId,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [detail, setDetail] = useState<Tarefa | null>(null);

  const stats = useMemo(() => {
    if (!tarefas) return { total: 0, pendentes: 0, criticas: 0 };
    return {
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === "PENDENTE").length,
      criticas: tarefas.filter((t) => t.status === "PENDENTE" && t.e_critica).length,
    };
  }, [tarefas]);

  const porPeriodo = useMemo(() => {
    const g: Record<string, Tarefa[]> = { MANHA: [], TARDE: [], NOITE: [] };
    (tarefas ?? []).forEach((t) => g[periodoDe(t.horario)].push(t));
    Object.values(g).forEach((arr) => arr.sort((a, b) => a.horario.localeCompare(b.horario)));
    return g;
  }, [tarefas]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">
            {saudacao()}, {usuario?.nome.split(" ")[0]} <span aria-hidden>👋</span>
          </h1>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tarefas hoje" value={stats.total} icon={<ListChecks size={18} />} tone="neutral" />
        <StatCard label="Pendentes" value={stats.pendentes} icon={<AlertCircle size={18} />} tone="sage" />
        <StatCard label="Críticas" value={stats.criticas} icon={<Flame size={18} />} tone="warning" />
      </section>

      <section className="space-y-8">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : stats.total === 0 ? (
          <EmptyState
            titulo="Nenhuma tarefa para hoje"
            descricao="Que tal começar agendando o próximo cuidado? Pequenos gestos fazem grande diferença."
            acao={
              <button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
                className="rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-sage-foreground"
              >
                + Nova tarefa
              </button>
            }
          />
        ) : (
          PERIODOS.map((p) => {
            const list = porPeriodo[p.id];
            if (list.length === 0) return null;
            return (
              <div key={p.id}>
                <div className="mb-3 flex items-baseline gap-3">
                  <h2 className="font-serif text-2xl font-semibold">{p.label}</h2>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{p.hint}</span>
                </div>
                <div className="space-y-3">
                  {list.map((t) => (
                    <TaskCard key={t.id} t={t} onClick={() => setDetail(t)} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <button
        onClick={() => {
          setEditing(null);
          setDrawerOpen(true);
        }}
        className="fixed bottom-8 right-8 z-20 flex items-center gap-2 rounded-full bg-gradient-to-br from-sage to-[oklch(0.55_0.12_165)] px-6 py-4 font-semibold text-sage-foreground shadow-lg transition hover:scale-105"
      >
        <Plus size={20} />
        Nova tarefa
      </button>

      <TaskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tarefa={editing} />

      {detail && (
        <TaskDetail
          tarefa={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setEditing(detail);
            setDetail(null);
            setDrawerOpen(true);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "neutral" | "sage" | "warning";
}) {
  const toneCls =
    tone === "warning"
      ? "bg-warning-soft text-warning"
      : tone === "sage"
        ? "bg-sage-soft text-sage"
        : "bg-muted text-muted-foreground";
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={`flex size-9 items-center justify-center rounded-xl ${toneCls}`}>{icon}</span>
      </div>
      <div className="mt-3 font-serif text-4xl font-semibold tabular-nums tracking-tight">{value}</div>
    </div>
  );
}