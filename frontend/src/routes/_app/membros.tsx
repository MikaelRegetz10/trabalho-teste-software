import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Trash2, Plus, Copy, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/_app/membros")({
  component: MembrosPage,
});

function MembrosPage() {
  const { grupoId, papel, usuario } = useApp();
  const qc = useQueryClient();
  const { data: membros, isLoading } = useQuery({
    queryKey: ["membros", grupoId],
    queryFn: () => api.listarMembros(grupoId!),
    enabled: !!grupoId,
  });

  const [convidarOpen, setConvidarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removerId, setRemoverId] = useState<string | null>(null);

  const criarConvite = useMutation({
    mutationFn: () => api.criarConvite(grupoId!, email),
    onSuccess: (res) => {
      setLink(res.link);
      toast.success("Convite criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: (id: string) => api.removerMembro(grupoId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["membros"] });
      toast.success("Membro removido");
      setRemoverId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Sua rede de cuidado</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">A família</h1>
        </div>
        <button
          onClick={() => {
            setConvidarOpen(true);
            setLink(null);
            setEmail("");
          }}
          className="flex items-center gap-2 rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-sage-foreground shadow-sm hover:opacity-95"
        >
          <Plus size={16} /> Convidar familiar
        </button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {membros?.map((m) => (
            <div key={m.id} className="group relative rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar nome={m.nome} size={52} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{m.nome}</h3>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.papel === "ADMIN"
                        ? "bg-[oklch(0.92_0.06_300)] text-[oklch(0.35_0.1_300)]"
                        : "bg-sage-soft text-sage"
                    }`}
                  >
                    {m.papel === "ADMIN" ? "Administrador" : "Cuidador"}
                  </span>
                </div>
              </div>
              {papel === "ADMIN" && m.id !== usuario?.id && (
                <button
                  onClick={() => setRemoverId(m.id)}
                  className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Remover"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {convidarOpen && (
        <Modal onClose={() => setConvidarOpen(false)}>
          <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-sage-soft text-sage">
            <Mail size={20} />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold">Convidar familiar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vamos gerar um link para você compartilhar com quem cuida junto.
          </p>

          {!link ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                criarConvite.mutate();
              }}
              className="mt-5 space-y-3"
            >
              <input
                required
                type="email"
                placeholder="email@familia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              />
              <button
                disabled={criarConvite.isPending}
                className="w-full rounded-2xl bg-sage py-3 font-semibold text-sage-foreground shadow-sm disabled:opacity-50"
              >
                Gerar convite
              </button>
            </form>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3">
                <code className="flex-1 truncate text-xs">{link}</code>
                <button
                  onClick={copyLink}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    copied ? "bg-success text-success-foreground" : "bg-sage text-sage-foreground"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <button
                onClick={() => setConvidarOpen(false)}
                className="w-full rounded-2xl border border-border py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Fechar
              </button>
            </div>
          )}
        </Modal>
      )}

      {removerId && (
        <Modal onClose={() => setRemoverId(null)}>
          <h2 className="font-serif text-2xl font-semibold">Remover este membro?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A pessoa perderá acesso ao grupo. Você pode convidar de novo a qualquer momento.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setRemoverId(null)}
              className="rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
            >
              Voltar
            </button>
            <button
              disabled={remover.isPending}
              onClick={() => remover.mutate(removerId)}
              className="rounded-xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground"
            >
              Remover
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}