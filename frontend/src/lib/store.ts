import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Papel = "ADMIN" | "CUIDADOR";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

interface AppState {
  usuario: Usuario | null;
  token: string | null;
  grupoId: string | null;
  grupoNome: string | null;
  idosoNome: string | null;
  papel: Papel;
  setSessao: (s: Partial<AppState>) => void;
  logout: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      grupoId: null,
      grupoNome: null,
      idosoNome: null,
      papel: "ADMIN",
      setSessao: (s) => set(s),
      logout: () =>
        set({
          usuario: null,
          token: null,
          grupoId: null,
          grupoNome: null,
          idosoNome: null,
        }),
    }),
    { name: "volembrar-app" },
  ),
);