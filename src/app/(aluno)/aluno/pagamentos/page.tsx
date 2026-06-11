import { createClient } from "@/lib/supabase/server";
import { Badge, Card } from "@/components/ui";
import { brlFull } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PagamentosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, plano, valor_mensalidade")
    .eq("user_id", user!.id)
    .single();

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("id, valor, vencimento, pago_em, metodo, status")
    .eq("aluno_id", aluno!.id)
    .order("vencimento", { ascending: false });

  const pendentes = (pagamentos ?? []).filter((p) => p.status !== "pago");
  const pagos = (pagamentos ?? []).filter((p) => p.status === "pago");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black">Pagamentos</h1>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-txt2 uppercase font-bold">Mensalidade</p>
          <p className="font-black text-lg">{brlFull(Number(aluno?.valor_mensalidade ?? 0))}</p>
        </div>
        <Badge variant="roxo">Plano {aluno?.plano}</Badge>
      </Card>

      {pendentes.length > 0 && (
        <section>
          <h2 className="font-black text-sm mb-2">Em aberto</h2>
          <div className="space-y-2">
            {pendentes.map((p) => (
              <Card key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{brlFull(Number(p.valor))}</p>
                  <p className="text-[11px] text-txt2">
                    Vence {new Date(p.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge variant={p.status === "atrasado" ? "vermelho" : "amarelo"}>
                  {p.status === "atrasado" ? "Em atraso" : "Pendente"}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-black text-sm mb-2">Histórico</h2>
        <div className="space-y-2">
          {pagos.map((p) => (
            <Card key={p.id} className="flex items-center justify-between !py-3">
              <div>
                <p className="text-sm font-bold">{brlFull(Number(p.valor))}</p>
                <p className="text-[11px] text-txt2">
                  {p.pago_em && `Pago em ${new Date(p.pago_em + "T12:00:00").toLocaleDateString("pt-BR")}`}
                  {p.metodo && ` · ${p.metodo}`}
                </p>
              </div>
              <Badge variant="verde">Pago ✓</Badge>
            </Card>
          ))}
          {pagos.length === 0 && (
            <Card><p className="text-txt2 text-sm text-center py-3">Nenhum pagamento registrado ainda.</p></Card>
          )}
        </div>
      </section>
    </div>
  );
}
