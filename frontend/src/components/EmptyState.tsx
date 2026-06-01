export function EmptyState({ titulo, descricao, acao }: { titulo: string; descricao: string; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-4">
        <circle cx="60" cy="60" r="56" fill="oklch(0.94 0.04 165)" />
        <path d="M40 70c0-11 9-20 20-20s20 9 20 20" stroke="oklch(0.46 0.09 165)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="55" r="3" fill="oklch(0.46 0.09 165)" />
        <circle cx="70" cy="55" r="3" fill="oklch(0.46 0.09 165)" />
      </svg>
      <h3 className="font-serif text-xl font-semibold">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}