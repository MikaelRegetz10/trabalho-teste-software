import { useEffect, useState } from "react";
import { X, Flame, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { mockMembros } from "@/lib/mock";
import type { Tarefa } from "@/lib/mock";
import { Avatar } from "./Avatar";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskDrawer({
  open,
  onClose,
  tarefa,
}: {
  open: boolean;
  onClose: () => void;
  tarefa?: Tarefa | null;
}) {
  const grupoId = useApp((s) => s.grupoId)!;
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [horario, setHorario] = useState(toLocalInput(new Date().toISOString()));
  const [responsavelId, setResponsavelId] = useState(mockMembros[0].id);
  const [antecedencia, setAntecedencia] = useState(15);
  const [critica, setCritica] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(tarefa?.titulo ?? "");
      setDescricao(tarefa?.descricao ?? "");
      setHorario(toLocalInput(tarefa?.horario ?? new Date().toISOString()));
      setResponsavelId(tarefa?.responsavelId ?? mockMembros[0].id);
      setAntecedencia(tarefa?.antecedencia_minutos ?? 15);
      setCritica(tarefa?.e_critica ?? false);
    }
  }, [open, tarefa]);

  const m = useMutation({
    mutationFn: async () => {
      const payload = {
        titulo,
        descricao,
        horario: new Date(horario).toISOString(),
        responsavelId,
        antecedencia_minutos: antecedencia,
        e_critica: critica,
      };
      if (tarefa) return api.editarTarefa(tarefa.id, payload);
      return api.criarTarefa(grupoId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success(tarefa ? "Tarefa atualizada" : "Tarefa criada");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {tarefa ? "Editar" : "Nova"}
            </p>
            <h2 className="font-serif text-2xl font-semibold">Tarefa de cuidado</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Remédio da pressão"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-medium outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Detalhes que ajudem quem vai cuidar"
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quando
            </label>
            <input
              type="datetime-local"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Responsável
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {mockMembros.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setResponsavelId(m.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                    responsavelId === m.id
                      ? "border-sage bg-sage-soft/60"
                      : "border-border bg-background hover:border-sage/40"
                  }`}
                >
                  <Avatar nome={m.nome} size={28} />
                  <span className="truncate text-sm font-medium">{m.nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lembrete com antecedência
              </label>
              <span className="font-serif text-sm font-semibold">{antecedencia} min</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={antecedencia}
              onChange={(e) => setAntecedencia(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--sage)]"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <Flame size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Tarefa crítica</span>
                <span
                  className={`relative h-6 w-11 rounded-full transition ${
                    critica ? "bg-sage" : "bg-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={critica}
                    onChange={(e) => setCritica(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                      critica ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Tarefas críticas continuam notificando até serem confirmadas.
              </p>
            </div>
          </label>
        </div>

        <footer className="border-t border-border bg-card px-6 py-4">
          <button
            disabled={!titulo || m.isPending}
            onClick={() => m.mutate()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sage to-[oklch(0.55_0.12_165)] py-3.5 font-semibold text-sage-foreground shadow-sm transition hover:opacity-95 disabled:opacity-50"
          >
            {m.isPending && <Loader2 className="animate-spin" size={16} />}
            Salvar tarefa
          </button>
        </footer>
      </aside>
    </div>
  );
}