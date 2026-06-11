export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export const brlFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const dataLonga = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

export const idade = (nascimento: string | null) => {
  if (!nascimento) return null;
  const n = new Date(nascimento);
  const hoje = new Date();
  let a = hoje.getFullYear() - n.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), n.getMonth(), n.getDate())) a--;
  return a;
};

export const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};
