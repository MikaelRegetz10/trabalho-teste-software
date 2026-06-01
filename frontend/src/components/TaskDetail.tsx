import { X, Check, Loader2, Plus, CircleSlash, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Tarefa } from "@/lib/mock";
import { Avatar } from "./Avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPO_LABEL: Record<string, string> = {
  CRIADA: "criou a tarefa",
  CONCLUIDA: "marcou como concluída",
  CANCELADA: "cancelou a tarefa",
  EDITADA: "editou a tarefa",
};

export function TaskDetail({
  tarefa,
  onClose,
  onEdit,
}: {
  tarefa: Tarefa;
  onClose: () => void;
  onEdit: () => void;
}) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<null | "CONCLUIDA" | "CANCELADA">(null);

  const m = useMutation({
    mutationFn: (status: "CONCLUIDA" | "CANCELADA") => api.mudarStatus(tarefa.id, status),
    onSuccess: (_d, status) => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success(status === "CONCLUIDA" ? "Tarefa concluída 🎉" : "Tarefa cancelada");
      setConfirm(null);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const headerCls =
    tarefa.status === "CONCLUIDA"
      ? "bg-success/30"
      : tarefa.status === "CANCELADA"
        ? "bg-muted"
        : tarefa.e_critica
          ? "bg-warning-soft"
          : "bg-sage-soft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div className={`relative px-6 py-8 ${headerCls}`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-background/60 p-2 text-foreground/70 hover:bg-background"
          >
            <X size={16} />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
            {format(new Date(tarefa.horario), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">{tarefa.titulo}</h2>
          <p className="mt-2 text-sm text-foreground/70">{tarefa.descricao}</p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar nome={tarefa.responsavelNome} size={28} />
            <span className="text-sm font-medium">{tarefa.responsavelNome}</span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {tarefa.status === "PENDENTE" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirm("CONCLUIDA")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-sage py-3 font-semibold text-sage-foreground shadow-sm transition hover:opacity-95"
              >
                <Check size={18} /> Concluir
              </button>
              <button
                onClick={() => setConfirm("CANCELADA")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 font-semibold text-muted-foreground transition hover:bg-muted"
              >
                <CircleSlash size={18} /> Cancelar
              </button>
            </div>
          )}

          <button
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-sage hover:text-sage"
          >
            <Pencil size={14} /> Editar tarefa
          </button>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Histórico
            </h3>
            <ol className="relative space-y-4 border-l-2 border-border pl-5">
              {tarefa.historico.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[27px] flex size-5 items-center justify-center rounded-full bg-sage-soft text-sage ring-4 ring-card">
                    {h.tipo === "CONCLUIDA" ? <Check size={11} /> : h.tipo === "CANCELADA" ? <X size={11} /> : <Plus size={11} />}
                  </span>
                  <p className="text-sm">
                    <strong className="font-semibold">{h.autor}</strong>{" "}
                    <span className="text-muted-foreground">{TIPO_LABEL[h.tipo]}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(h.data), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {confirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="font-serif text-xl font-semibold">
              {confirm === "CONCLUIDA" ? "Confirmar conclusão?" : "Cancelar tarefa?"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {confirm === "CONCLUIDA"
                ? "A família verá que essa tarefa foi cumprida."
                : "Essa tarefa não será mais notificada."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
              >
                Voltar
              </button>
              <button
                disabled={m.isPending}
                onClick={() => m.mutate(confirm)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold ${
                  confirm === "CONCLUIDA"
                    ? "bg-sage text-sage-foreground"
                    : "bg-foreground text-background"
                }`}
              >
                {m.isPending && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}