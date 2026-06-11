import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, Card } from "@/components/ui";
import { brlFull } from "@/lib/format";
import FinanceiroAcoes from "./FinanceiroAcoes";
import GerarCobrancas from "./GerarCobrancas";
import { linkWhatsApp, msgCobranca } from "@/lib/whatsapp";
import { IconArrowLeft, IconBrandWhatsapp } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default async function FinanceiroPage() {
  const supabase = createClient();
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const [{ data: pagos }, { data: pendentes }, { count: ativos }] = await Promise.all([
    supabase
      .from("pagamentos")
      .select("id, valor, pago_em, metodo, alunos(nome, cor_avatar, plano)")
      .eq("status", "pago")
      .gte("pago_em", `${ano}-01-01`)
      .order("pago_em", { ascending: false }),
    supabase
      .from("pagamentos")
      .select("id, valor, vencimento, status, alunos(nome, cor_avatar, telefone)")
      .in("status", ["pendente", "atrasado"])
      .order("vencimento"),
    supabase.from("alunos").select("*", { count: "exact", head: true }).eq("status", "ativo"),
  ]);

  // receita por mês (Jan..mês atual)
  const porMes = Array.from({ length: mes + 1 }, (_, i) =>
    (pagos ?? [])
      .filter((p) => p.pago_em && new Date(p.pago_em + "T12:00:00").getMonth() === i)
      .reduce((s, p) => s + Number(p.valor), 0)
  );
  const recebidoMes = porMes[mes] ?? 0;
  const anterior = porMes[mes - 1] ?? 0;
  const delta = anterior > 0 ? Math.round(((recebidoMes - anterior) / anterior) * 100) : 0;
  const pendenteTotal = (pendentes ?? []).reduce((s, p) => s + Number(p.valor), 0);
  const max = Math.max(...porMes, 1);

  const recentes = (pagos ?? []).slice(0, 4);
  const hojeStr = hoje.toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/mais" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="font-black">Financeiro</h1>
        </div>
        <GerarCobrancas />
      </header>

      <div className="rounded-card p-5 bg-accent text-bg">
        <p className="text-[11px] font-bold uppercase opacity-70">
          Receita — {MESES[mes]} {ano}
        </p>
        <div className="flex items-end gap-2 mt-1">
          <p className="text-3xl font-black">{brlFull(recebidoMes)}</p>
          {delta !== 0 && (
            <span className="text-xs font-black mb-1.5">{delta > 0 ? "+" : ""}{delta}%</span>
          )}
        </div>
        <div className="flex gap-4 mt-4 text-xs font-bold">
          <span>Recebido {brlFull(recebidoMes)}</span>
          <span className="opacity-70">Pendente {brlFull(pendenteTotal)}</span>
          <span className="opacity-70">Alunos {ativos ?? 0}</span>
        </div>
      </div>

      <Card>
        <h2 className="font-black text-sm mb-4">Receita por mês</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {porMes.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-t-lg ${i === mes ? "bg-accent" : "bg-accent/25"}`}
                style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
              />
              <span className="text-[10px] text-txt2 font-bold">{MESES[i]}</span>
              <span className="text-[9px] text-txt2">{v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}k` : v}</span>
            </div>
          ))}
        </div>
      </Card>

      <section>
        <h2 className="font-black text-sm mb-2">Cobranças pendentes ({(pendentes ?? []).length})</h2>
        <div className="space-y-2">
          {(pendentes ?? []).map((p) => {
            const venc = p.vencimento;
            const atrasado = p.status === "atrasado";
            const hojeVence = venc === hojeStr;
            return (
              <Card key={p.id} className="flex items-center gap-3">
                <Avatar nome={p.alunos?.nome ?? "?"} cor={p.alunos?.cor_avatar ?? "#8888A0"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.alunos?.nome}</p>
                  <p className="text-[11px] text-txt2">
                    Vence {new Date(venc + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {brlFull(Number(p.valor))}
                  </p>
                </div>
                {atrasado ? (
                  <Badge variant="vermelho">Atraso!</Badge>
                ) : hojeVence ? (
                  <Badge variant="amarelo">Vence hoje</Badge>
                ) : (
                  <Badge variant="cinza">Pendente</Badge>
                )}
                {p.alunos?.telefone && (
                  <a
                    href={linkWhatsApp(
                      p.alunos.telefone,
                      msgCobranca(
                        p.alunos.nome,
                        brlFull(Number(p.valor)),
                        new Date(venc + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                      )
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Cobrar pelo WhatsApp"
                    className="w-8 h-8 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center active:scale-90 transition-all duration-150"
                  >
                    <IconBrandWhatsapp size={16} />
                  </a>
                )}
                <FinanceiroAcoes id={p.id} />
              </Card>
            );
          })}
          {(pendentes ?? []).length === 0 && (
            <Card><p className="text-txt2 text-sm text-center py-3">Nenhuma cobrança pendente 🎉</p></Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-black text-sm mb-2">Recebidos recentemente</h2>
        <div className="space-y-2">
          {recentes.map((p) => (
            <Card key={p.id} className="flex items-center gap-3">
              <Avatar nome={p.alunos?.nome ?? "?"} cor={p.alunos?.cor_avatar ?? "#00D68F"} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{p.alunos?.nome}</p>
                <p className="text-[11px] text-txt2">
                  {p.pago_em && new Date(p.pago_em + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {p.metodo ?? "—"}
                </p>
              </div>
              <span className="text-accent font-black text-sm">{brlFull(Number(p.valor))}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
