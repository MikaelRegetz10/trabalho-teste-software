const PALETA = [
  "bg-[oklch(0.78_0.09_165)] text-[oklch(0.3_0.06_165)]",
  "bg-[oklch(0.85_0.08_55)] text-[oklch(0.35_0.1_55)]",
  "bg-[oklch(0.82_0.08_320)] text-[oklch(0.32_0.08_320)]",
  "bg-[oklch(0.82_0.08_240)] text-[oklch(0.32_0.08_240)]",
  "bg-[oklch(0.85_0.08_25)] text-[oklch(0.35_0.1_25)]",
  "bg-[oklch(0.82_0.08_140)] text-[oklch(0.32_0.08_140)]",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ nome, size = 36 }: { nome: string; size?: number }) {
  const ini = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls = PALETA[hash(nome) % PALETA.length];
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {ini}
    </div>
  );
}