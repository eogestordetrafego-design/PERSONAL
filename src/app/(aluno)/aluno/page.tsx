import { createClient } from "@/lib/supabase/server";
import { hora, saudacao } from "@/lib/format";
import TreinoDoDia from "./TreinoDoDia";
import SairButton from "./SairButton";
import PushToggle from "@/components/PushToggle";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AlunoHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, objetivo")
    .eq("user_id", user!.id)
    .single();

  const hoje = new Date();
  const ini = new Date(hoje); ini.setHours(0, 0, 0, 0);
  const fim = new Date(hoje); fim.setHours(23, 59, 59, 999);

  const [{ data: vinculo }, { data: sessaoHoje }, { data: ultimoLog }] = await Promise.all([
    supabase
      .from("aluno_treinos")
      .select("treinos(id, nome, categoria, duracao_min, observacoes, exercicios(id, nome, series, reps, carga_kg, ordem, video_url))")
      .eq("aluno_id", aluno!.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessoes")
      .select("inicio, status")
      .eq("aluno_id", aluno!.id)
      .gte("inicio", ini.toISOString())
      .lte("inicio", fim.toISOString())
      .neq("status", "cancelada")
      .order("inicio")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("treino_logs")
      .select("data")
      .eq("aluno_id", aluno!.id)
      .order("data", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const treino = vinculo?.treinos ?? null;
  const primeiroNome = (aluno?.nome ?? "").split(" ")[0];
  const jaTreinouHoje = ultimoLog && new Date(ultimoLog.data).toDateString() === hoje.toDateString();

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black">
            {saudacao()}, {primeiroNome} 💪
          </h1>
          {aluno?.objetivo && <p className="text-txt2 text-xs mt-0.5">Objetivo: {aluno.objetivo}</p>}
        </div>
        <SairButton />
      </header>

      {sessaoHoje && (
        <div className="rounded-card p-4 bg-accent text-bg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase opacity-70">Sessão hoje</p>
            <p className="font-black">com seu treinador</p>
          </div>
          <p className="text-2xl font-black">{hora(sessaoHoje.inicio)}</p>
        </div>
      )}

      <Card className="flex items-center justify-between !py-3">
        <p className="text-sm font-bold">🔔 Lembretes de treino</p>
        <PushToggle alunoId={aluno!.id} />
      </Card>

      {jaTreinouHoje && (
        <Card className="border-accent/40">
          <p className="text-sm font-bold text-accent text-center">Treino de hoje concluído ✓ Bom descanso!</p>
        </Card>
      )}

      {treino ? (
        <TreinoDoDia
          alunoId={aluno!.id}
          concluidoHoje={!!jaTreinouHoje}
          treino={{
            id: treino.id,
            nome: treino.nome,
            duracao_min: treino.duracao_min,
            observacoes: treino.observacoes,
            exercicios: [...(treino.exercicios ?? [])]
              .sort((a, b) => a.ordem - b.ordem)
              .map((e) => ({
                id: e.id,
                nome: e.nome,
                series: e.series,
                reps: e.reps,
                carga_kg: Number(e.carga_kg),
                video_url: e.video_url,
              })),
          }}
        />
      ) : (
        <Card>
          <p className="text-txt2 text-sm text-center py-4">
            Seu treinador ainda não atribuiu um treino. Fale com ele pelo chat! 💬
          </p>
        </Card>
      )}
    </div>
  );
}
