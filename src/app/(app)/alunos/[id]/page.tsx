import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, Card, ProgressBar, categoriaInfo, planoLabel, statusBadge } from "@/components/ui";
import { brl, hora, idade } from "@/lib/format";
import WeightChart from "./WeightChart";
import {
  IconArrowLeft,
  IconBarbell,
  IconCalendarPlus,
  IconMessage,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AlunoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: aluno }, { data: medidas }, { data: sessoes }, { data: vinculo }] =
    await Promise.all([
      supabase.from("alunos").select("*").eq("id", params.id).single(),
      supabase.from("medidas").select("data, peso_kg, gordura_pct, imc").eq("aluno_id", params.id).order("data"),
      supabase
        .from("sessoes")
        .select("id, inicio, status, treinos(nome)")
        .eq("aluno_id", params.id)
        .order("inicio", { ascending: false })
        .limit(3),
      supabase
        .from("aluno_treinos")
        .select("treinos(id, nome, categoria, exercicios(nome, series, reps, carga_kg, ordem))")
        .eq("aluno_id", params.id)
        .limit(1)
        .maybeSingle(),
    ]);

  if (!aluno) notFound();

  const meds = medidas ?? [];
  const atual = meds.length ? Number(meds[meds.length - 1].peso_kg) : null;
  const inicial = meds.length ? Number(meds[0].peso_kg) : null;
  const evolucao = atual !== null && inicial !== null ? atual - inicial : null;
  const ultimaMed = meds.length ? meds[meds.length - 1] : null;
  const meta = aluno.meta_peso_kg ? Number(aluno.meta_peso_kg) : null;
  const pctMeta =
    meta !== null && atual !== null && inicial !== null && Math.abs(inicial - meta) > 0
      ? Math.round(Math.min(100, (Math.abs(inicial - atual) / Math.abs(inicial - meta)) * 100))
      : null;

  const { count: totalSessoes } = await supabase
    .from("sessoes")
    .select("*", { count: "exact", head: true })
    .eq("aluno_id", params.id)
    .eq("status", "realizada");

  const treino = (vinculo?.treinos as any) ?? null;
  const exercicios = (treino?.exercicios ?? [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .slice(0, 3);
  const st = statusBadge[aluno.status];
  const anos = idade(aluno.data_nascimento);
  const mesesCasa = Math.max(1, Math.round((Date.now() - new Date(aluno.criado_em).getTime()) / 2592e6));

  const metricas = [
    { v: atual !== null ? `${atual.toFixed(1).replace(".", ",")}kg` : "—", l: "Peso atual" },
    { v: ultimaMed?.imc ? String(ultimaMed.imc).replace(".", ",") : "—", l: "IMC" },
    { v: ultimaMed?.gordura_pct ? `${ultimaMed.gordura_pct}%` : "—", l: "% Gordura" },
    { v: String(totalSessoes ?? 0), l: "Sessões" },
    { v: evolucao !== null ? `${evolucao > 0 ? "+" : ""}${evolucao.toFixed(1).replace(".", ",")}kg` : "—", l: "Evolução" },
    { v: brl(Number(aluno.valor_mensalidade)), l: "Mensalidade" },
  ];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/alunos" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
          <IconArrowLeft size={20} />
        </Link>
        <h1 className="font-black">Perfil do aluno</h1>
      </header>

      <div className="flex flex-col items-center text-center">
        <Avatar nome={aluno.nome} cor={aluno.cor_avatar} size="xl" />
        <h2 className="text-xl font-black mt-3">{aluno.nome}</h2>
        <p className="text-txt2 text-xs mt-1">
          {anos ? `${anos} anos` : ""}{anos && aluno.altura_cm ? " · " : ""}
          {aluno.altura_cm ? `${(aluno.altura_cm / 100).toFixed(2).replace(".", ",")}m` : ""}
          {aluno.objetivo ? ` · ${aluno.objetivo}` : ""}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          <Badge variant={st.variant}>{st.label}</Badge>
          <Badge variant="roxo">Plano {planoLabel[aluno.plano]}</Badge>
          <Badge variant="cinza">{mesesCasa} {mesesCasa === 1 ? "mês" : "meses"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {metricas.map((m) => (
          <Card key={m.l} className="text-center !p-3">
            <p className="font-black text-sm">{m.v}</p>
            <p className="text-[10px] text-txt2 mt-0.5">{m.l}</p>
          </Card>
        ))}
      </div>

      {meta !== null && pctMeta !== null && (
        <Card>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Meta: {aluno.objetivo ?? `chegar a ${meta}kg`}</span>
            <span className="text-accent">{pctMeta}%</span>
          </div>
          <ProgressBar value={pctMeta} />
        </Card>
      )}

      {meds.length > 1 && (
        <Card>
          <h3 className="font-black text-sm mb-2">Evolução de peso</h3>
          <WeightChart
            data={meds.map((m) => ({
              data: new Date(m.data).toLocaleDateString("pt-BR", { month: "short" }),
              peso: Number(m.peso_kg),
            }))}
          />
        </Card>
      )}

      {treino && (
        <section>
          <h3 className="font-black text-sm mb-2">Treino atual — {treino.nome}</h3>
          <Card className="space-y-3">
            {exercicios.map((ex: any) => (
              <div key={ex.nome} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${categoriaInfo[treino.categoria]?.cor ?? "#7B6EF6"}26` }}
                >
                  <IconBarbell size={18} style={{ color: categoriaInfo[treino.categoria]?.cor ?? "#7B6EF6" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{ex.nome}</p>
                  <p className="text-[11px] text-txt2">
                    {ex.series}×{ex.reps}{Number(ex.carga_kg) > 0 ? ` · ${ex.carga_kg}kg` : ""}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section>
        <h3 className="font-black text-sm mb-2">Últimas sessões</h3>
        <div className="space-y-2">
          {(sessoes ?? []).map((s) => {
            const sb = statusBadge[s.status];
            return (
              <Card key={s.id} className="flex items-center justify-between !py-3">
                <div>
                  <p className="text-sm font-bold">
                    {new Date(s.inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {hora(s.inicio)}
                  </p>
                  <p className="text-[11px] text-txt2">{(s.treinos as any)?.nome ?? "Treino"}</p>
                </div>
                <Badge variant={sb.variant}>{sb.label}</Badge>
              </Card>
            );
          })}
          {(sessoes ?? []).length === 0 && (
            <Card><p className="text-txt2 text-sm text-center py-3">Nenhuma sessão registrada.</p></Card>
          )}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          className="flex-1 border border-line rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 text-txt2"
          title="Chat disponível na fase 2"
        >
          <IconMessage size={18} /> Mensagem
        </button>
        <Link
          href="/agenda"
          className="flex-1 bg-accent text-bg rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150"
        >
          <IconCalendarPlus size={18} /> Agendar
        </Link>
      </div>
    </div>
  );
}
