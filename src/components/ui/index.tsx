import { iniciais } from "@/lib/format";

const sizes = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-xs",
  lg: "w-14 h-14 text-base",
  xl: "w-24 h-24 text-3xl",
};

export function Avatar({
  nome,
  cor,
  size = "md",
  online,
}: {
  nome: string;
  cor: string;
  size?: keyof typeof sizes;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-black`}
        style={{ background: `${cor}26`, color: cor }}
      >
        {iniciais(nome)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent border-2 border-bg pulse-dot" />
      )}
    </div>
  );
}

const badgeVariants: Record<string, string> = {
  verde: "bg-accent/15 text-accent",
  roxo: "bg-accent2/15 text-accent2",
  vermelho: "bg-danger/15 text-danger",
  amarelo: "bg-warn/15 text-warn",
  cinza: "bg-txt2/15 text-txt2",
};

export function Badge({
  variant = "verde",
  children,
}: {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
}) {
  return (
    <span className={`${badgeVariants[variant]} text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-line rounded-card p-4 ${className}`}>{children}</div>
  );
}

export function ProgressBar({ value, cor = "#00D68F" }: { value: number; cor?: string }) {
  return (
    <div className="h-2 rounded-full bg-line overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: cor }}
      />
    </div>
  );
}

export function StatBox({
  valor,
  label,
  delta,
}: {
  valor: string;
  label: string;
  delta?: string;
}) {
  return (
    <div className="bg-card border border-line rounded-card p-4 min-w-[120px]">
      <p className="text-xl font-black">{valor}</p>
      <p className="text-txt2 text-[11px] mt-0.5">{label}</p>
      {delta && <p className="text-accent text-[11px] font-bold mt-1">{delta}</p>}
    </div>
  );
}

export const statusBadge: Record<string, { label: string; variant: keyof typeof badgeVariants }> = {
  realizada: { label: "Realizada ✓", variant: "verde" },
  confirmada: { label: "Confirmada", variant: "verde" },
  agendada: { label: "Agendada", variant: "amarelo" },
  cancelada: { label: "Cancelada", variant: "vermelho" },
  ativo: { label: "Ativo", variant: "verde" },
  inativo: { label: "Inativo", variant: "cinza" },
  novo: { label: "Novo", variant: "roxo" },
};

export const planoLabel: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  premium: "Premium",
  vip: "VIP",
};

export const categoriaInfo: Record<string, { cor: string; icone: string; label: string }> = {
  emagrecimento: { cor: "#FF4D6D", icone: "flame", label: "Emagrecimento" },
  hipertrofia: { cor: "#7B6EF6", icone: "barbell", label: "Hipertrofia" },
  funcional: { cor: "#00D68F", icone: "run", label: "Funcional" },
  reabilitacao: { cor: "#FFB020", icone: "heart", label: "Reabilitação" },
};
