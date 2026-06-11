import { createClient } from "@/lib/supabase/server";
import { Card, ProgressBar } from "@/components/ui";
import WeightChart from "@/app/(app)/alunos/[id]/WeightChart";

export const dynamic = "force-dynamic";

export default async function EvolucaoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, objetivo, meta_peso_kg, altura_cm")
    .eq("user_id", user!.id)
    .single();

  const [{ data: medidas }, { count: treinosFeitos }] = await Promise.all([
    supabase
      .from("medidas")
      .select("data, peso_kg, gordura_pct, imc")
      .eq("aluno_id", aluno!.id)
      .order("data"),
    supabase
      .from("treino_logs")
      .select("*", { count: "exact", head: true })
      .eq("aluno_id", aluno!.id),
  ]);

  const meds = medidas ?? [];
  const atual = meds.length ? Number(meds[meds.length - 1].peso_kg) : null;
  const inicial = meds.length ? Number(meds[0].peso_kg) : null;
  const evolucao = atual !== null && inicial !== null ? atual - inicial : null;
  const ultima = meds.length ? meds[meds.length - 1] : null;
  const meta = aluno?.meta_peso_kg ? Number(aluno.meta_peso_kg) : null;
  const pctMeta =
    meta !== null && atual !== null && inicial !== null && Math.abs(inicial - meta) > 0
      ? Math.round(Math.min(100, (Math.abs(inicial - atual) / Math.abs(inicial - meta)) * 100))
      : null;

  const metricas = [
    { v: atual !== null ? `${atual.toFixed(1).replace(".", ",")}kg` : "—", l: "Peso atual" },
    { v: evolucao !== null ? `${evolucao > 0 ? "+" : ""}${evolucao.toFixed(1).replace(".", ",")}kg` : "—", l: "Evolução" },
    { v: ultima?.imc ? String(ultima.imc).replace(".", ",") : "—", l: "IMC" },
    { v: ultima?.gordura_pct ? `${ultima.gordura_pct}%` : "—", l: "% Gordura" },
    { v: String(treinosFeitos ?? 0), l: "Treinos feitos" },
    { v: meta !== null ? `${meta}kg` : "—", l: "Meta" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black">Minha evolução</h1>

      {pctMeta !== null && (
        <Card>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>{aluno?.objetivo ?? "Minha meta"}</span>
            <span className="text-accent">{pctMeta}%</span>
          </div>
          <ProgressBar value={pctMeta} />
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {metricas.map((m) => (
          <Card key={m.l} className="text-center !p-3">
            <p className="font-black text-sm">{m.v}</p>
            <p className="text-[10px] text-txt2 mt-0.5">{m.l}</p>
          </Card>
        ))}
      </div>

      {meds.length > 1 ? (
        <Card>
          <h3 className="font-black text-sm mb-2">Peso ao longo do tempo</h3>
          <WeightChart
            data={meds.map((m) => ({
              data: new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" }),
              peso: Number(m.peso_kg),
            }))}
          />
        </Card>
      ) : (
        <Card>
          <p className="text-txt2 text-sm text-center py-4">
            Seu treinador registra suas medidas nas avaliações — em breve seu gráfico aparece aqui. 📈
          </p>
        </Card>
      )}
    </div>
  );
}
