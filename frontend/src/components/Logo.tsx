import { Heart } from "lucide-react";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-xl bg-sage text-sage-foreground shadow-sm"
        style={{ width: size + 8, height: size + 8 }}
      >
        <Heart size={size - 10} fill="currentColor" strokeWidth={0} />
      </div>
      <span className="font-serif text-xl font-semibold tracking-tight">
        VôLembrar
      </span>
    </div>
  );
}