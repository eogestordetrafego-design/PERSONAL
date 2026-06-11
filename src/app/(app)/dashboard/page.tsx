import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, Card, ProgressBar, StatBox, statusBadge } from "@/components/ui";
import { brl, dataLonga, hora, saudacao } from "@/lib/format";
import { IconAlertTriangle, IconBell } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date();
  const ini = new Date(hoje); ini.setHours(0, 0, 0, 0);
  const fim = new Date(hoje); fim.setHours(23, 59, 59, 999);

  const mesAtualIni = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
  const mesAnteriorIni = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().slice(0, 10);

  const [{ data: profile }, { data: sessoes }, { data: ativos }, { count: naoLidas }, { data: pagos }, { data: ultimasSessoes }] =
    await Promise.all([
      supabase.from("profiles").select("nome").eq("id", user!.id).single(),
      supabase
        .from("sessoes")
        .select("id, inicio, status, alunos(nome, cor_avatar), treinos(nome, categoria)")
        .gte("inicio", ini.toISOString())
        .lte("inicio", fim.toISOString())
        .order("inicio"),
      supabase.from("alunos").select("id, nome, cor_avatar, meta_peso_kg, objetivo, valor_mensalidade, status").eq("status", "ativo"),
      supabase.from("mensagens").select("*", { count: "exact", head: true }).eq("lida", false).eq("autor", "aluno"),
      supabase.from("pagamentos").select("valor, pago_em").eq("status", "pago").gte("pago_em", mesAnteriorIni),
      supabase
        .from("sessoes")
        .select("aluno_id, inicio")
        .neq("status", "cancelada")
        .lte("inicio", new Date().toISOString())
        .order("inicio", { ascending: false })
        .limit(300),
    ]);

  // receita real: pagamentos pagos no mês vs mês anterior
  const recebidoMes = (pagos ?? [])
    .filter((p) => p.pago_em && p.pago_em >= mesAtualIni)
    .reduce((s, p) => s + Number(p.valor), 0);
  const recebidoAnterior = (pagos ?? [])
    .filter((p) => p.pago_em && p.pago_em < mesAtualIni)
    .reduce((s, p) => s + Number(p.valor), 0);
  const deltaPct = recebidoAnterior > 0 ? Math.round(((recebidoMes - recebidoAnterior) / recebidoAnterior) * 100) : null;
  const receita = recebidoMes;

  // retenção: alunos ativos sem sessão há 7+ dias
  const ultimaPorAluno = new Map<string, string>();
  (ultimasSessoes ?? []).forEach((s) => {
    if (!ultimaPorAluno.has(s.aluno_id)) ultimaPorAluno.set(s.aluno_id, s.inicio);
  });
  const emRisco = (ativos ?? [])
    .map((a) => {
      const ultima = ultimaPorAluno.get(a.id);
      const dias = ultima
        ? Math.floor((Date.now() - new Date(ultima).getTime()) / 864e5)
        : null;
      return { ...a, dias };
    })
    .filter((a) => a.dias === null || a.dias >= 7)
    .sort((x, y) => (y.dias ?? 999) - (x.dias ?? 999))
    .slice(0, 3);
  const primeiroNome = (profile?.nome ?? "Coach").split(" ")[0];
  const proxima = (sessoes ?? []).find(
    (s) => new Date(s.inicio) > new Date() && s.status !== "cancelada"
  );

  // progresso: alunos com meta + medidas
  const comMeta = (ativos ?? []).filter((a) => a.meta_peso_kg).slice(0, 3);
  const progresso = await Promise.all(
    comMeta.map(async (a) => {
      const { data: med } = await supabase
        .from("medidas")
        .select("peso_kg")
        .eq("aluno_id", a.id)
        .order("data");
      if (!med || med.length < 1) return { ...a, pct: 0 };
      const inicial = Number(med[0].peso_kg);
      const atual = Number(med[med.length - 1].peso_kg);
      const meta = Number(a.meta_peso_kg);
      const total = Math.abs(inicial - meta) || 1;
      const feito = Math.abs(inicial - atual);
      return { ...a, pct: Math.round(Math.min(100, (feito / total) * 100)) };
    })
  );

  const cores = ["#00D68F", "#7B6EF6", "#FFB020"];
  const sess = sessoes ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black">
            {saudacao()}, {primeiroNome} 👋
          </h1>
          <p className="text-txt2 text-xs capitalize mt-0.5">{dataLonga(hoje)}</p>
        </div>
        <Link href="/chat" className="relative w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
          <IconBell size={20} className="text-txt2" />
          {(naoLidas ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-danger text-[9px] font-black flex items-center justify-center">
              {naoLidas}
            </span>
          )}
        </Link>
      </header>

      <div className="flex gap-3 overflow-x-auto -mx-4 px-4">
        <StatBox valor={String(sess.length)} label="Aulas hoje" />
        <StatBox valor={String((ativos ?? []).length)} label="Alunos ativos" />
        <StatBox
          valor={brl(receita)}
          label={`Recebido em ${hoje.toLocaleDateString("pt-BR", { month: "long" })}`}
          delta={deltaPct !== null ? `${deltaPct > 0 ? "+" : ""}${deltaPct}% vs mês anterior` : undefined}
        />
      </div>

      {proxima && (
        <div className="rounded-card p-4 bg-accent text-bg">
          <p className="text-[11px] font-bold uppercase opacity-70">Próxima sessão</p>
          <div className="flex items-center gap-3 mt-2">
            <Avatar nome={proxima.alunos?.nome ?? "?"} cor="#09090F" size="lg" />
            <div className="flex-1">
              <p className="font-black text-base">{proxima.alunos?.nome}</p>
              <p className="text-xs font-bold opacity-70">{proxima.treinos?.nome ?? "Treino"}</p>
            </div>
            <p className="text-2xl font-black">{hora(proxima.inicio)}</p>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-black text-sm mb-3">Sessões de hoje</h2>
        {sess.length === 0 && (
          <Card><p className="text-txt2 text-sm text-center py-4">Nenhuma sessão hoje 🎉</p></Card>
        )}
        <div className="space-y-2.5">
          {sess.map((s) => {
            const st = statusBadge[s.status];
            return (
              <Card key={s.id} className="flex items-center gap-3">
                <div className="bg-accent/10 text-accent rounded-xl px-2.5 py-2 text-xs font-black">
                  {hora(s.inicio)}
                </div>
                <Avatar nome={s.alunos?.nome ?? "?"} cor={s.alunos?.cor_avatar ?? "#00D68F"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{s.alunos?.nome}</p>
                  <p className="text-[11px] text-txt2 truncate">{s.treinos?.nome ?? "Treino"}</p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </Card>
            );
          })}
        </div>
      </section>

      {emRisco.length > 0 && (
        <section>
          <h2 className="font-black text-sm mb-3 flex items-center gap-1.5">
            <IconAlertTriangle size={16} className="text-warn" /> Risco de desistência
          </h2>
          <Card className="space-y-3 border-warn/30">
            {emRisco.map((a) => (
              <Link key={a.id} href={`/chat/${a.id}`} className="flex items-center gap-3">
                <Avatar nome={a.nome} cor={a.cor_avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{a.nome}</p>
                  <p className="text-[11px] text-warn">
                    {a.dias === null ? "Nenhuma sessão registrada" : `Sem treinar há ${a.dias} dias`}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-accent">Mandar mensagem →</span>
              </Link>
            ))}
          </Card>
        </section>
      )}

      <section>
        <h2 className="font-black text-sm mb-3">Progresso dos alunos</h2>
        <Card className="space-y-4">
          {progresso.length === 0 && (
            <p className="text-txt2 text-sm text-center py-2">Cadastre metas de peso para acompanhar.</p>
          )}
          {progresso.map((a, i) => (
            <Link key={a.id} href={`/alunos/${a.id}`} className="block">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Avatar nome={a.nome} cor={a.cor_avatar} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{a.nome}</p>
                    <p className="text-[11px] text-txt2">{a.objetivo}</p>
                  </div>
                </div>
                <span className="text-sm font-black" style={{ color: cores[i % 3] }}>
                  {a.pct}%
                </span>
              </div>
              <ProgressBar value={a.pct} cor={cores[i % 3]} />
            </Link>
          ))}
        </Card>
      </section>
    </div>
  );
}
