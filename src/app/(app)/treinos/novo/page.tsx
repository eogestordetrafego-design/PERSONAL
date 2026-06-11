"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { Counter } from "@/components/ui/client";
import {
  IconArrowLeft,
  IconBarbell,
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";

type Ex = { id: string; nome: string; series: number; reps: number; carga: number; video: string };
let seq = 2;
const uid = () => `ex-${++seq}`;

export default function BuilderPage() {
  const router = useRouter();
  const [nome, setNome] = useState("Novo Protocolo de Treino");
  const [categoria, setCategoria] = useState("funcional");
  const [nivel, setNivel] = useState("Iniciante");
  const [duracao, setDuracao] = useState(60);
  const [alunoId, setAlunoId] = useState("");
  const [alunos, setAlunos] = useState<{ id: string; nome: string }[]>([]);
  const [obs, setObs] = useState("Manter descanso de 60s entre séries. Ajustar carga conforme evolução.");
  const [exs, setExs] = useState<Ex[]>([
    { id: "ex-1", nome: "Agachamento livre", series: 4, reps: 12, carga: 20, video: "" },
    { id: "ex-2", nome: "Supino reto", series: 4, reps: 10, carga: 40, video: "" },
  ]);
  const [novoEx, setNovoEx] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("alunos")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => setAlunos(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= exs.length) return;
    const copy = [...exs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setExs(copy);
  }

  function addEx() {
    if (!novoEx.trim()) return;
    setExs([...exs, { id: uid(), nome: novoEx.trim(), series: 3, reps: 12, carga: 0, video: "" }]);
    setNovoEx("");
  }

  async function salvar() {
    if (!nome.trim() || exs.length === 0) return setErro("Dê um nome e adicione ao menos um exercício.");
    setSalvando(true);
    setErro(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: treino, error } = await supabase
      .from("treinos")
      .insert({ trainer_id: user!.id, nome, categoria, nivel, duracao_min: duracao, observacoes: obs })
      .select("id")
      .single();
    if (error || !treino) {
      setSalvando(false);
      return setErro(error?.message ?? "Erro ao salvar.");
    }
    const { error: e2 } = await supabase.from("exercicios").insert(
      exs.map((e, i) => ({
        treino_id: treino.id,
        ordem: i + 1,
        nome: e.nome,
        series: e.series,
        reps: e.reps,
        carga_kg: e.carga,
        video_url: e.video.trim() || null,
      }))
    );
    if (!e2 && alunoId) {
      await supabase.from("aluno_treinos").insert({ aluno_id: alunoId, treino_id: treino.id });
    }
    setSalvando(false);
    if (e2) return setErro(e2.message);
    router.push("/treinos");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/treinos" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="font-black">Criar treino</h1>
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-accent text-bg font-bold text-sm rounded-2xl px-5 py-2.5 active:scale-95 transition-all duration-150 disabled:opacity-50"
        >
          {salvando ? "..." : "Salvar"}
        </button>
      </header>

      {erro && <p className="text-danger text-xs">{erro}</p>}

      <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do treino" />

      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="emagrecimento">Emagrecimento</option>
          <option value="hipertrofia">Hipertrofia</option>
          <option value="funcional">Funcional</option>
          <option value="reabilitacao">Reabilitação</option>
        </select>
        <select className="input" value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option>Iniciante</option>
          <option>Intermediário</option>
          <option>Avançado</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))}>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
          <option value={70}>70 min</option>
          <option value={90}>90 min</option>
        </select>
        <select className="input" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
          <option value="">Sem aluno vinculado</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      <section>
        <h2 className="font-black text-sm mb-2">Exercícios ({exs.length})</h2>
        <Card className="space-y-4">
          {exs.map((ex, i) => (
            <div key={ex.id} className="border-b border-line last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent2/15 flex items-center justify-center shrink-0">
                  <IconBarbell size={18} className="text-accent2" />
                </div>
                <p className="flex-1 text-sm font-bold truncate">{ex.nome}</p>
                <button onClick={() => mover(i, -1)} className="text-txt2 disabled:opacity-30" disabled={i === 0}>
                  <IconArrowUp size={16} />
                </button>
                <button onClick={() => mover(i, 1)} className="text-txt2 disabled:opacity-30" disabled={i === exs.length - 1}>
                  <IconArrowDown size={16} />
                </button>
                <button onClick={() => setExs(exs.filter((_, j) => j !== i))} className="text-danger/70">
                  <IconTrash size={16} />
                </button>
                <IconGripVertical size={16} className="text-txt2/50" />
              </div>
              <div className="flex justify-around mt-3">
                <Counter label="Séries" initial={ex.series}
                  onChange={(v) => setExs(exs.map((e, j) => (j === i ? { ...e, series: v } : e)))} />
                <Counter label="Reps" initial={ex.reps}
                  onChange={(v) => setExs(exs.map((e, j) => (j === i ? { ...e, reps: v } : e)))} />
                <Counter label="Carga" initial={ex.carga} step={2.5} suffix="kg"
                  onChange={(v) => setExs(exs.map((e, j) => (j === i ? { ...e, carga: v } : e)))} />
              </div>
              <input
                className="input mt-3 !py-2.5 text-xs"
                placeholder="🎥 Link do vídeo demonstrativo (opcional)"
                value={ex.video}
                onChange={(e) => setExs((cur) => cur.map((x) => (x.id === ex.id ? { ...x, video: e.target.value } : x)))}
              />
            </div>
          ))}

          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Nome do exercício"
              value={novoEx}
              onChange={(e) => setNovoEx(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEx()}
            />
            <button
              onClick={addEx}
              className="shrink-0 border border-line rounded-2xl px-4 text-sm font-bold flex items-center gap-1 hover:bg-line/40 transition-all duration-150"
            >
              <IconPlus size={16} /> Adicionar
            </button>
          </div>
        </Card>
      </section>

      <textarea
        className="input min-h-24 resize-none"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Observações"
      />
    </div>
  );
}
