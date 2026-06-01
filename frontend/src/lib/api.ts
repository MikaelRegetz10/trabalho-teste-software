import { useApp } from "./store";
import { mockMembros, mockTarefas, type Tarefa, type Membro } from "./mock";

const BASE = (import.meta as any).env?.VITE_API_URL ?? "";
const MOCK = !BASE;

// in-memory mutable store for mock mode
let tarefasState: Tarefa[] = [...mockTarefas];
let membrosState: Membro[] = [...mockMembros];

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useApp.getState().token;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) {
    useApp.getState().logout();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Sessão expirada");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erro inesperado");
  }
  return res.json();
}

function delay<T>(v: T, ms = 350): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const api = {
  async login(email: string, _senha: string) {
    if (MOCK) {
      const nome = email.split("@")[0].replace(/\./g, " ").replace(/^\w/, (c) => c.toUpperCase());
      return delay({
        token: "mock-token-" + Date.now(),
        usuario: { id: "u1", nome: nome || "Ana Ribeiro", email },
        grupoId: "g1",
        grupoNome: "Família Ribeiro",
        idosoNome: "Seu Antônio",
        papel: "ADMIN" as const,
      });
    }
    return http<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, senha: _senha }) });
  },
  async registrar(nome: string, email: string, senha: string) {
    if (MOCK) return delay({ token: "mock", usuario: { id: "u1", nome, email }, grupoId: "g1", grupoNome: "Família " + nome.split(" ")[0], idosoNome: "Seu Antônio", papel: "ADMIN" as const });
    return http<any>("/auth/registrar", { method: "POST", body: JSON.stringify({ nome, email, senha }) });
  },
  async listarTarefas(grupoId: string): Promise<Tarefa[]> {
    if (MOCK) return delay(tarefasState);
    return http(`/grupos/${grupoId}/tarefas`);
  },
  async criarTarefa(grupoId: string, t: Partial<Tarefa>): Promise<Tarefa> {
    if (MOCK) {
      const resp = membrosState.find((m) => m.id === t.responsavelId) ?? membrosState[0];
      const nova: Tarefa = {
        id: "t" + Date.now(),
        titulo: t.titulo ?? "Nova tarefa",
        descricao: t.descricao ?? "",
        horario: t.horario ?? new Date().toISOString(),
        responsavelId: resp.id,
        responsavelNome: resp.nome,
        status: "PENDENTE",
        e_critica: t.e_critica ?? false,
        antecedencia_minutos: t.antecedencia_minutos ?? 15,
        historico: [{ id: "h" + Date.now(), tipo: "CRIADA", autor: useApp.getState().usuario?.nome ?? "Você", data: new Date().toISOString() }],
      };
      tarefasState = [nova, ...tarefasState];
      return delay(nova);
    }
    return http(`/grupos/${grupoId}/tarefas`, { method: "POST", body: JSON.stringify(t) });
  },
  async editarTarefa(id: string, t: Partial<Tarefa>): Promise<Tarefa> {
    if (MOCK) {
      tarefasState = tarefasState.map((x) => (x.id === id ? { ...x, ...t } : x));
      return delay(tarefasState.find((x) => x.id === id)!);
    }
    return http(`/tarefas/${id}`, { method: "PUT", body: JSON.stringify(t) });
  },
  async mudarStatus(id: string, status: "CONCLUIDA" | "CANCELADA"): Promise<Tarefa> {
    if (MOCK) {
      tarefasState = tarefasState.map((x) =>
        x.id === id
          ? {
              ...x,
              status,
              historico: [
                ...x.historico,
                {
                  id: "h" + Date.now(),
                  tipo: status,
                  autor: useApp.getState().usuario?.nome ?? "Você",
                  data: new Date().toISOString(),
                },
              ],
            }
          : x,
      );
      return delay(tarefasState.find((x) => x.id === id)!);
    }
    return http(`/tarefas/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  },
  async listarMembros(grupoId: string): Promise<Membro[]> {
    if (MOCK) return delay(membrosState);
    return http(`/grupos/${grupoId}/membros`);
  },
  async criarConvite(grupoId: string, email: string): Promise<{ token: string; link: string }> {
    if (MOCK) {
      const token = Math.random().toString(36).slice(2, 10);
      return delay({ token, link: `${window.location.origin}/convite/${token}` });
    }
    return http(`/grupos/${grupoId}/convites`, { method: "POST", body: JSON.stringify({ email }) });
  },
  async removerMembro(grupoId: string, membroId: string): Promise<void> {
    if (MOCK) {
      membrosState = membrosState.filter((m) => m.id !== membroId);
      return delay(undefined as any);
    }
    return http(`/grupos/${grupoId}/membros/${membroId}`, { method: "DELETE" });
  },
  async verConvite(token: string): Promise<{ grupoNome: string; idosoNome: string; expirado: boolean }> {
    if (MOCK) return delay({ grupoNome: "Família Ribeiro", idosoNome: "Seu Antônio", expirado: token === "expirado" });
    return http(`/convites/${token}`);
  },
  async aceitarConvite(token: string) {
    if (MOCK) return delay({ ok: true });
    return http(`/convites/${token}/aceitar`, { method: "POST" });
  },
  async recusarConvite(token: string) {
    if (MOCK) return delay({ ok: true });
    return http(`/convites/${token}/recusar`, { method: "POST" });
  },
};