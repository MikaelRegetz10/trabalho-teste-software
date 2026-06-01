import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/convite/$token")({
  component: ConvitePage,
});

function ConvitePage() {
  const { token } = Route.useParams();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["convite", token],
    queryFn: () => api.verConvite(token),
  });

  const aceitar = useMutation({
    mutationFn: () => api.aceitarConvite(token),
    onSuccess: () => {
      toast.success("Convite aceito! Faça login para continuar.");
      router.navigate({ to: "/login" });
    },
  });
  const recusar = useMutation({
    mutationFn: () => api.recusarConvite(token),
    onSuccess: () => {
      toast("Convite recusado");
      router.navigate({ to: "/login" });
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sage-soft/30 px-6 py-12">
      <div className="mb-8">
        <Logo size={36} />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        {isLoading ? (
          <div className="space-y-3">
            <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : data?.expirado ? (
          <div>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <AlertTriangle size={28} />
            </div>
            <h1 className="font-serif text-2xl font-semibold">Convite expirado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Peça um novo link para o administrador do grupo.
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-sage text-sage-foreground">
              <Heart size={28} fill="currentColor" strokeWidth={0} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sage">
              {data?.grupoNome}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight">
              Você foi convidado a cuidar junto de <span className="text-sage">{data?.idosoNome}</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ao aceitar, você poderá ver e cuidar das tarefas do dia a dia, lado a lado com a família.
            </p>
            <div className="mt-6 space-y-2">
              <button
                disabled={aceitar.isPending}
                onClick={() => aceitar.mutate()}
                className="w-full rounded-2xl bg-gradient-to-br from-sage to-[oklch(0.55_0.12_165)] py-3.5 font-semibold text-sage-foreground shadow-sm disabled:opacity-50"
              >
                Aceitar convite
              </button>
              <button
                disabled={recusar.isPending}
                onClick={() => recusar.mutate()}
                className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Recusar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}