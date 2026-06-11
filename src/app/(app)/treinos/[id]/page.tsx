"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { Counter } from "@/components/ui/client";
import { toast } from "@/components/Toast";
import {
  IconArrowLeft,
  IconBarbell,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";

type Ex = { key: string; nome: string; series: number; reps: number; carga: number };
let seq = 0;
const uid = () => `k-${++seq}`;

export default function EditarTreinoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("funcional");
  const [nivel, setNivel] = useState("Iniciante");
  const [duracao, setDuracao] = useState(60);
  const [obs, setObs] = useState("");
  const [exs, setExs] = useState<Ex[]>([]);
  const [novoEx, setNovoEx] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("treinos")
      .select("nome, categoria, nivel, duracao_min, observacoes, exercicios(nome, series, reps, carga_kg, ordem)")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          toast("Treino não encontrado", "erro");
          router.push("/treinos");
          return;
        }
        setNome(data.nome);
        setCategoria(data.categoria);
        setNivel(data.nivel);
        setDuracao(data.duracao_min);
        setObs(data.observacoes ?? "");
        setExs(
          ((data.exercicios as any[]) ?? [])
            .sort((a, b) => a.ordem - b.ordem)
            .map((e) => ({ key: uid(), nome: e.nome, series: e.series, reps: e.reps, carga: Number(e.carga_kg) }))
        );
        setCarregando(false);
      });
  }, [params.id, router]);

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= exs.length) return;
    const copy = [...exs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setExs(copy);
  }

  function addEx() {
    if (!novoEx.trim()) return;
    setExs([...exs, { key: uid(), nome: novoEx.trim(), series: 3, reps: 12, carga: 0 }]);
    setNovoEx("");
  }

  async function salvar() {
    if (!nome.trim() || exs.length === 0) return toast("Nome e ao menos um exercício são obrigatórios", "erro");
    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("treinos")
      .update({ nome, categoria, nivel, duracao_min: duracao, observacoes: obs })
      .eq("id", params.id);
    if (error) {
      setSalvando(false);
      return toast("Erro ao salvar treino", "erro");
    }
    await supabase.from("exercicios").delete().eq("treino_id", params.id);
    const { error: e2 } = await supabase.from("exercicios").insert(
      exs.map((e, i) => ({
        treino_id: params.id,
        ordem: i + 1,
        nome: e.nome,
        series: e.series,
        reps: e.reps,
        carga_kg: e.carga,
      }))
    );
    setSalvando(false);
    if (e2) return toast("Erro ao salvar exercícios", "erro");
    toast("Treino atualizado ✓");
    router.push("/treinos");
    router.refresh();
  }

  async function excluir() {
    if (!confirm(`Excluir o treino "${nome}"? Alunos vinculados perderão o protocolo.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("treinos").delete().eq("id", params.id);
    if (error) return toast("Erro ao excluir", "erro");
    toast("Treino excluído");
    router.push("/treinos");
    router.refresh();
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 bg-card rounded-2xl animate-pulse" />
        <div className="h-12 bg-card rounded-2xl animate-pulse" />
        <div className="h-64 bg-card rounded-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/treinos" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="font-black">Editar treino</h1>
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-accent text-bg font-bold text-sm rounded-2xl px-5 py-2.5 active:scale-95 transition-all duration-150 disabled:opacity-50"
        >
          {salvando ? "..." : "Salvar"}
        </button>
      </header>

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

      <select className="input" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))}>
        <option value={30}>30 min</option>
        <option value={45}>45 min</option>
        <option value={60}>60 min</option>
        <option value={70}>70 min</option>
        <option value={90}>90 min</option>
      </select>

      <section>
        <h2 className="font-black text-sm mb-2">Exercícios ({exs.length})</h2>
        <Card className="space-y-4">
          {exs.map((ex, i) => (
            <div key={ex.key} className="border-b border-line last:border-0 pb-4 last:pb-0">
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
              </div>
              <div className="flex justify-around mt-3">
                <Counter label="Séries" initial={ex.series}
                  onChange={(v) => setExs((cur) => cur.map((e) => (e.key === ex.key ? { ...e, series: v } : e)))} />
                <Counter label="Reps" initial={ex.reps}
                  onChange={(v) => setExs((cur) => cur.map((e) => (e.key === ex.key ? { ...e, reps: v } : e)))} />
                <Counter label="Carga" initial={ex.carga} step={2.5} suffix="kg"
                  onChange={(v) => setExs((cur) => cur.map((e) => (e.key === ex.key ? { ...e, carga: v } : e)))} />
              </div>
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

      <button onClick={excluir} className="w-full flex items-center justify-center gap-2 text-danger text-sm font-bold py-2">
        <IconTrash size={16} /> Excluir treino
      </button>
    </div>
  );
}
