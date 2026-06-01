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
  // Some endpoints may return empty body
  return res.status === 204 ? ({} as any) : res.json();
}

function delay<T>(v: T, ms = 350): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function mapTarefaFromBackend(t: any): Tarefa {
  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao || "",
    horario: t.data_hora_execucao || t.horario || new Date().toISOString(),
    responsavelId: t.responsavel_id || t.responsavelId || (t.responsavel && t.responsavel.id) || "",
    responsavelNome: (t.responsavel && t.responsavel.nome) || t.responsavel_nome || "",
    status: (t.status || "pendente").toString().toUpperCase(),
    e_critica: !!t.e_critica,
    antecedencia_minutos: t.antecedencia_min || t.antecedencia_minutos || 15,
    historico: (t.historico || []).map((h: any) => ({
      id: h.id,
      tipo: h.acao === 'criacao' ? 'CRIADA' : (h.acao === 'conclusao' ? 'CONCLUIDA' : (h.acao === 'cancelamento' ? 'CANCELADA' : 'EDITADA')),
      autor: (h.usuario && h.usuario.nome) || h.usuario_nome || 'Sistema',
      data: h.realizado_em || h.data || new Date().toISOString(),
    })),
  };
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

    const resp = await http<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, senha: _senha }) });

    // Backend may return only { token }
    if (!resp.usuario) {
      const payload = decodeJwtPayload(resp.token);
      const emailFromToken = payload?.email ?? email;
      const nomeGuess = emailFromToken.split("@")[0].replace(/\./g, " ").replace(/^\w/, (c: string) => c.toUpperCase());
      return {
        token: resp.token,
        usuario: { id: payload?.userId ?? "", nome: nomeGuess, email: emailFromToken },
        grupoId: null,
        grupoNome: null,
        idosoNome: null,
        papel: null,
      } as any;
    }

    return resp;
  },

  async registrar(nome: string, email: string, senha: string) {
    if (MOCK) return delay({ token: "mock", usuario: { id: "u1", nome, email }, grupoId: "g1", grupoNome: "Família " + nome.split(" ")[0], idosoNome: "Seu Antônio", papel: "ADMIN" as const });

    const resp = await http<any>("/auth/register", { method: "POST", body: JSON.stringify({ nome, email, senha }) });
    if (!resp.usuario) {
      const payload = decodeJwtPayload(resp.token);
      const emailFromToken = payload?.email ?? email;
      return {
        token: resp.token,
        usuario: { id: payload?.userId ?? "", nome: nome || emailFromToken.split("@")[0], email: emailFromToken },
        grupoId: null,
        grupoNome: null,
        idosoNome: null,
        papel: null,
      } as any;
    }
    return resp;
  },

  async listarTarefas(grupoId: string): Promise<Tarefa[]> {
    if (MOCK) return delay(tarefasState);
    const res = await http<any[]>(`/grupos/${grupoId}/tarefas`);
    return (res || []).map(mapTarefaFromBackend);
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

    // Map frontend payload to backend fields
    const body = {
      idoso_id: t['idosoId'] ?? (t as any).idoso_id,
      responsavel_id: t.responsavelId,
      titulo: t.titulo,
      descricao: t.descricao,
      data_hora_execucao: t.horario,
      e_critica: t.e_critica,
      antecedencia_min: t.antecedencia_minutos,
    };

    const resp = await http<any>(`/grupos/${grupoId}/tarefas`, { method: 'POST', body: JSON.stringify(body) });

    // If backend returned tarefaId, fetch full task
    const tarefaId = resp.tarefaId || resp.id;
    if (tarefaId) {
      const full = await http<any>(`/tarefas/${tarefaId}`);
      return mapTarefaFromBackend(full);
    }

    // Fallback: try to map from response
    return mapTarefaFromBackend(resp);
  },

  async editarTarefa(id: string, t: Partial<Tarefa>): Promise<Tarefa> {
    if (MOCK) {
      tarefasState = tarefasState.map((x) => (x.id === id ? { ...x, ...t } : x));
      return delay(tarefasState.find((x) => x.id === id)!);
    }

    const body: any = {};
    if (t.titulo !== undefined) body.titulo = t.titulo;
    if (t.descricao !== undefined) body.descricao = t.descricao;
    if (t.horario !== undefined) body.data_hora_execucao = t.horario;
    if (t.responsavelId !== undefined) body.responsavel_id = t.responsavelId;
    if (t.e_critica !== undefined) body.e_critica = t.e_critica;
    if (t.antecedencia_minutos !== undefined) body.antecedencia_min = t.antecedencia_minutos;

    await http(`/tarefas/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    const full = await http<any>(`/tarefas/${id}`);
    return mapTarefaFromBackend(full);
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

    const lower = status.toLowerCase();
    await http(`/tarefas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: lower }) });
    const full = await http<any>(`/tarefas/${id}`);
    return mapTarefaFromBackend(full);
  },

  async listarMembros(grupoId: string): Promise<Membro[]> {
    if (MOCK) return delay(membrosState);
    // Backend doesn't expose /grupos/:grupoId/membros; use obterGrupo and extract membros
    const g = await http<any>(`/grupos/${grupoId}`);
    return (g.membros || []).map((m: any) => ({ id: m.id, nome: m.nome, email: m.email, papel: m.papel === 'administrador' ? 'ADMIN' : 'CUIDADOR' }));
  },

  async criarConvite(grupoId: string, email: string): Promise<{ token: string; link: string }> {
    if (MOCK) {
      const token = Math.random().toString(36).slice(2, 10);
      return delay({ token, link: `${window.location.origin}/convite/${token}` });
    }
    // backend expects email_convidado
    const resp = await http<any>(`/grupos/${grupoId}/convites`, { method: 'POST', body: JSON.stringify({ email_convidado: email }) });
    return { token: resp.token, link: `${window.location.origin}/convite/${resp.token}` };
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
    try {
      return await http(`/convites/${token}`);
    } catch (e: any) {
      // If backend doesn't expose GET /convites/:token, show expired/fallback
      return { grupoNome: "", idosoNome: "", expirado: true };
    }
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