import type { Papel } from "./store";

export type StatusTarefa = "PENDENTE" | "CONCLUIDA" | "CANCELADA";
export type Periodo = "MANHA" | "TARDE" | "NOITE";

export interface Membro {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface EventoHistorico {
  id: string;
  tipo: "CRIADA" | "CONCLUIDA" | "CANCELADA" | "EDITADA";
  autor: string;
  data: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  horario: string; // ISO
  responsavelId: string;
  responsavelNome: string;
  status: StatusTarefa;
  e_critica: boolean;
  antecedencia_minutos: number;
  historico: EventoHistorico[];
}

const hoje = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const mockMembros: Membro[] = [
  { id: "u1", nome: "Ana Ribeiro", email: "ana@familia.com", papel: "ADMIN" },
  { id: "u2", nome: "Carlos Ribeiro", email: "carlos@familia.com", papel: "CUIDADOR" },
  { id: "u3", nome: "Marta Souza", email: "marta@familia.com", papel: "CUIDADOR" },
  { id: "u4", nome: "João Pedro", email: "joao@familia.com", papel: "CUIDADOR" },
];

export const mockTarefas: Tarefa[] = [
  {
    id: "t1",
    titulo: "Remédio da pressão",
    descricao: "Losartana 50mg com um copo d'água.",
    horario: hoje(8, 0),
    responsavelId: "u1",
    responsavelNome: "Ana Ribeiro",
    status: "CONCLUIDA",
    e_critica: true,
    antecedencia_minutos: 15,
    historico: [
      { id: "h1", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 30) },
      { id: "h2", tipo: "CONCLUIDA", autor: "Ana Ribeiro", data: hoje(8, 5) },
    ],
  },
  {
    id: "t2",
    titulo: "Café da manhã",
    descricao: "Mingau de aveia com banana e uma fatia de pão.",
    horario: hoje(8, 30),
    responsavelId: "u3",
    responsavelNome: "Marta Souza",
    status: "CONCLUIDA",
    e_critica: false,
    antecedencia_minutos: 10,
    historico: [{ id: "h3", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 0) }],
  },
  {
    id: "t3",
    titulo: "Caminhada no quintal",
    descricao: "15 minutos de caminhada leve, com apoio do andador.",
    horario: hoje(10, 30),
    responsavelId: "u2",
    responsavelNome: "Carlos Ribeiro",
    status: "PENDENTE",
    e_critica: false,
    antecedencia_minutos: 15,
    historico: [{ id: "h4", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 0) }],
  },
  {
    id: "t4",
    titulo: "Almoço + Metformina",
    descricao: "Almoço leve seguido de Metformina 850mg.",
    horario: hoje(12, 30),
    responsavelId: "u3",
    responsavelNome: "Marta Souza",
    status: "PENDENTE",
    e_critica: true,
    antecedencia_minutos: 30,
    historico: [{ id: "h5", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 0) }],
  },
  {
    id: "t5",
    titulo: "Hidratação da pele",
    descricao: "Aplicar creme hidratante nos braços e pernas.",
    horario: hoje(15, 0),
    responsavelId: "u4",
    responsavelNome: "João Pedro",
    status: "PENDENTE",
    e_critica: false,
    antecedencia_minutos: 10,
    historico: [{ id: "h6", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 0) }],
  },
  {
    id: "t6",
    titulo: "Remédio do sono",
    descricao: "Melatonina 3mg, 30 minutos antes de deitar.",
    horario: hoje(21, 0),
    responsavelId: "u1",
    responsavelNome: "Ana Ribeiro",
    status: "PENDENTE",
    e_critica: true,
    antecedencia_minutos: 20,
    historico: [{ id: "h7", tipo: "CRIADA", autor: "Ana Ribeiro", data: hoje(7, 0) }],
  },
];

export function periodoDe(iso: string): Periodo {
  const h = new Date(iso).getHours();
  if (h < 12) return "MANHA";
  if (h < 18) return "TARDE";
  return "NOITE";
}