"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { toast } from "@/components/Toast";
import { IconBarbell, IconCheck, IconMinus, IconPlus, IconX } from "@tabler/icons-react";

type Exercicio = {
  id: string;
  nome: string;
  series: number;
  reps: number;
  carga_kg: number;
  video_url: string | null;
};

type Treino = {
  id: string;
  nome: string;
  duracao_min: number;
  observacoes: string | null;
  exercicios: Exercicio[];
};

export default function TreinoDoDia({
  alunoId,
  treino,
  concluidoHoje = false,
}: {
  alunoId: string;
  treino: Treino;
  concluidoHoje?: boolean;
}) {
  const router = useRouter();
  const [feitos, setFeitos] = useState<Set<string>>(new Set());
  const [cargas, setCargas] = useState<Record<string, number>>(
    Object.fromEntries(treino.exercicios.map((e) => [e.id, e.carga_kg]))
  );
  const [modal, setModal] = useState(false);
  const [pse, setPse] = useState(7);
  const [comentario, setComentario] = useState("");
  const [salvando, setSalvando] = useState(false);

  function alternarFeito(id: string) {
    setFeitos((cur) => {
      const novo = new Set(cur);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function mudarCarga(id: string, delta: number) {
    setCargas((cur) => ({ ...cur, [id]: Math.max(0, (cur[id] ?? 0) + delta) }));
  }

  async function concluir() {
    setSalvando(true);
    const supabase = createClient();
    const { data: log, error } = await supabase
      .from("treino_logs")
      .insert({ aluno_id: alunoId, treino_id: treino.id, pse, comentario: comentario.trim() || null })
      .select("id")
      .single();
    if (error || !log) {
      setSalvando(false);
      return toast("Erro ao registrar treino", "erro");
    }
    const execucoes = treino.exercicios
      .filter((e) => feitos.has(e.id))
      .map((e) => ({
        treino_log_id: log.id,
        exercicio_id: e.id,
        nome: e.nome,
        series: e.series,
        reps: e.reps,
        carga_kg: cargas[e.id] ?? e.carga_kg,
      }));
    if (execucoes.length > 0) {
      await supabase.from("execucoes").insert(execucoes);
    }
    setSalvando(false);
    setModal(false);
    toast("Treino registrado! 🔥");
    router.refresh();
  }

  const progresso = treino.exercicios.length
    ? Math.round((feitos.size / treino.exercicios.length) * 100)
    : 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-sm">{treino.nome}</h2>
          <p className="text-[11px] text-txt2">
            {treino.exercicios.length} exercícios · {treino.duracao_min}min
          </p>
        </div>
        <span className="text-sm font-black text-accent">{progresso}%</span>
      </div>

      <Card className="space-y-4">
        {treino.exercicios.map((ex) => {
          const feito = feitos.has(ex.id);
          return (
            <div key={ex.id} className={`border-b border-line last:border-0 pb-4 last:pb-0 ${feito ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alternarFeito(ex.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 ${
                    feito ? "bg-accent text-bg" : "bg-line text-txt2"
                  }`}
                >
                  <IconCheck size={15} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-accent2/15 flex items-center justify-center shrink-0">
                  <IconBarbell size={18} className="text-accent2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${feito ? "line-through" : ""}`}>{ex.nome}</p>
                  <p className="text-[11px] text-txt2">{ex.series}×{ex.reps}</p>
                </div>
                {ex.video_url && (
                  <a href={ex.video_url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold text-accent2 shrink-0">
                    ▶ vídeo
                  </a>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="text-[10px] text-txt2 uppercase font-bold">Carga</span>
                <button onClick={() => mudarCarga(ex.id, -2.5)}
                  className="w-7 h-7 rounded-lg bg-line flex items-center justify-center active:scale-90 transition-all duration-150">
                  <IconMinus size={13} />
                </button>
                <span className="text-sm font-black w-16 text-center">{cargas[ex.id] ?? 0}kg</span>
                <button onClick={() => mudarCarga(ex.id, 2.5)}
                  className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center active:scale-90 transition-all duration-150">
                  <IconPlus size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      {treino.observacoes && (
        <Card className="!py-3">
          <p className="text-[11px] text-txt2"><b className="text-txt">Obs. do treinador:</b> {treino.observacoes}</p>
        </Card>
      )}

      <button
        onClick={() => setModal(true)}
        disabled={concluidoHoje || feitos.size === 0}
        className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-40"
      >
        {concluidoHoje
          ? "Concluído hoje ✓"
          : `Concluir treino (${feitos.size}/${treino.exercicios.length})`}
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(false)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">Como foi o treino?</h2>
              <button onClick={() => setModal(false)}><IconX size={20} className="text-txt2" /></button>
            </div>
            <div>
              <p className="text-[11px] text-txt2 uppercase font-bold mb-2">Esforço percebido (1 = leve · 10 = máximo)</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPse(n)}
                    className={`w-9 h-9 rounded-xl text-sm font-black transition-all duration-150 ${
                      pse === n
                        ? n <= 4 ? "bg-accent text-bg" : n <= 7 ? "bg-warn text-bg" : "bg-danger text-white"
                        : "bg-line text-txt2"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="input min-h-16 resize-none"
              placeholder="Comentário para o treinador (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <button
              onClick={concluir}
              disabled={salvando}
              className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Registrar treino 🔥"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
