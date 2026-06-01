import { Flame, Clock, Check, X } from "lucide-react";
import { Avatar } from "./Avatar";
import type { Tarefa } from "@/lib/mock";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TaskCard({ t, onClick }: { t: Tarefa; onClick: () => void }) {
  const isDone = t.status === "CONCLUIDA";
  const isCancel = t.status === "CANCELADA";
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-start gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        t.e_critica && !isDone && !isCancel
          ? "border-warning/30 ring-1 ring-warning/20"
          : "border-border/60"
      }`}
    >
      <div
        className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl ${
          isDone
            ? "bg-success/20 text-success-foreground"
            : isCancel
              ? "bg-muted text-muted-foreground"
              : t.e_critica
                ? "bg-warning-soft text-warning"
                : "bg-sage-soft text-sage"
        }`}
      >
        {isDone ? <Check size={18} /> : isCancel ? <X size={18} /> : t.e_critica ? <Flame size={18} /> : <Clock size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`truncate text-base font-semibold ${
              isDone || isCancel ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {t.titulo}
          </h3>
          {t.e_critica && !isDone && !isCancel && (
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
              crítica
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t.descricao}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar nome={t.responsavelNome} size={22} />
            <span className="font-medium text-foreground/80">{t.responsavelNome}</span>
          </div>
          <span className="font-serif text-sm font-semibold tabular-nums text-foreground">
            {format(new Date(t.horario), "HH:mm", { locale: ptBR })}
          </span>
        </div>
      </div>
    </button>
  );
}