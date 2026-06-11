"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toast";
import { IconPencil, IconScale, IconTrash, IconX } from "@tabler/icons-react";

type Aluno = {
  id: string;
  nome: string;
  objetivo: string | null;
  plano: string;
  valor_mensalidade: number;
  status: string;
  altura_cm: number | null;
  meta_peso_kg: number | null;
};

export default function AlunoTools({ aluno }: { aluno: Aluno }) {
  const router = useRouter();
  const [modal, setModal] = useState<"medida" | "editar" | null>(null);
  const [salvando, setSalvando] = useState(false);

  // medida
  const [peso, setPeso] = useState("");
  const [gordura, setGordura] = useState("");

  // editar
  const [form, setForm] = useState({
    nome: aluno.nome,
    objetivo: aluno.objetivo ?? "",
    plano: aluno.plano,
    valor: Number(aluno.valor_mensalidade),
    status: aluno.status,
    altura: aluno.altura_cm ?? 0,
    meta: aluno.meta_peso_kg ?? 0,
  });

  async function salvarMedida(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(peso.replace(",", "."));
    if (!p || p <= 0) return toast("Informe um peso válido", "erro");
    setSalvando(true);
    const supabase = createClient();
    const imc = aluno.altura_cm ? +(p / Math.pow(aluno.altura_cm / 100, 2)).toFixed(1) : null;
    const g = gordura ? parseFloat(gordura.replace(",", ".")) : null;
    const { error } = await supabase.from("medidas").insert({
      aluno_id: aluno.id,
      peso_kg: p,
      gordura_pct: g,
      imc,
    });
    setSalvando(false);
    if (error) return toast("Erro ao salvar medida", "erro");
    toast("Medida registrada ✓");
    setModal(null);
    setPeso("");
    setGordura("");
    router.refresh();
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("alunos")
      .update({
        nome: form.nome,
        objetivo: form.objetivo || null,
        plano: form.plano,
        valor_mensalidade: form.valor,
        status: form.status,
        altura_cm: form.altura || null,
        meta_peso_kg: form.meta || null,
      })
      .eq("id", aluno.id);
    setSalvando(false);
    if (error) return toast("Erro ao salvar", "erro");
    toast("Aluno atualizado ✓");
    setModal(null);
    router.refresh();
  }

  async function excluir() {
    if (!confirm(`Excluir ${aluno.nome}? Todas as medidas, sessões e mensagens serão removidas.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("alunos").delete().eq("id", aluno.id);
    if (error) return toast("Erro ao excluir", "erro");
    toast("Aluno excluído");
    router.push("/alunos");
    router.refresh();
  }

  const planos: Record<string, number> = { basico: 299, pro: 499, premium: 799, vip: 1099 };

  return (
    <>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setModal("medida")}
          className="flex items-center gap-1.5 text-xs font-bold bg-accent/15 text-accent rounded-full px-4 py-2 active:scale-95 transition-all duration-150"
        >
          <IconScale size={15} /> Nova medida
        </button>
        <button
          onClick={() => setModal("editar")}
          className="flex items-center gap-1.5 text-xs font-bold bg-card border border-line text-txt2 rounded-full px-4 py-2 active:scale-95 transition-all duration-150"
        >
          <IconPencil size={15} /> Editar
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(null)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-3 max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">{modal === "medida" ? "Registrar medida" : "Editar aluno"}</h2>
              <button onClick={() => setModal(null)}><IconX size={20} className="text-txt2" /></button>
            </div>

            {modal === "medida" ? (
              <form onSubmit={salvarMedida} className="space-y-3">
                <input
                  className="input"
                  inputMode="decimal"
                  placeholder="Peso (kg) — ex: 72,4"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  required
                />
                <input
                  className="input"
                  inputMode="decimal"
                  placeholder="% Gordura (opcional)"
                  value={gordura}
                  onChange={(e) => setGordura(e.target.value)}
                />
                {aluno.altura_cm ? (
                  <p className="text-[11px] text-txt2">IMC calculado automaticamente (altura {aluno.altura_cm}cm).</p>
                ) : (
                  <p className="text-[11px] text-warn">Sem altura cadastrada — IMC não será calculado.</p>
                )}
                <button disabled={salvando} className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
                  {salvando ? "Salvando..." : "Registrar"}
                </button>
              </form>
            ) : (
              <form onSubmit={salvarEdicao} className="space-y-3">
                <input className="input" required value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome" />
                <input className="input" value={form.objetivo}
                  onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="Objetivo" />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={form.plano}
                    onChange={(e) => setForm({ ...form, plano: e.target.value, valor: planos[e.target.value] ?? form.valor })}>
                    <option value="basico">Básico</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                  <select className="input" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ativo">Ativo</option>
                    <option value="novo">Novo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="number" min={0} value={form.altura || ""}
                    onChange={(e) => setForm({ ...form, altura: Number(e.target.value) })} placeholder="Altura (cm)" />
                  <input className="input" type="number" min={0} step="0.1" value={form.meta || ""}
                    onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })} placeholder="Meta de peso (kg)" />
                </div>
                <button disabled={salvando} className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
                <button type="button" onClick={excluir}
                  className="w-full flex items-center justify-center gap-2 text-danger text-sm font-bold py-2">
                  <IconTrash size={16} /> Excluir aluno
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
